import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, BorderRadius } from '../../constants/theme';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
    const handleResetData = async () => {
        Alert.alert(
            'Resetar dados',
            'Tem certeza que deseja resetar todos os dados do aplicativo? Esta ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Resetar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.clear();
                            Alert.alert('Sucesso', 'Todos os dados foram resetados com sucesso. Reinicie o aplicativo.');
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível resetar os dados.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.title}>Perfil</Text>
                    <Text style={styles.subtitle}>
                        Gerencie sua conta e preferências
                    </Text>
                </View>

                <View style={styles.profileContainer}>
                    <View style={styles.avatarContainer}>
                        <FontAwesome name="user-circle" size={80} color={Colors.textPrimary} />
                    </View>

                    <Text style={styles.username}>Usuário</Text>

                    <View style={styles.optionsContainer}>
                        <TouchableOpacity style={styles.optionItem}>
                            <FontAwesome name="bell" size={24} color={Colors.textPrimary} style={styles.optionIcon} />
                            <Text style={styles.optionText}>Notificações</Text>
                            <FontAwesome name="chevron-right" size={16} color={Colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionItem}>
                            <FontAwesome name="paint-brush" size={24} color={Colors.textPrimary} style={styles.optionIcon} />
                            <Text style={styles.optionText}>Tema do aplicativo</Text>
                            <FontAwesome name="chevron-right" size={16} color={Colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionItem}>
                            <FontAwesome name="question-circle" size={24} color={Colors.textPrimary} style={styles.optionIcon} />
                            <Text style={styles.optionText}>Ajuda e suporte</Text>
                            <FontAwesome name="chevron-right" size={16} color={Colors.textSecondary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.optionItem, styles.dangerOption]}
                            onPress={handleResetData}
                        >
                            <FontAwesome name="trash" size={24} color={Colors.deleteButton} style={styles.optionIcon} />
                            <Text style={[styles.optionText, styles.dangerText]}>Resetar dados</Text>
                            <FontAwesome name="chevron-right" size={16} color={Colors.deleteButton} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.versionContainer}>
                        <Text style={styles.versionText}>Versão 1.0.0</Text>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        padding: 16,
        alignItems: 'center',
    },
    title: {
        fontFamily: Fonts.titleFamily,
        fontSize: 28,
        color: Colors.textPrimary,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: Fonts.bodyFamily,
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 24,
        textAlign: 'center',
    },
    profileContainer: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.card,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: Colors.primaryButton,
    },
    username: {
        fontFamily: Fonts.titleFamily,
        fontSize: 24,
        color: Colors.textPrimary,
        marginBottom: 32,
    },
    optionsContainer: {
        width: '100%',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        marginBottom: 24,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    optionIcon: {
        marginRight: 16,
        width: 24,
        textAlign: 'center',
    },
    optionText: {
        flex: 1,
        fontFamily: Fonts.bodyFamily,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    dangerOption: {
        borderBottomWidth: 0,
    },
    dangerText: {
        color: Colors.deleteButton,
    },
    versionContainer: {
        marginTop: 'auto',
        paddingBottom: 16,
    },
    versionText: {
        fontFamily: Fonts.bodyFamily,
        fontSize: 14,
        color: Colors.textSecondary,
    },
});