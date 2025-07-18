import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { Credential } from '@/models/Credential';
import { useRealm } from '@realm/react';
import { Octicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useThemeColor } from '@/hooks/useThemeColor';


const CredentialCard = ({ item }: { item: Credential }) => {
    const realm = useRealm();

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

    // TODO: take this out of the component
    // TODO:implement delete func
    const LeftActions = () => (
        <TouchableOpacity style={styles.deleteButton} onPress={() => alert('Eliminato')}>
            <Octicons name='trash' size={24} color={'white'} />
        </TouchableOpacity>
    );

    const RightActions = () => (
        <TouchableOpacity style={styles.archiveButton} onPress={toggleArchived}>
            <Octicons name='archive' size={24} color={'white'} />
        </TouchableOpacity>
    );

    return (
        <GestureHandlerRootView>
            <Swipeable renderRightActions={RightActions} renderLeftActions={LeftActions}>
                <View style={[styles.card, { backgroundColor: useThemeColor({ light: '#fff', dark: '#000' }, 'text') }]}>
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
                        <Octicons name={item.isFavorite ? 'heart-fill' : 'heart'} color={'red'} size={20} />
                    </TouchableOpacity>
                </View>
            </Swipeable>
        </GestureHandlerRootView >
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    deleteButton: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'flex-end',
        borderRadius: 8,
        marginBottom: 2,
        paddingHorizontal: 20,
    },
    deleteText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    archiveButton: {
        backgroundColor: 'orange',
        justifyContent: 'center',
        alignItems: 'flex-end',
        borderRadius: 8,
        marginBottom: 2,
        paddingHorizontal: 20,
    },
    archiveText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default CredentialCard;