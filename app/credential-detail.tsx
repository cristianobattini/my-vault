import { useRealm } from '@realm/react';
import { BSON } from 'realm';
import { Link, useLocalSearchParams, useNavigation } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, TextInput, Linking, Clipboard } from 'react-native';
import { Credential } from '@/models/Credential';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Octicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import BottomSheet from '@/components/BottomSheet';
import Input from '@/components/Input';
import { useForm, Controller } from 'react-hook-form';
import { KeyboardAvoidingProvider } from '@/components/store/KeyboardAvoidingProvider';

export default function CredentialDetail() {
    const { id } = useLocalSearchParams();
    const realm = useRealm();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isArchived, setIsArchived] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showEditSheet, setShowEditSheet] = useState(false);
    const [notes, setNotes] = useState('');
    const navigation = useNavigation()

    const credential = realm.objectForPrimaryKey<Credential>(
        'Credential',
        new BSON.ObjectId(id as string)
    );

    useEffect(() => {
        setIsFavorite(credential?.isFavorite!)
        setIsArchived(credential?.isArchived!)
        setNotes(credential?.notes ?? '')
    }, [])

    const { control, handleSubmit, reset } = useForm({
        defaultValues: {
            title: credential?.title || '',
            username: credential?.username || '',
            password: credential?.password || '',
            url: credential?.url || '',
            notes: credential?.notes || ''
        }
    });

    if (!credential) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Credenziale non trovata</ThemedText>
            </ThemedView>
        );
    }

    const handleUpdateCredential = (data: any) => {
        realm.write(() => {
            credential.title = data.title;
            credential.username = data.username;
            credential.password = data.password;
            credential.url = data.url;
            credential.notes = data.notes;
            credential.updatedAt = new Date();
        });
        setShowEditSheet(false);
    };

    const handleSaveNotes = () => {
        realm.write(() => {
            credential.notes = notes
        })
    }

    const toggleFavorite = () => {
        realm.write(() => {
            credential.isFavorite = !credential.isFavorite;
        });
        setIsFavorite(!isFavorite)
    };

    const toggleArchive = () => {
        realm.write(() => {
            credential.isArchived = !credential.isArchived;
        });
        setIsArchived(!isArchived)
    };

    const handleNavigateToUrl = () => {
        if (credential.url != '') {
            var urlToNavigateTo = credential.url
            if (!credential.url.includes('http') || !credential.url.includes('https'))
                urlToNavigateTo = 'https://' + credential.url
            Linking.openURL(urlToNavigateTo)
        }
    }

    const copyToClipboard = (data: string) => {
        Clipboard.setString(data);
    };

    return (
        <KeyboardAvoidingProvider>
            <ThemedView style={styles.container}>
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => {
                            navigation.dispatch({ type: 'POP_TO_TOP' })
                        }}>
                            <Octicons size={28} name='chevron-left' />
                        </TouchableOpacity>
                        <ThemedText type="title">{credential.title}</ThemedText>
                    </View>


                    <View style={styles.actions}>
                        <TouchableOpacity onPress={toggleFavorite}>
                            <Octicons
                                name={credential.isFavorite ? 'star-fill' : 'star'}
                                size={24}
                                color={credential.isFavorite ? '#FFD700' : undefined}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShowEditSheet(true)}>
                            <Octicons name="pencil" size={24} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={toggleArchive}>
                            <Octicons
                                name={!credential.isArchived ? 'archive' : 'chevron-left'}
                                size={24}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.detailSection}>
                    <DetailRow
                        icon="person"
                        label="Username"
                        value={credential.username}
                        onPress={() => { copyToClipboard(credential.username) }}
                        actionIcon={'paste'}
                    />

                    <DetailRow
                        icon="lock"
                        label="Password"
                        value={showPassword ? credential.password : '•'.repeat(credential.password.length)}
                        onPress={() => {
                            copyToClipboard(credential.password)
                            setShowPassword(!showPassword)
                        }}
                        actionIcon={showPassword ? 'eye-closed' : 'eye'}
                    />

                    <DetailRow
                        icon="link"
                        label="URL"
                        value={credential.url}
                        onPress={handleNavigateToUrl}
                    />

                    <View style={{ marginTop: 10 }}>
                        <View style={{ marginBottom: 10, flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                            <View style={styles.title}>
                                <Octicons name={'note'} size={26} style={styles.rowIcon} />
                                <ThemedText style={{ fontSize: 22 }}>{'Notes'}</ThemedText>
                            </View>
                            {notes != '' && <TouchableOpacity onPress={handleSaveNotes}>
                                <Octicons name='check-circle' color={'green'} size={26} />
                            </TouchableOpacity>}
                        </View>
                        <TextInput
                            editable
                            multiline
                            numberOfLines={4}
                            style={{ fontSize: 18, height: 300 }}
                            onChangeText={text => setNotes(text)}
                            placeholder='Insert some notes...'
                            placeholderTextColor="#999"
                            value={notes}
                            textAlignVertical="top"
                            blurOnSubmit={true}
                            returnKeyType="done"
                        />
                    </View>

                    <View style={styles.metaSection}>
                        <ThemedText type="defaultSemiBold">
                            Creata il: {credential.createdAt.toLocaleDateString()}
                        </ThemedText>
                        <ThemedText type="defaultSemiBold">
                            Ultima modifica: {credential.updatedAt.toLocaleDateString()}
                        </ThemedText>
                    </View>
                </View>

                {/* Edit Credential Bottom Sheet */}
                <BottomSheet
                    heightPrecentile={0.70}
                    visible={showEditSheet}
                    onRequestClose={() => setShowEditSheet(false)}
                >
                    <View style={styles.sheetContainer}>
                        <Controller
                            control={control}
                            name="title"
                            rules={{ required: "Inserisci un titolo" }}
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label={'Titolo'}
                                    placeholder="Nome della credenziale"
                                    iconName={'tag'}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="username"
                            rules={{ required: "Inserisci username/email" }}
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label={'Username/Email'}
                                    placeholder="user@example.com"
                                    iconName="user"
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="password"
                            rules={{ required: "Inserisci una password" }}
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label={'Password'}
                                    placeholder="••••••••"
                                    passwordVisibility={true}
                                    iconName="lock"
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="url"
                            render={({ field: { onChange, value } }) => (
                                <Input
                                    label={'URL'}
                                    placeholder="https://example.com"
                                    iconName="link"
                                    onChangeText={onChange}
                                    value={value}
                                />
                            )}
                        />

                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.primaryButton]}
                                onPress={handleSubmit(handleUpdateCredential)}
                            >
                                <ThemedText style={styles.buttonText}>Salva</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.secondaryButton]}
                                onPress={() => setShowEditSheet(false)}
                            >
                                <ThemedText style={styles.buttonText}>Annulla</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BottomSheet>
            </ThemedView>
        </KeyboardAvoidingProvider>
    );
}

