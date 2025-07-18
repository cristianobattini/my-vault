import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useQuery, useRealm } from '@realm/react';
import { Credential } from '@/models/Credential';
import { Tag } from '@/models/Tag';
import CredentialCard from '@/components/CredentialCard';
import BottomSheet from '@/components/BottomSheet';
import Input from '@/components/Input';
import { useForm, Controller } from 'react-hook-form';
import FloatingButton from '@/components/FloatingButton';
import { KeyboardAvoidingProvider } from '@/components/store/KeyboardAvoidingProvider';
import { BSON } from 'realm';
import ColorPicker from '@/components/ColorPickers';
import { Octicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import FloatingMenuButton from '@/components/FloatingButton';

const Index = () => {
    const realm = useRealm();
    const credentials = useQuery(Credential);
    const tags = useQuery(Tag);
    const [selectedTag, setSelectedTag] = useState<BSON.ObjectId | null>(null);
    const [showCredentialSheet, setShowCredentialSheet] = useState(false);
    const [showTagSheet, setShowTagSheet] = useState(false);
    const [selectedColor, setSelectedColor] = useState('#808080');

    const { control: credentialControl, handleSubmit: handleCredentialSubmit, reset: resetCredentialForm } = useForm();
    const { control: tagControl, handleSubmit: handleTagSubmit, reset: resetTagForm } = useForm();

    // Filtra le credenziali per tag selezionato
    const filteredCredentials = selectedTag
        ? credentials.filtered('ANY tags._id == $0', selectedTag)
        : credentials;



    const handleCreateNewCredential = (data: any) => {
        realm.write(() => {
            const newCredential = realm.create(Credential, {
                _id: new BSON.ObjectId(),
                title: data.title,
                username: data.username,
                password: data.password,
                url: data.url || '',
                notes: data.notes || '',
                createdAt: new Date(),
                updatedAt: new Date(),
                isFavorite: false,
                isArchived: false,
            });

            if (selectedTag) {
                const tag = realm.objectForPrimaryKey<Tag>(Tag, selectedTag);
                if (tag) {
                    tag.credentials.push(newCredential);
                }
            }
        });
        setShowCredentialSheet(false)
    };

    const handleCreateTag = (data: any) => {
        realm.write(() => {
            realm.create(Tag, {
                _id: new BSON.ObjectId(),
                name: data.name,
                colorHex: selectedColor,
                credentials: [],
            });
        });
        setShowTagSheet(false)
    };

    return (
        <KeyboardAvoidingProvider>
            {/* Create new credential BottomSheet */}
            <BottomSheet
            heightPrecentile={0.55}
                visible={showCredentialSheet}
                onRequestClose={() => setShowCredentialSheet(false)}
            >
                <View style={styles.sheetContainer}>
                    <Controller
                        control={credentialControl}
                        name="title"
                        rules={{ required: "Inserisci un titolo" }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label={'Titolo'}
                                placeholder="Nome della credenziale"
                                iconName={'tag'}
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                    />

                    <Controller
                        control={credentialControl}
                        name="username"
                        rules={{ required: "Inserisci username/email" }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label={'Username/Email'}
                                placeholder="user@example.com"
                                iconName="user"
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                    />

                    <Controller
                        control={credentialControl}
                        name="password"
                        rules={{ required: "Inserisci una password" }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label={'Password'}
                                placeholder="••••••••"
                                passwordVisibility={true}
                                iconName="key"
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                    />

                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton]}
                            onPress={handleCredentialSubmit(handleCreateNewCredential)}
                        >
                            <ThemedText style={styles.buttonText}>Crea</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={() => setShowCredentialSheet(false)}
                        >
                            <ThemedText style={styles.buttonText}>Annulla</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </BottomSheet>

            {/* Create new tag BottomSheet */}
            <BottomSheet
            heightPrecentile={0.40}
                visible={showTagSheet}
                onRequestClose={() => setShowTagSheet(false)}
            >
                <View style={styles.sheetContainer}>
                    <Controller
                        control={tagControl}
                        name="name"
                        rules={{ required: "Inserisci un nome per il tag" }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                label={'Nome Tag'}
                                placeholder="Lavoro, Personale, etc."
                                iconName={'tag'}
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                    />

                    <View style={{ marginVertical: 15 }}>
                        <ThemedText type="defaultSemiBold" style={{ marginBottom: 8 }}>
                            Seleziona un colore
                        </ThemedText>
                        <ColorPicker
                            selectedColor={selectedColor}
                            onColorSelect={setSelectedColor}
                        />
                    </View>

                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton]}
                            onPress={handleTagSubmit(handleCreateTag)}
                        >
                            <ThemedText style={styles.buttonText}>Crea Tag</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={() => setShowTagSheet(false)}
                        >
                            <ThemedText style={styles.buttonText}>Annulla</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </BottomSheet>

            {/* Main */}
            <ThemedView style={styles.container}>
                <View style={styles.header}>
                    <ThemedText type="title">MyVault</ThemedText>
                </View>

                {/* Tags list */}
                <View style={styles.tagSection}>
                    <FlatList
                        horizontal
                        data={tags}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => setSelectedTag(item._id)}
                                style={[
                                    styles.tagItem,
                                    selectedTag?.equals(item._id) && styles.selectedTag,
                                    { backgroundColor: item.colorHex }
                                ]}
                            >
                                {selectedTag?.equals(item._id) ? <Octicons name='check' size={20} color={'#fff'} /> : null}
                                <ThemedText style={styles.tagText}>{item.name}</ThemedText>
                            </TouchableOpacity>
                        )}
                    >
                        
                    </FlatList>
                    {selectedTag == null ? null : <TouchableOpacity onPress={() => setSelectedTag(null)}><Octicons name='x' color={'#000'} size={24} /></TouchableOpacity>}
                </View>

                {/* Credentials list */}
                {filteredCredentials.length === 0 ? (
                    <View style={styles.emptyState}>
                        <ThemedText type="subtitle">Nessuna credenziale trovata</ThemedText>
                    </View>
                ) : (
                    <FlatList
                        data={filteredCredentials}
                        keyExtractor={(item) => item._id.toHexString()}
                        contentContainerStyle={styles.credentialList}
                        renderItem={({ item }) => (
                                <CredentialCard item={item} />
                        )}
                    />
                )}
            </ThemedView>

            <FloatingMenuButton
                mainButtonColor="#FF6B6B"
                actions={[
                    {
                        iconName: "key",
                        label: "Credential",
                        onPress: () => setShowCredentialSheet(true),
                        color: "#4ECDC4"
                    },
                    {
                        iconName: "tag",
                        label: "Tag",
                        onPress: () => setShowTagSheet(true),
                        color: "#45B7D1"
                    },
                ]}
            />
        </KeyboardAvoidingProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
    },
    sheetContainer: {
        flex: 1,
        paddingBottom: 20,
        paddingHorizontal: 16,
    },
    tagSection: {
        marginVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 5
    },
    tagListContent: {
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    tagItem: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 40,
    },
    addTagButton: {
        backgroundColor: '#3a3a3a',
    },
    selectedTag: {
        borderWidth: 2,
        borderColor: 'black',
    },
    tagText: {
        color: 'white',
        marginLeft: 6,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    credentialList: {
        padding: 8,
    },
    credentialRow: {
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    credentialCard: {
        flex: 1,
        maxWidth: '48%',
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 12,
    },
    button: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: '#007AFF',
    },
    secondaryButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
    },
});

export default Index;