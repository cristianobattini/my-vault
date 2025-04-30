import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, StyleSheet, TouchableOpacity, Image, View, Modal } from 'react-native';
import { useQuery, useRealm } from '@realm/react';
import { Credential } from '@/models/Credential';
import { Tag } from '@/models/Tag';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import CredentialCard from '@/components/CredentialCard';
import { useThemeColor } from '@/hooks/useThemeColor';
import BottomSheet from '@/components/BottomSheet';
import Input from '@/components/Input';
import { useForm, Controller } from 'react-hook-form';
import { create } from 'react-test-renderer';

const Index = () => {
    const realm = useRealm();
    const credentials = useQuery(Credential);
    const tags = useQuery(Tag);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [createNewCredential, setCreateNewCredential] = useState<boolean>(false);
    const { control, handleSubmit, formState: { errors } } = useForm();

    // Filter credentials by the selected tag
    interface FilteredCredentials {
        filtered: (filterFn: (credential: Credential) => boolean) => Realm.Results<Credential>;
    }

    interface FilteredTags {
        filtered: (query: string, ...args: unknown[]) => Realm.Results<Tag>;
    }

    const filteredCredentials: Realm.Results<Credential> = selectedTag
        ? (credentials as unknown as FilteredCredentials).filtered((credential) =>
            (tags as FilteredTags)
                .filtered(`_id == $0`, selectedTag)[0]
                ?.credentialIds.some((id) => id.equals(credential._id))
        )
        : credentials;


    const createNewCredentialFunc = (cred: Credential) => {
        realm.write(() => {
            realm.create(Credential.schema.name, cred);
        });
    };

    const handleCreateNewCredential = (data: any) => {
        createNewCredentialFunc({
            _id: new Realm.BSON.ObjectId(),
            title: data.title,
            username: data.username,
            password: data.password,
            url: '',
            notes: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            isFavorite: false,
            isArchived: false,
        } as Credential);

        setCreateNewCredential(false);
    }

    const toggleCreateNewCredential = () => {
        setCreateNewCredential(!createNewCredential);
    };

    return (
        <>
            <BottomSheet
                visible={createNewCredential}
                onRequestClose={toggleCreateNewCredential}
            >
                <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center' }}>
                    <Controller control={control} name='title' rules={{ required: 'You must enter credential\'s title' }}
                        render={({ field: { onChange, value } }) => {
                            return (
                                <Input
                                    label={'title'}
                                    placeholder='credential'
                                    iconName={'tag'}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )
                        }} />
                    {errors.title && <Text style={styles.errorText}>{errors.title.message as string}</Text>}

                    <Controller control={control} name='username' rules={{ required: 'You must enter credential\'s username' }}
                        render={({ field: { onChange, value } }) => {
                            return (
                                <Input
                                    label={'username / email'}
                                    placeholder='username@email.com'
                                    iconName='user'
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )
                        }} />
                    {errors.username && <Text style={styles.errorText}>{errors.username.message as string}</Text>}


                    <Controller control={control} name='password' rules={{ required: 'You must enter credential\'s password' }}
                        render={({ field: { onChange, value } }) => {
                            return (
                                <Input
                                    label={'password'}
                                    placeholder='p@55w0rd'
                                    passwordVisibility={true}
                                    iconName='key'
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )
                        }
                        } />
                    {errors.password && <Text style={styles.errorText}>{errors.password.message as string}</Text>}


                    <View style={styles.buttonsContainer}>
                        <View style={[styles.formButton, { backgroundColor: 'green' }]}>
                            <TouchableOpacity onPress={handleSubmit(handleCreateNewCredential)}>
                                <ThemedText type="subtitle">Create</ThemedText>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.formButton, { backgroundColor: 'red' }]}>
                            <TouchableOpacity onPress={toggleCreateNewCredential}>
                                <ThemedText type="subtitle">Cancel</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </BottomSheet>

            {/* Main View */}
            <ThemedView>
                <View style={styles.header}>
                    <ThemedText type="title">
                        MyVault
                    </ThemedText>
                    <TouchableOpacity onPress={toggleCreateNewCredential}>
                        <FontAwesome name="plus" size={24} color={useThemeColor({ light: '#000', dark: '#fff' }, "text")} />
                    </TouchableOpacity>
                </View>

                {/* Tag List */}
                <FlatList
                    data={tags}
                    horizontal
                    keyExtractor={(item) => item._id.toHexString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.tagItem,
                                selectedTag === item._id.toHexString() && styles.selectedTag,
                            ]}
                            onPress={() =>
                                setSelectedTag(
                                    selectedTag === item._id.toHexString() ? null : item._id.toHexString()
                                )
                            }
                        >
                            <Text style={styles.tagText}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                    style={styles.tagList}
                />

                {/* Credential List or Empty State */}
                {filteredCredentials.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Image
                            source={require('@/assets/images/empty.svg')} // TODO: fix it, it does not show the image
                            style={styles.emptyImage}
                        />
                        <ThemedText type="subtitle">
                            Nessuna credenziale trovata
                        </ThemedText>
                    </View>
                ) : (
                    <FlatList
                        data={filteredCredentials}
                        keyExtractor={(item) => item._id.toHexString()}
                        numColumns={2} // Display up to 2 cards per row
                        columnWrapperStyle={styles.row} // Add spacing between rows
                        renderItem={({ item }) => {
                            // Determine the span based on the length of the title or username
                            const span = item.title.length <= 10 && item.username.length <= 10 ? 1 : 2;

                            return (
                                <View
                                    style={[
                                        styles.cardContainer,
                                        span === 2 && styles.fullWidthCard, // Adjust style for 2-column span
                                    ]}
                                >
                                    <CredentialCard item={item} />
                                </View>
                            );
                        }}
                    />
                )}
            </ThemedView>
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
    },
    tagList: {
        marginBottom: 20,
    },
    tagItem: {
        padding: 10,
        marginRight: 10,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
    },
    selectedTag: {
        backgroundColor: '#007bff',
    },
    tagText: {
        color: '#fff',
    },
    credentialItem: {
        marginBottom: 15,
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
    },
    username: {
        color: '#555',
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyImage: {
        width: 200,
        height: 200,
        marginBottom: 20,
        resizeMode: 'contain',
    },
    row: {
        justifyContent: 'space-between',
    },
    cardContainer: {
        flex: 1,
        margin: 5,
    },
    fullWidthCard: {
        flex: 1,
    },
    buttonsContainer: {
        flexDirection: 'row',
        flex: 1,
        marginTop: 20,
        marginBottom: 25,
    },
    formButton: {
        paddingVertical: 8,
        marginHorizontal: 10,
        width: '40%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
    },
});

export default Index;