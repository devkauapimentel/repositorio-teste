import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
    Image,
    Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Colors, Fonts, BorderRadius, Shadow, Spacing } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { Tag } from '../hooks/useStorage';

interface NewTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onAddTask: (task: {
        title: string;
        description?: string;
        dueDate?: string;
        imageUri?: string;
        tags: string[];
        targetListId?: string;
    }) => void;
    availableTags: Tag[];
    listTitle: string;
    lists?: { id: string; title: string }[];
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({
    visible,
    onClose,
    onAddTask,
    availableTags,
    listTitle,
    lists = []
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [imageUri, setImageUri] = useState<string | undefined>(undefined);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedListId, setSelectedListId] = useState<string | undefined>(
        lists.length > 0 ? lists[0].id : undefined
    );
    const [showListSelector, setShowListSelector] = useState(false);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDueDate(undefined);
        setImageUri(undefined);
        setSelectedTags([]);
        setSelectedListId(lists.length > 0 ? lists[0].id : undefined);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleAddTask = () => {
        if (title.trim() === '') return;
        if (!selectedListId) return;

        onAddTask({
            title,
            description: description.trim() !== '' ? description : undefined,
            dueDate: dueDate ? dueDate.toISOString() : undefined,
            imageUri,
            tags: selectedTags,
            targetListId: selectedListId
        });

        resetForm();
        onClose();
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDueDate(selectedDate);
        }
    };

    const handleImagePick = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert('Precisamos de permissão para acessar sua galeria de fotos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
            setImageUri(result.assets[0].uri);
        }
    };

    const toggleTag = (tagId: string) => {
        setSelectedTags(prev => 
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    const selectList = (listId: string) => {
        setSelectedListId(listId);
        setShowListSelector(false);
    };

    const getSelectedListTitle = () => {
        if (!selectedListId || lists.length === 0) return "Selecione um quadro";
        const selectedList = lists.find(list => list.id === selectedListId);
        return selectedList ? selectedList.title : "Selecione um quadro";
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Nova Tarefa</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {/* Seleção de quadro/lista */}
                        {lists.length > 0 && (
                            <>
                                <Text style={styles.inputLabel}>Quadro</Text>
                                <TouchableOpacity
                                    style={styles.listSelectorButton}
                                    onPress={() => setShowListSelector(!showListSelector)}
                                >
                                    <Text style={styles.listSelectorText}>
                                        {getSelectedListTitle()}
                                    </Text>
                                    <MaterialIcons 
                                        name={showListSelector ? "arrow-drop-up" : "arrow-drop-down"} 
                                        size={24} 
                                        color={Colors.textSecondary} 
                                    />
                                </TouchableOpacity>

                                {showListSelector && (
                                    <View style={styles.listOptionsContainer}>
                                        <ScrollView style={styles.listOptionsScroll} nestedScrollEnabled={true}>
                                            {lists.map(list => (
                                                <TouchableOpacity
                                                    key={list.id}
                                                    style={[
                                                        styles.listOption,
                                                        selectedListId === list.id && styles.selectedListOption
                                                    ]}
                                                    onPress={() => selectList(list.id)}
                                                >
                                                    <Text 
                                                        style={[
                                                            styles.listOptionText,
                                                            selectedListId === list.id && styles.selectedListOptionText
                                                        ]}
                                                    >
                                                        {list.title}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </>
                        )}

                        {/* Título */}
                        <Text style={styles.inputLabel}>Título</Text>
                        <TextInput
                            style={styles.titleInput}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Título da tarefa"
                            placeholderTextColor={Colors.textSecondary}
                        />

                        {/* Descrição */}
                        <Text style={styles.inputLabel}>Descrição (opcional)</Text>
                        <TextInput
                            style={styles.descriptionInput}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Descrição da tarefa"
                            placeholderTextColor={Colors.textSecondary}
                            multiline
                            numberOfLines={3}
                        />

                        {/* Data */}
                        <Text style={styles.inputLabel}>Data (opcional)</Text>
                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <MaterialIcons name="event" size={20} color={Colors.primaryButton} />
                            <Text style={styles.datePickerButtonText}>
                                {dueDate 
                                    ? format(dueDate, "dd 'de' MMMM yyyy")
                                    : "Selecionar data"
                                }
                            </Text>
                            {dueDate && (
                                <TouchableOpacity 
                                    style={styles.clearDateButton}
                                    onPress={() => setDueDate(undefined)}
                                >
                                    <MaterialIcons name="clear" size={16} color={Colors.textSecondary} />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>

                        {/* Imagem */}
                        <Text style={styles.inputLabel}>Imagem (opcional)</Text>
                        {imageUri ? (
                            <View style={styles.imageContainer}>
                                <Image 
                                    source={{ uri: imageUri }} 
                                    style={styles.image} 
                                    resizeMode="cover"
                                />
                                <View style={styles.imageActions}>
                                    <TouchableOpacity 
                                        style={styles.imageActionButton}
                                        onPress={handleImagePick}
                                    >
                                        <MaterialIcons name="edit" size={20} color="white" />
                                        <Text style={styles.imageActionText}>Mudar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.imageActionButton, { backgroundColor: Colors.deleteButton }]}
                                        onPress={() => setImageUri(undefined)}
                                    >
                                        <MaterialIcons name="delete" size={20} color="white" />
                                        <Text style={styles.imageActionText}>Remover</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.imagePickerButton}
                                onPress={handleImagePick}
                            >
                                <MaterialIcons name="image" size={24} color={Colors.textSecondary} />
                                <Text style={styles.imagePickerText}>
                                    Toque para adicionar uma imagem
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* Tags */}
                        <Text style={styles.inputLabel}>Tags (opcional)</Text>
                        <View style={styles.tagsContainer}>
                            {availableTags.map(tag => (
                                <TouchableOpacity
                                    key={tag.id}
                                    style={[
                                        styles.tagButton,
                                        { backgroundColor: tag.color + '40' },
                                        selectedTags.includes(tag.id) && {
                                            backgroundColor: tag.color,
                                            borderWidth: 2,
                                            borderColor: 'white',
                                        }
                                    ]}
                                    onPress={() => toggleTag(tag.id)}
                                >
                                    <Text 
                                        style={[
                                            styles.tagText,
                                            selectedTags.includes(tag.id) && { color: 'white' }
                                        ]}
                                    >
                                        {tag.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Botões de ação */}
                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.addButton,
                                (title.trim() === '' || !selectedListId) && styles.disabledButton
                            ]}
                            onPress={handleAddTask}
                            disabled={title.trim() === '' || !selectedListId}
                        >
                            <Text style={styles.addButtonText}>Criar Tarefa</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Date Picker para iOS */}
            {showDatePicker && Platform.OS === 'ios' && (
                <View style={styles.datePickerIOS}>
                    <View style={styles.datePickerHeader}>
                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                            <Text style={styles.datePickerCancel}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                            <Text style={styles.datePickerDone}>OK</Text>
                        </TouchableOpacity>
                    </View>
                    <DateTimePicker
                        value={dueDate || new Date()}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                        style={styles.datePicker}
                    />
                </View>
            )}

            {/* Date Picker para Android */}
            {showDatePicker && Platform.OS === 'android' && (
                <DateTimePicker
                    value={dueDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxWidth: 500,
        maxHeight: '80%',
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.md,
        ...Shadow.medium,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    modalTitle: {
        fontFamily: Fonts.titleFamily,
        fontSize: 20,
        color: Colors.textPrimary,
    },
    modalContent: {
        padding: Spacing.md,
        maxHeight: 400,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    inputLabel: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.smallSize,
        fontWeight: 'bold',
        color: Colors.textPrimary,
        marginTop: Spacing.md,
        marginBottom: Spacing.xs,
    },
    titleInput: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.bodySize,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        borderRadius: BorderRadius.sm,
        padding: Spacing.sm,
        backgroundColor: 'white',
    },
    descriptionInput: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.bodySize,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        borderRadius: BorderRadius.sm,
        padding: Spacing.sm,
        backgroundColor: 'white',
        minHeight: 80,
        textAlignVertical: 'top',
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        borderRadius: BorderRadius.sm,
        padding: Spacing.sm,
        backgroundColor: 'white',
    },
    datePickerButtonText: {
        marginLeft: Spacing.sm,
        fontFamily: Fonts.bodyFamily,
        color: Colors.textPrimary,
    },
    clearDateButton: {
        marginLeft: 'auto',
    },
    imageContainer: {
        marginTop: Spacing.sm,
    },
    image: {
        width: '100%',
        height: 150,
        borderRadius: BorderRadius.sm,
    },
    imageActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Spacing.sm,
    },
    imageActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryButton,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.sm,
        ...Shadow.light,
        flex: 1,
        marginHorizontal: 4,
        justifyContent: 'center',
    },
    imageActionText: {
        color: 'white',
        marginLeft: 4,
        fontFamily: Fonts.bodyFamily,
    },
    imagePickerButton: {
        marginTop: Spacing.sm,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: Colors.primaryButton,
        borderRadius: BorderRadius.sm,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,182,193,0.1)',
    },
    imagePickerText: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.smallSize,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: Spacing.sm,
    },
    tagButton: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: 16,
        marginRight: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    tagText: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.smallSize,
        color: Colors.textPrimary,
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.sm,
        marginRight: Spacing.md,
    },
    cancelButtonText: {
        fontFamily: Fonts.bodyFamily,
        color: Colors.textPrimary,
    },
    addButton: {
        backgroundColor: Colors.primaryButton,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.sm,
    },
    addButtonText: {
        fontFamily: Fonts.bodyFamily,
        color: 'white',
    },
    disabledButton: {
        opacity: 0.5,
    },
    datePickerIOS: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        ...Shadow.medium,
    },
    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    datePickerCancel: {
        color: Colors.textPrimary,
        fontFamily: Fonts.bodyFamily,
    },
    datePickerDone: {
        color: Colors.primaryButton,
        fontFamily: Fonts.bodyFamily,
        fontWeight: 'bold',
    },
    datePicker: {
        height: 200,
    },
    listSelectorButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        borderRadius: BorderRadius.sm,
        padding: Spacing.sm,
        backgroundColor: 'white',
        marginBottom: Spacing.sm,
    },
    listSelectorText: {
        fontFamily: Fonts.bodyFamily,
        color: Colors.textPrimary,
    },
    listOptionsContainer: {
        borderWidth: 1,
        borderTopWidth: 0,
        borderColor: 'rgba(0,0,0,0.1)',
        borderBottomLeftRadius: BorderRadius.sm,
        borderBottomRightRadius: BorderRadius.sm,
        marginBottom: Spacing.sm,
        backgroundColor: 'white',
        maxHeight: 150,
    },
    listOptionsScroll: {
        maxHeight: 150,
    },
    listOption: {
        padding: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    listOptionText: {
        fontFamily: Fonts.bodyFamily,
        color: Colors.textPrimary,
    },
    selectedListOption: {
        backgroundColor: 'rgba(255,182,193,0.2)',
    },
    selectedListOptionText: {
        color: Colors.primaryButton,
        fontWeight: 'bold',
    },
});

export default NewTaskModal; 