import FavoritesToggle from '@/components/FavoritesToggle';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Octicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const Settings = () => {
    const navigation = useNavigation()

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => {
                        navigation.dispatch({ type: 'POP_TO_TOP' })
                    }}>
                        <Octicons size={28} name='chevron-left' />
                    </TouchableOpacity>
                    <ThemedText type='title'>Settings</ThemedText>
                </View>
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
});

export default Settings;