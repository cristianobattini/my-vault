import Realm, { BSON } from 'realm';
import CryptoJS from 'crypto-js';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Credential } from '@/models/Credential';
import { Tag } from '@/models/Tag';
import * as SecureStore from 'expo-secure-store';
import * as Application from 'expo-application';
import { getRandomBytes } from 'expo-crypto';


class RealmDataService {
    private static SALT: string | null = null;
    private static readonly ITERATIONS = 1000; // PBKDF2 iterations

    // Initialize the salt (call this once when app starts)
    static async initializeSalt() {
        // Try to get existing salt
        let salt = await SecureStore.getItemAsync('appEncryptionSalt');

        if (!salt) {
            // Create new salt combining:
            // 1. Random bytes
            // 2. Device-specific ID
            // 3. Hardcoded component
            const randomPart = getRandomBytes(16).toString();
            const devicePart = Application.getAndroidId || (await Application.getIosIdForVendorAsync()) || '';
            const staticPart = process.env.APP_ENCRYPTION_SALT_BASE;


            salt = `${staticPart}${devicePart}${randomPart}`.substring(0, 32);
            await SecureStore.setItemAsync('appEncryptionSalt', salt);
        }

        this.SALT = salt;
    }

    private static async getSalt(): Promise<string> {
        if (!this.SALT) {
            await this.initializeSalt();
        }
        return this.SALT!;
    }

