import { useThemeColor } from '@/hooks/useThemeColor';
import { FontAwesome } from '@expo/vector-icons';
import React, { useState } from 'react';
import { View, StyleSheet, Modal, Animated, TouchableOpacity } from 'react-native';
import { ThemedView } from './ThemedView';

interface BottomSheetProps {
    visible: boolean;
    children: React.ReactElement;
    onRequestClose: () => void;
}

const BottomSheet = ({ visible, children, onRequestClose }: BottomSheetProps) => {
    const [animatedValue] = useState(new Animated.Value(0)); 

    React.useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: visible ? 1 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    const translateY = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [300, 0], 
    });

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onRequestClose}>
            <View style={styles.modalContainer}>
                <Animated.View
                    style={[styles.modalForm, { transform: [{ translateY }] }]}
                >
                    <TouchableOpacity>
                        <FontAwesome size={24} onPress={onRequestClose} name="close" style={{ color: '#000', alignSelf: 'flex-end' }} />
                    </TouchableOpacity>
                    {children}
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        display: 'flex',
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    modalForm: {
        backgroundColor: "#fff", // TODO: fix for theme
        height: '55%',
        width: '100%',
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 20,
        shadowColor: '#000', // TODO: fix for theme
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.10,
        shadowRadius: 10,
        elevation: 10,
    },
});

export default BottomSheet;