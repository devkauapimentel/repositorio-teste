import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    Platform,
    Dimensions,
    Modal,
    ScrollView,
    FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CustomCheckbox from './CustomCheckbox';
import { Colors, Fonts, BorderRadius, Shadow, Spacing } from '../constants/theme';
import { Task, Tag } from '../hooks/useStorage';
import { MaterialIcons } from '@expo/vector-icons';

interface TaskCardProps {
    task: Task;
    onUpdate: (updates: Partial<Omit<Task, 'id'>>) => void;
    onUpdateTags: (tags: string[]) => void;
    onDelete: () => void;
    availableTags: Tag[];
    getTagById: (tagId: string) => Tag | undefined;
}

const windowWidth = Dimensions.get('window').width;
const isSmallScreen = windowWidth < 600;

const TaskCard: React.FC<TaskCardProps> = ({ 
    task, 
    onUpdate, 
    onUpdateTags,
    onDelete,
    availableTags,
    getTagById 
}) => {
    // Estados locais para o card
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dimensions, setDimensions] = useState({ windowWidth });
    
    // Estados para o formulário de edição
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description || '');
    const [editDueDate, setEditDueDate] = useState<Date | undefined>(
        task.dueDate ? new Date(task.dueDate) : undefined
    );
    const [editImageUri, setEditImageUri] = useState(task.imageUri);
    const [selectedTags, setSelectedTags] = useState<string[]>(task.tags || []);

    // Monitor dimensions for responsiveness
    useEffect(() => {
        const handleDimensionsChange = ({ window }: { window: { width: number } }) => {
            setDimensions({ windowWidth: window.width });
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => {
            subscription.remove();
        };
    }, []);

    // Atualizar estados do formulário quando a tarefa mudar
    useEffect(() => {
        setEditTitle(task.title);
        setEditDescription(task.description || '');
        setEditDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
        setEditImageUri(task.imageUri);
        setSelectedTags(task.tags || []);
    }, [task]);

    // Manipulação de concluir tarefa
    const handleToggleComplete = () => {
        onUpdate({ 
            completed: !task.completed,
            completedAt: !task.completed ? new Date().toISOString() : undefined 
        });
    };

    // Abrir modal de edição
    const openEditModal = () => {
        setIsEditModalVisible(true);
    };

    // Fechar modal de edição sem salvar
    const closeEditModal = () => {
        // Restaurar valores originais
        setEditTitle(task.title);
        setEditDescription(task.description || '');
        setEditDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
        setEditImageUri(task.imageUri);
        setSelectedTags(task.tags || []);
        
        setIsEditModalVisible(false);
    };

    // Salvar alterações da tarefa
    const saveTaskChanges = () => {
        if (editTitle.trim() === '') {
            Alert.alert('Erro', 'O título não pode estar vazio');
            return;
        }

        // Atualizar tarefa com novos valores
        onUpdate({ 
            title: editTitle,
            description: editDescription || undefined,
            dueDate: editDueDate ? editDueDate.toISOString() : undefined,
            imageUri: editImageUri
        });

        // Atualizar tags separadamente
        onUpdateTags(selectedTags);
        
        // Fechar modal
        setIsEditModalVisible(false);
    };

    // Pedir confirmação para excluir tarefa
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

    // Selecionar data
    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setEditDueDate(selectedDate);
        }
    };

    // Selecionar imagem
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
            setEditImageUri(result.assets[0].uri);
        }
    };

    // Toggle seleção de tag
    const toggleTagSelection = (tagId: string) => {
        setSelectedTags(prev => 
            prev.includes(tagId) 
                ? prev.filter(id => id !== tagId) 
                : [...prev, tagId]
        );
    };

    // Renderizar um indicador de tag
    const renderTagBadge = (tagId: string) => {
        const tag = getTagById(tagId);
        if (!tag) return null;
        
        return (
            <View 
                key={tagId} 
                style={[styles.tagBadge, { backgroundColor: tag.color }]}
            >
                <Text style={styles.tagText}>{tag.name}</Text>
            </View>
        );
    };

    const isSmall = dimensions.windowWidth < 600;

    return (
        <>
            <View style={[
                styles.card, 
                task.completed && styles.completedCard,
                isSmall && styles.smallScreenCard
            ]}>
                <View style={styles.header}>
                    <CustomCheckbox
                        checked={task.completed}
                        onPress={handleToggleComplete}
                        style={styles.checkbox}
                    />

                    <TouchableOpacity
                        style={styles.titleContainer}
                        onPress={openEditModal}
                    >
                        <Text style={[
                            styles.title,
                            task.completed && styles.completedText
                        ]}>
                            {task.title}
                        </Text>
                    </TouchableOpacity>
                </View>

                {task.description && (
                    <TouchableOpacity 
                        style={styles.descriptionContainer}
                        onPress={openEditModal}
                    >
                        <Text style={[
                            styles.description,
                            task.completed && styles.completedText
                        ]}>
                            {task.description}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Mostrar tags selecionadas */}
                {task.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        {task.tags.map(tagId => renderTagBadge(tagId))}
                    </View>
                )}

                {task.imageUri && (
                    <TouchableOpacity 
                        style={styles.imageContainer}
                        onPress={openEditModal}
                    >
                        <Image 
                            source={{ uri: task.imageUri }} 
                            style={styles.image} 
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                )}

                <View style={styles.footer}>
                    <View style={styles.dateContainer}>
                        {task.dueDate ? (
                            <TouchableOpacity 
                                style={styles.dateButton}
                                onPress={openEditModal}
                            >
                                <MaterialIcons name="event" size={16} color={Colors.textSecondary} />
                                <Text style={styles.dateText}>
                                    {format(new Date(task.dueDate), "dd 'de' MMM")}
                                </Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={openEditModal}
                        >
                            <Text style={styles.editButtonText}>Editar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={handleDeletePress}
                        >
                            <Text style={styles.deleteButtonText}>Excluir</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Modal de Edição de Tarefa */}
            <Modal
                visible={isEditModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={closeEditModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Editar Tarefa</Text>
                            <TouchableOpacity onPress={closeEditModal}>
                                <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {/* Campo de título */}
                            <Text style={styles.inputLabel}>Título</Text>
                            <TextInput
                                style={styles.titleInput}
                                value={editTitle}
                                onChangeText={setEditTitle}
                                placeholder="Título da tarefa"
                                placeholderTextColor={Colors.textSecondary}
                            />

                            {/* Campo de descrição */}
                            <Text style={styles.inputLabel}>Descrição (opcional)</Text>
                            <TextInput
                                style={styles.descriptionInput}
                                value={editDescription}
                                onChangeText={setEditDescription}
                                placeholder="Descrição da tarefa"
                                placeholderTextColor={Colors.textSecondary}
                                multiline
                                numberOfLines={3}
                            />

                            {/* Seletor de data */}
                            <Text style={styles.inputLabel}>Data (opcional)</Text>
                            <TouchableOpacity
                                style={styles.datePickerButton}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <MaterialIcons name="event" size={20} color={Colors.primaryButton} />
                                <Text style={styles.datePickerButtonText}>
                                    {editDueDate 
                                        ? format(editDueDate, "dd 'de' MMMM yyyy")
                                        : "Selecionar data"
                                    }
                                </Text>
                                {editDueDate && (
                                    <TouchableOpacity 
                                        style={styles.clearDateButton}
                                        onPress={() => setEditDueDate(undefined)}
                                    >
                                        <MaterialIcons name="clear" size={16} color={Colors.textSecondary} />
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>

                            {/* Imagem */}
                            <Text style={styles.inputLabel}>Imagem (opcional)</Text>
                            {editImageUri ? (
                                <View style={styles.editImageContainer}>
                                    <Image 
                                        source={{ uri: editImageUri }} 
                                        style={styles.editImage} 
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
                                            onPress={() => setEditImageUri(undefined)}
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

                            {/* Seleção de Tags */}
                            <Text style={styles.inputLabel}>Tags</Text>
                            <View style={styles.tagsSelectionContainer}>
                                {availableTags.map(tag => (
                                    <TouchableOpacity
                                        key={tag.id}
                                        style={[
                                            styles.tagSelectButton,
                                            { backgroundColor: tag.color + '40' }, // Cor com opacidade
                                            selectedTags.includes(tag.id) && { 
                                                backgroundColor: tag.color,
                                                borderWidth: 2,
                                                borderColor: 'white',
                                            }
                                        ]}
                                        onPress={() => toggleTagSelection(tag.id)}
                                    >
                                        <Text 
                                            style={[
                                                styles.tagSelectText,
                                                selectedTags.includes(tag.id) && { color: 'white' }
                                            ]}
                                        >
                                            {tag.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={closeEditModal}
                            >
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.saveButton}
                                onPress={saveTaskChanges}
                            >
                                <Text style={styles.saveButtonText}>Salvar</Text>
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
                            value={editDueDate || new Date()}
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
                        value={editDueDate || new Date()}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                    />
                )}
            </Modal>
        </>
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
    smallScreenCard: {
        width: '100%',
        padding: Spacing.sm,
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
        flexWrap: 'wrap',
    },
    completedText: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    descriptionContainer: {
        marginBottom: Spacing.md,
        paddingLeft: isSmallScreen ? Spacing.md : Spacing.xl,
    },
    description: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.bodySize,
        color: Colors.textSecondary,
        flexWrap: 'wrap',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: Spacing.sm,
    },
    tagBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        marginRight: 6,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 12,
        color: 'rgba(0,0,0,0.7)',
        fontWeight: '500',
    },
    imageContainer: {
        marginVertical: Spacing.sm,
        borderRadius: BorderRadius.sm,
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: isSmallScreen ? 120 : 150,
        borderRadius: BorderRadius.sm,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.sm,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    dateText: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.smallSize,
        color: Colors.textSecondary,
        marginLeft: 4,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: Colors.primaryButton,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        marginRight: Spacing.sm,
        ...Shadow.light,
    },
    editButtonText: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.smallSize,
        color: 'white',
    },
    deleteButton: {
        backgroundColor: Colors.deleteButton,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        ...Shadow.light,
    },
    deleteButtonText: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.smallSize,
        color: 'white',
    },

    // Modal styles
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
    editImageContainer: {
        marginTop: Spacing.sm,
    },
    editImage: {
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
    saveButton: {
        backgroundColor: Colors.primaryButton,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.sm,
    },
    saveButtonText: {
        fontFamily: Fonts.bodyFamily,
        color: 'white',
    },
    tagsSelectionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: Spacing.sm,
    },
    tagSelectButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    tagSelectText: {
        fontFamily: Fonts.bodyFamily,
        fontSize: 13,
        color: Colors.textPrimary,
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
});

export default TaskCard;