    /**
     * Export Realm data to an encrypted JSON file
     * @param realm Realm instance
     * @param password User-provided password for encryption
     * @returns Promise with file URI
     */
    static async exportData(realm: Realm, password: string): Promise<string> {
        try {
            // 1. Extract all data from Realm
            const credentials = realm.objects<Credential>('Credential');
            const tags = realm.objects<Tag>('Tag');

            // Convert Realm objects to plain objects
            const data = {
                credentials: credentials.map(c => this.realmObjectToPlain(c)),
                tags: tags.map(t => this.realmObjectToPlain(t)),
                exportedAt: new Date().toISOString(),
            };

            // 2. Encrypt the password with additional protection
            const encryptedPassword = this.encryptPassword(password);

            // 3. Encrypt the data with the user's password
            const encryptedData = this.encryptData(JSON.stringify(data), password);

            // 4. Combine encrypted password and data
            const exportPackage = {
                encryptedPassword,
                encryptedData,
                version: '1.0',
            };

            // 5. Save to file
            const fileName = `credentials_export_${new Date().toISOString().split('T')[0]}.secure`;
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;

            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(exportPackage), {
                encoding: FileSystem.EncodingType.UTF8,
            });

            return fileUri;
        } catch (error) {
            console.error('Export failed:', error);
            throw new Error('Failed to export data');
        }
    }

    /**
     * Import data from encrypted file
     * @param realm Realm instance
     * @param fileUri URI of the file to import
     * @param password User-provided password for decryption
     */
    static async importData(realm: Realm, fileUri: string, password: string): Promise<void> {
        try {
            // 1. Read the file
            const fileContent = await FileSystem.readAsStringAsync(fileUri);
            const exportPackage = JSON.parse(fileContent);

            // 2. Verify the password
            const decryptedStoredPassword = this.decryptData(exportPackage.encryptedPassword, password);
            if (decryptedStoredPassword !== password) {
                throw new Error('Invalid password');
            }

            // 3. Decrypt the data
            const decryptedData = this.decryptData(exportPackage.encryptedData, password);
            const data = JSON.parse(decryptedData);

            // 4. Import into Realm
            realm.write(() => {
                // Clear existing data if needed (optional)
                // realm.deleteAll();

                // Import tags first (since credentials reference them)
                const tagMap = new Map<string, Tag>();
                data.tags.forEach((tagData: any) => {
                    const tag = realm.create<Tag>('Tag', {
                        _id: new BSON.ObjectId(tagData._id),
                        name: tagData.name,
                        colorHex: tagData.colorHex,
                        iconName: tagData.iconName,
                    });
                    tagMap.set(tagData._id, tag);
                });

                // Import credentials
                data.credentials.forEach((credData: any) => {
                    const credential = realm.create<Credential>('Credential', {
                        _id: new BSON.ObjectId(credData._id),
                        title: credData.title,
                        username: credData.username,
                        password: credData.password,
                        url: credData.url,
                        notes: credData.notes,
                        createdAt: new Date(credData.createdAt),
                        updatedAt: new Date(credData.updatedAt),
                        isFavorite: credData.isFavorite,
                        isArchived: credData.isArchived,
                    });

                    // Re-establish tag relationships
                    if (credData.tags && credData.tags.length > 0) {
                        credData.tags.forEach((tagId: string) => {
                            const tag = tagMap.get(tagId);
                            if (tag) {
                                tag.credentials.push(credential);
                            }
                        });
                    }
                });
            });
        } catch (error) {
            console.error('Import failed:', error);
            throw new Error('Failed to import data. Check your password and file.');
        }
    }

    /**
     * Share the exported file
     * @param fileUri URI of the file to share
     */
    static async shareExportedFile(fileUri: string): Promise<void> {
        if (!(await Sharing.isAvailableAsync())) {
            throw new Error('Sharing not available on this device');
        }

        await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'Share Encrypted Credentials',
            UTI: 'public.json',
        });
    }

    /**
     * Convert Realm object to plain JavaScript object
     * @param obj Realm object
     * @returns Plain object
     */
    private static realmObjectToPlain(obj: any): any {
        const plainObj: any = {};
        Object.keys(obj.schema.properties).forEach(prop => {
            // Handle ObjectId and Date specially
            if (prop === '_id') {
                plainObj[prop] = obj[prop].toHexString();
            } else if (obj[prop] instanceof Date) {
                plainObj[prop] = obj[prop].toISOString();
            } else if (Array.isArray(obj[prop])) {
                // Handle relationships (simplified - just store IDs)
                plainObj[prop] = obj[prop].map((item: any) => item._id.toHexString());
            } else {
                plainObj[prop] = obj[prop];
            }
        });
        return plainObj;
    }

    /**
     * Encrypt data with password
     * @param data Data to encrypt
     * @param password Encryption password
     * @returns Encrypted data as string
     */
    private static encryptData(data: string, password: string): string {
        const salt = CryptoJS.lib.WordArray.random(128 / 8);
        const key = CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: this.ITERATIONS,
        });
        const iv = CryptoJS.lib.WordArray.random(128 / 8);

        const encrypted = CryptoJS.AES.encrypt(data, key, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC,
        });

        // Combine salt, iv, and encrypted data
        return salt.toString() + iv.toString() + encrypted.toString();
    }

    /**
     * Decrypt data with password
     * @param encryptedData Encrypted data
     * @param password Decryption password
     * @returns Decrypted data
     */
    private static decryptData(encryptedData: string, password: string): string {
        // Extract salt (first 32 chars)
        const salt = CryptoJS.enc.Hex.parse(encryptedData.substring(0, 32));
        // Extract iv (next 32 chars)
        const iv = CryptoJS.enc.Hex.parse(encryptedData.substring(32, 64));
        // The rest is the actual encrypted data
        const encrypted = encryptedData.substring(64);

        const key = CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: this.ITERATIONS,
        });

        const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7,
            mode: CryptoJS.mode.CBC,
        });

        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    /**
     * Encrypt the password for additional protection
     * @param password Password to encrypt
     * @returns Encrypted password
     */
    private static async encryptPassword(password: string): Promise<string> {
        const salt = await this.getSalt();
        return CryptoJS.AES.encrypt(
            password,
            CryptoJS.PBKDF2(password, salt, { keySize: 256 / 32, iterations: this.ITERATIONS })
        ).toString();
    }
}

export default RealmDataService;