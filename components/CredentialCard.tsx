import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { Credential } from '@/models/Credential';

const CredentialCard = ({item}: {item: Credential}) => {
    return (
        <View style={styles.card}>
                <Image source={require('@/assets/images/key.png')} style={styles.keyImage} />
            <View style={styles.cardHeader}>
                <ThemedText type='subtitle'>{item.title}</ThemedText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // TODO: adjust the text title
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f010',
        borderRadius: 8,
        padding: 10,
        marginBottom: 2,
    },
    cardHeader: {
        marginLeft: 10,
        flexDirection: 'column',
    },
    keyImage: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
});

export default CredentialCard;