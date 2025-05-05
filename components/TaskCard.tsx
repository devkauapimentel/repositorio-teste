import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CustomCheckbox from './CustomCheckbox';
import { Colors, Fonts, BorderRadius, Shadow, Spacing } from '../constants/theme';
import { Task } from '../hooks/useStorage';

interface TaskCardProps {
    task: Task;
    onUpdate: (updates: Partial<Omit<Task, 'id'>>) => void;
    onDelete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onDelete }) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleToggleComplete = () => {
        onUpdate({ completed: !task.completed });
    };

    const handleTitleChange = (text: string) => {
        onUpdate({ title: text });
    };

    const handleDescChange = (text: string) => {
        onUpdate({ description: text });
    };

    const handleDeletePress = () => {
        Alert.alert(
            'Excluir Tarefa',
            'Tem certeza que deseja excluir esta tarefa?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Excluir', onPress: onDelete, style: 'destructive' }
            ]
        );
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            onUpdate({ dueDate: selectedDate.toISOString() });
        }
    };

    const handleImagePick = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permissão necessária', 'Precisamos da permissão para acessar suas fotos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
            onUpdate({ imageUri: result.assets[0].uri });
        }
    };

    return (
        <View style={[styles.card, task.completed && styles.completedCard]}>
            <View style={styles.header}>
                <CustomCheckbox
                    checked={task.completed}
                    onPress={handleToggleComplete}
                    style={styles.checkbox}
                />

                {isEditingTitle ? (
                    <TextInput
                        style={styles.titleInput}
                        value={task.title}
                        onChangeText={handleTitleChange}
                        onBlur={() => setIsEditingTitle(false)}
                        autoFocus
                    />
                ) : (
                    <TouchableOpacity
                        style={styles.titleContainer}
                        onPress={() => setIsEditingTitle(true)}
                    >
                        <Text style={[
                            styles.title,
                            task.completed && styles.completedText
                        ]}>
                            {task.title}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {task.description || isEditingDesc ? (
                <View style={styles.descriptionContainer}>
                    {isEditingDesc ? (
                        <TextInput
                            style={styles.descriptionInput}
                            value={task.description || ''}
                            onChangeText={handleDescChange}
                            onBlur={() => setIsEditingDesc(false)}
                            multiline
                            placeholder="Adicionar descrição..."
                            placeholderTextColor={Colors.textSecondary}
                            autoFocus
                        />
                    ) : (
                        <TouchableOpacity onPress={() => setIsEditingDesc(true)}>
                            <Text style={[
                                styles.description,
                                task.completed && styles.completedText
                            ]}>
                                {task.description}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.addDescriptionButton}
                    onPress={() => setIsEditingDesc(true)}
                >
                    <Text style={styles.addDescriptionText}>+ Adicionar descrição</Text>
                </TouchableOpacity>
            )}

            {task.imageUri && (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: task.imageUri }} style={styles.image} />
                </View>
            )}

            <View style={styles.footer}>
                <View style={styles.dateContainer}>
                    {task.dueDate ? (
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <Text style={styles.dateText}>
                                {format(new Date(task.dueDate), "dd 'de' MMM")}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.addDateButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.addDateText}>+ Data</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.imageButton}
                        onPress={handleImagePick}
                    >
                        <Text style={styles.buttonText}>
                            {task.imageUri ? 'Trocar imagem' : '+ Imagem'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDeletePress}
                    >
                        <Text style={styles.deleteButtonText}>Excluir</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={task.dueDate ? new Date(task.dueDate) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    style={styles.datePicker}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.sm,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        ...Shadow.light,
    },
    completedCard: {
        opacity: 0.7,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    checkbox: {
        marginRight: Spacing.sm,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontFamily: Fonts.titleFamily,
        fontSize: Fonts.titleSize,
        color: Colors.textPrimary,
    },
    titleInput: {
        flex: 1,
        fontFamily: Fonts.titleFamily,
        fontSize: Fonts.titleSize,
        color: Colors.textPrimary,
        borderBottomWidth: 1,
        borderBottomColor: Colors.inputFocusBorder,
        paddingVertical: 2,
    },
    completedText: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    descriptionContainer: {
        marginBottom: Spacing.md,
        paddingLeft: Spacing.xl,
    },
    description: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.bodySize,
        color: Colors.textSecondary,
    },
    descriptionInput: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.bodySize,
        color: Colors.textSecondary,
        borderBottomWidth: 1,
        borderBottomColor: Colors.inputFocusBorder,
        paddingVertical: 2,
    },
    addDescriptionButton: {
        paddingLeft: Spacing.xl,
        marginBottom: Spacing.md,
    },
    addDescriptionText: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.smallSize,
        color: Colors.primaryButton,
    },
    imageContainer: {
        marginBottom: Spacing.md,
    },
    image: {
        width: '100%',
        height: 150,
        borderRadius: BorderRadius.sm,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.smallSize,
        color: Colors.textSecondary,
    },
    addDateButton: {},
    addDateText: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.smallSize,
        color: Colors.primaryButton,
    },
    actions: {
        flexDirection: 'row',
    },
    imageButton: {
        marginRight: Spacing.md,
    },
    buttonText: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.smallSize,
        color: Colors.primaryButton,
    },
    deleteButton: {},
    deleteButtonText: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.smallSize,
        color: Colors.deleteButton,
    },
    datePicker: {
        backgroundColor: 'white',
        borderRadius: 6,
        ...Shadow.light,
    },
});

export default TaskCard;
