import Realm, { BSON } from "realm";
import { Tag } from './Tag';

export class Credential extends Realm.Object {
    _id!: BSON.ObjectId;
    title!: string;
    username!: string;
    password!: string;
    url!: string;
    notes!: string;
    createdAt!: Date;
    updatedAt!: Date;
    isFavorite!: boolean;
    isArchived!: boolean;
    tags!: Realm.List<Tag>;  // relationship to tags

    static schema: Realm.ObjectSchema = {
        name: "Credential",
        primaryKey: "_id",
        properties: {
            _id: "objectId",
            title: "string",
            username: "string",
            password: "string",
            url: "string",
            notes: "string",
            createdAt: "date",
            updatedAt: "date",
            isFavorite: "bool",
            isArchived: "bool",
            tags: {
                type: 'linkingObjects',
                objectType: 'Tag',
                property: 'credentials'
            }
        },
    };

    // Method to toggle favorite status
    toggleFavorite(realm: Realm) {
        realm.write(() => {
            this.isFavorite = !this.isFavorite;
            this.updatedAt = new Date();
        });
    }

    // Method to archive the credential
    archive(realm: Realm) {
        realm.write(() => {
            this.isArchived = true;
            this.updatedAt = new Date();
        });
    }

    // Method to unarchive the credential
    unarchive(realm: Realm) {
        realm.write(() => {
            this.isArchived = false;
            this.updatedAt = new Date();
        });
    }

    // Add a tag to the credential
    addTag(realm: Realm, tag: Tag) {
        realm.write(() => {
            tag.addCredential(realm, this);
            this.updatedAt = new Date();
        });
    }

    // Remove a tag from the credential
    removeTag(realm: Realm, tag: Tag) {
        realm.write(() => {
            tag.removeCredential(realm, this);
            this.updatedAt = new Date();
        });
    }
}