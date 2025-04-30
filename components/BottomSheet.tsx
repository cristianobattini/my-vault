import { useThemeColor } from '@/hooks/useThemeColor';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { View, StyleSheet, Modal, Animated, TouchableOpacity } from 'react-native';

interface BottomSheetProps {
    visible: boolean;
    children: React.ReactElement;
    onRequestClose: () => void;
}

const BottomSheet = ({ visible, children, onRequestClose }: BottomSheetProps) => {

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onRequestClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalForm}>
                    <TouchableOpacity>
                        <FontAwesome size={24} onPress={onRequestClose} name='close' style={{color: useThemeColor({light: '#000', dark: '#ccc'}, 'text'), alignSelf: 'flex-end'}} />
                    </TouchableOpacity>
                    {children}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: '#00000099',
    },
    modalForm: {
        height: '75%',
        width: '90%',
        backgroundColor: '#0f0f0f',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 20,
        shadowColor: '#fff',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.10,
        shadowRadius: 10,
        elevation: 5,
    },
});

export default BottomSheet;