import React from 'react';
import { View, Image, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { Credential } from '@/models/Credential';
import { useRealm } from '@realm/react';
import { Octicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { RectButton } from 'react-native-gesture-handler';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Link } from 'expo-router';

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

    const handleDeleteCredential = () => {
        realm.write(() => {
            const credential = realm.objectForPrimaryKey<Credential>('Credential', item._id);
            if (credential) {
                realm.delete(credential);
            }
        });
    };

    const renderLeftActions = (progress: any, dragX: any) => {
        const trans = dragX.interpolate({
            inputRange: [0, 50, 100],
            outputRange: [-20, 0, 0],
        });
        return (
            <RectButton
                style={styles.deleteButton}
                onPress={handleDeleteCredential}
            >
                <View style={styles.actionContent}>
                    <Octicons name='trash' size={24} color={'white'} />
                </View>
            </RectButton>
        );
    };

    const renderRightActions = (progress: any, dragX: any) => {
        return (
            <RectButton
                style={styles.archiveButton}
                onPress={toggleArchived}
            >
                <View style={styles.actionContent}>
                    <Octicons name='archive' size={24} color={'white'} />
                </View>
            </RectButton>
        );
    };

    return (
        <Swipeable
            renderLeftActions={renderLeftActions}
            renderRightActions={renderRightActions}
            leftThreshold={30}
            rightThreshold={30}
        >
            <View style={[styles.card, { backgroundColor: useThemeColor({ light: '#fff', dark: '#000' }, 'text') }]}>
                <Link href={{
                    pathname: "/credential-detail",
                    params: { id: item._id.toString() }
                }} >
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
                </Link>
                <TouchableOpacity onPress={toggleFavorite}>
                    <Octicons name={item.isFavorite ? 'star-fill' : 'star'} color={'orange'} size={26} />
                </TouchableOpacity>
            </View>
        </Swipeable>
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
        width: 70,
    },
    archiveButton: {
        backgroundColor: 'orange',
        justifyContent: 'center',
        alignItems: 'flex-start',
        borderRadius: 8,
        marginBottom: 2,
        width: 70,
    },
    actionContent: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CredentialCard;