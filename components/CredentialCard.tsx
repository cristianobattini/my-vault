import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableWithoutFeedbackComponent, TouchableHighlight, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { Credential } from '@/models/Credential';
import { useRealm } from '@realm/react';
import { Octicons } from '@expo/vector-icons';

const CredentialCard = ({ item }: { item: Credential }) => {
    const realm = useRealm();
    const [ cred, setCred ] = useState(item)

    const toggleFavorite = () => {
        realm.write(() => {
            const credential = realm.objectForPrimaryKey<Credential>('Credential', item._id);
            if (credential) {
                credential.isFavorite = !credential.isFavorite;
            }
        });
    };
    
    const toggleArchived = () => {
        realm.write(() => {
            const credential = realm.objectForPrimaryKey<Credential>('Credential', item._id);
            if (credential) {
                credential.isArchived = !credential.isArchived;
            }
        });
    };

    return (
        <View style={styles.card}>
            <View style={styles.leftContent}>
                <Image
                    source={require('@/assets/images/key.png')}
                    style={styles.keyImage}
                />
                <View style={styles.textContainer}>
                    <ThemedText type='subtitle'>{item.title}</ThemedText>
                    <ThemedText type='default'>{item.username}</ThemedText>
                </View>
            </View>
            <TouchableOpacity onPress={toggleFavorite}>
                <Octicons name={cred.isFavorite ? 'heart-fill' : 'heart'} color={'red'} size={20} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f0f0f010',
        borderRadius: 8,
        padding: 10,
        marginBottom: 2,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    textContainer: {
        gap: 10,
        flexDirection: 'row'
    },
    keyImage: {
        width: 24,
        height: 24,
    },
});

export default CredentialCard;