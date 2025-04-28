import { useThemeColor } from '@/hooks/useThemeColor';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './ThemedText';
type FontAwesomeIconNames = keyof typeof FontAwesome.glyphMap;

interface InputProps {
    placeholder: string;
    label?: string;
    passwordVisibility?: boolean;
    iconName: FontAwesomeIconNames;
}

const Input: React.FC<InputProps> = ({ placeholder, iconName, label, passwordVisibility = false }) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <View style={{ width: '100%', marginVertical: 10 }}>
            {label != null ? <ThemedText type="defaultSemiBold" style={{ alignSelf: 'flex-start', marginBottom: 5, marginLeft: 5, fontSize: 18 }}>
                {label}
            </ThemedText> : null}
            <View
                style={[styles.inputContainer, { borderColor: useThemeColor({ light: '#000', dark: '#fff' }, "text") }]}
            >
                <View style={styles.icon}>
                    <FontAwesome name={iconName} size={20} color={useThemeColor({ light: '#ccc', dark: '#ffffff' }, "text")} />
                </View>
                <TextInput
                    placeholder={placeholder}
                    style={styles.input}
                    secureTextEntry={!isPasswordVisible}
                />
                {passwordVisibility && (
                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                        <FontAwesome
                            name={isPasswordVisible ? "eye" : "eye-slash"}
                            size={20}
                            color={useThemeColor({ light: '#ccc', dark: '#ffffff' }, "text")}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 25,
        paddingVertical: 15,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        color: '#fff',
        width: '82%',
        fontSize: 18,
        textAlign: 'left',
    },
});

export default Input;