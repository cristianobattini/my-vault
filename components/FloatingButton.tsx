import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Octicons } from '@expo/vector-icons';
import { TouchableOpacityProps } from 'react-native-gesture-handler';

const FloatingButton = ({ onPress }: TouchableOpacityProps) => {
    return (
        <TouchableOpacity style={styles.floatingButton} onPress={onPress}>
            <Octicons name="diff-added" size={24} color="white" />
        </TouchableOpacity>
    );
};


const styles = StyleSheet.create({
    floatingButton: {
      // backgroundColor: colors.primary,
      backgroundColor: "#000",
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      position: "absolute",
      bottom: 40,
      right: 30,
      elevation: 5,
      shadowColor: "#000", 
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
});

export default FloatingButton;
