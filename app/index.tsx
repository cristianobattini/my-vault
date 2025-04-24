import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, StyleSheet, TouchableOpacity, Image, View } from 'react-native';
import { useQuery, useRealm } from '@realm/react';
import { Credential } from '@/models/Credential';
import { Tag } from '@/models/Tag';
import { create } from 'react-test-renderer';
import CredentialCard from '@/components/CredentialCard';

const Index = () => {
    const realm = useRealm();
    const credentials = useQuery(Credential);
    const tags = useQuery(Tag);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

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

    const createMockCredential = () => {
        realm.write(() => {
            realm.create(Credential.schema.name, {
                _id: new Realm.BSON.ObjectId(),
                title: 'Linkedin Second Test Title To See if it works',
                username: 'cristiano.battini@gmail.com',
                password: 'password123',
                url: 'https://www.linked.com',
                notes: 'Some notes about Linkedin',
                createdAt: new Date(),
                updatedAt: new Date(),
                isFavorite: false,
                isArchived: false,
            });
        });
    };

    useEffect(() => {
        // createMockCredential();

    }
        , []);

    return (
        <ThemedView>
            <View style={{ justifyContent: 'space-between' }}>
                <ThemedText type="title">
                    MyVault
                </ThemedText>
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
    );
};

const styles = StyleSheet.create({
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
});

export default Index;