const DetailRow = ({
    icon,
    label,
    value,
    onPress,
    actionIcon
}: {
    icon: string;
    label: string;
    value: string;
    onPress?: () => void;
    actionIcon?: string;
}) => (
    <View style={styles.detailRow}>
        <View style={styles.title}>
            <Octicons name={icon as any} size={26} style={styles.rowIcon} />
            <ThemedText style={{ fontSize: 22 }}>{label}</ThemedText>
        </View>

        <TouchableOpacity
            style={styles.content}
            onPress={onPress}
            disabled={!onPress}
        >
            <ThemedText type={label == 'URL' ? 'link' : 'default'} style={styles.rowValue}>{value}</ThemedText>
            {actionIcon && <Octicons name={actionIcon as any} size={22} />}
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        marginTop: 20
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
    },
    detailSection: {
        gap: 16,
    },
    detailRow: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        gap: 10
    },
    title: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    content: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
    },
    rowIcon: {
        opacity: 0.6,
    },
    rowValue: {
        maxWidth: 200,
        fontSize: 20
    },
    metaSection: {
        marginTop: 24,
        gap: 8,
    },
    sheetContainer: {
        flex: 1,
        paddingBottom: 20,
        paddingHorizontal: 16,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 12,
    },
    button: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: '#007AFF',
    },
    secondaryButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
    },
});