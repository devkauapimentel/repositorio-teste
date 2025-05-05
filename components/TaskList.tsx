import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ScrollView,
    Dimensions,
    Animated,
} from 'react-native';
import { TaskList as TaskListType, Task, Tag } from '../hooks/useStorage';
import TaskCard from './TaskCard';
import NewTaskModal from './NewTaskModal';
import { Colors, Fonts, BorderRadius, Shadow, Spacing } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface TaskListProps {
    list: TaskListType;
    onUpdateTitle: (title: string) => void;
    onDeleteList: () => void;
    onAddTask: (task: Omit<Task, 'id' | 'completed' | 'completedAt' | 'tags'>) => void;
    onUpdateTask: (taskId: string, updates: Partial<Omit<Task, 'id'>>) => void;
    onUpdateTaskTags: (taskId: string, tags: string[]) => void;
    onDeleteTask: (taskId: string) => void;
    onIsolateList: () => void;
    isIsolated: boolean;
    availableTags: Tag[];
    getTagById: (tagId: string) => Tag | undefined;
    isDesktopView?: boolean;
}

// Verificação para responsividade
const windowWidth = Dimensions.get('window').width;
const isSmallScreen = windowWidth < 600;

const TaskList: React.FC<TaskListProps> = ({
    list,
    onUpdateTitle,
    onDeleteList,
    onAddTask,
    onUpdateTask,
    onUpdateTaskTags,
    onDeleteTask,
    onIsolateList,
    isIsolated,
    availableTags,
    getTagById,
    isDesktopView = false,
}) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const titleInputRef = useRef<TextInput>(null);
    const [dimensions, setDimensions] = useState({ windowWidth });
    const scrollViewRef = useRef<ScrollView>(null);
    const cardAnimation = useRef(new Animated.Value(1)).current;
    
    // Monitor screen width changes for responsiveness
    useEffect(() => {
        const handleDimensionsChange = ({ window }: { window: { width: number } }) => {
            setDimensions({ windowWidth: window.width });
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => {
            subscription.remove();
        };
    }, []);

    // Simple animation when list gains focus
    useEffect(() => {
        if (isFocused) {
            Animated.sequence([
                Animated.timing(cardAnimation, {
                    toValue: 1.03,
                    duration: 150,
                    useNativeDriver: true
                }),
                Animated.timing(cardAnimation, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true
                })
            ]).start();
        }
    }, [isFocused, cardAnimation]);

    const handleTitlePress = () => {
        setIsEditingTitle(true);
        setTimeout(() => {
            titleInputRef.current?.focus();
        }, 100);
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
        setIsFocused(false);
    };

    const handleTitleFocus = () => {
        setIsFocused(true);
    };

    const handleDeleteList = () => {
        Alert.alert(
            'Excluir Lista',
            `Tem certeza que deseja excluir a lista "${list.title}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Excluir', onPress: onDeleteList, style: 'destructive' }
            ]
        );
    };

    const handleAddNewTask = (taskData: {
        title: string;
        description?: string;
        dueDate?: string;
        imageUri?: string;
        tags: string[];
    }) => {
        onAddTask({
            title: taskData.title,
            description: taskData.description,
            dueDate: taskData.dueDate,
            imageUri: taskData.imageUri,
        });

        // Se houver tags, atualiza as tags da nova tarefa
        if (taskData.tags.length > 0) {
            // Precisamos encontrar o ID da tarefa que acabamos de adicionar
            // No mundo real, a função addTask deveria retornar o ID
            // Como alternativa, buscamos a última tarefa adicionada
            setTimeout(() => {
                const lastTask = list.tasks[list.tasks.length - 1];
                if (lastTask) {
                    onUpdateTaskTags(lastTask.id, taskData.tags);
                }
            }, 100);
        }
    };

    // Calculate number of completed tasks for progress indication
    const completedTaskCount = list.tasks.filter(task => task.completed).length;
    const totalTaskCount = list.tasks.length;
    const progressPercentage = totalTaskCount > 0 ? (completedTaskCount / totalTaskCount) * 100 : 0;

    return (
        <Animated.View style={[
            styles.container, 
            isFocused && styles.focusedContainer,
            isIsolated && styles.isolatedContainer,
            isDesktopView && !isIsolated && styles.desktopContainer,
            { transform: [{ scale: cardAnimation }] }
        ]}>
            <View style={styles.header}>
                <View style={styles.titleGroup}>
                    {!isIsolated && (
                        <TouchableOpacity 
                            style={styles.isolateButton}
                            onPress={onIsolateList}
                        >
                            <MaterialIcons name="fullscreen" size={20} color={Colors.primaryButton} />
                        </TouchableOpacity>
                    )}
                    
                    {isEditingTitle ? (
                        <TextInput
                            ref={titleInputRef}
                            style={styles.titleInput}
                            value={list.title}
                            onChangeText={onUpdateTitle}
                            onBlur={handleTitleBlur}
                            onFocus={handleTitleFocus}
                            autoFocus
                        />
                    ) : (
                        <TouchableOpacity onPress={handleTitlePress} style={styles.titleContainer}>
                            <Text style={styles.title}>{list.title}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity onPress={handleDeleteList} style={styles.deleteButton}>
                    <Text style={styles.deleteButtonText}>✖</Text>
                </TouchableOpacity>
            </View>

            {/* Progress indicator */}
            {totalTaskCount > 0 && (
                <View style={styles.progressContainer}>
                    <View style={styles.progressBackground}>
                        <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                        {completedTaskCount}/{totalTaskCount} concluídas
                    </Text>
                </View>
            )}

            {/* Lista de tarefas com altura dinâmica */}
            <View style={styles.tasksWrapper}>
                {list.tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onUpdate={(updates) => onUpdateTask(task.id, updates)}
                        onUpdateTags={(tags) => onUpdateTaskTags(task.id, tags)}
                        onDelete={() => onDeleteTask(task.id)}
                        availableTags={availableTags}
                        getTagById={getTagById}
                    />
                ))}
            </View>

            {/* Add task button */}
            <TouchableOpacity 
                style={styles.addTaskButton}
                onPress={() => setShowNewTaskModal(true)}
            >
                <MaterialIcons name="add" size={20} color={Colors.primaryButton} />
                <Text style={styles.addTaskButtonText}>Nova tarefa</Text>
            </TouchableOpacity>

            {/* Modal para adicionar nova tarefa */}
            <NewTaskModal
                visible={showNewTaskModal}
                onClose={() => setShowNewTaskModal(false)}
                onAddTask={handleAddNewTask}
                availableTags={availableTags}
                listTitle={list.title}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '90%',
        backgroundColor: Colors.listHeader,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        margin: Spacing.md,
        ...Shadow.medium,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        position: 'relative',
        alignSelf: 'center',
    },
    focusedContainer: {
        borderColor: Colors.primaryButton,
        borderWidth: 2,
        ...Shadow.medium,
    },
    isolatedContainer: {
        width: '95%',
        maxWidth: 800,
        marginVertical: Spacing.md,
        alignSelf: 'center',
    },
    desktopContainer: {
        width: 330,
        maxHeight: 600,
        margin: Spacing.sm,
        alignSelf: 'flex-start',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    titleGroup: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    isolateButton: {
        padding: 8,
        marginRight: 8,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontFamily: Fonts.titleFamily,
        fontSize: Fonts.titleSize + 2,
        color: Colors.textPrimary,
    },
    titleInput: {
        flex: 1,
        fontFamily: Fonts.titleFamily,
        fontSize: Fonts.titleSize + 2,
        color: Colors.textPrimary,
        borderWidth: 1,
        borderColor: Colors.inputFocusBorder,
        borderRadius: BorderRadius.sm,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    deleteButton: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 12,
    },
    deleteButtonText: {
        color: Colors.deleteButton,
        fontSize: 12,
        fontWeight: 'bold',
    },
    tasksWrapper: {
        width: '100%',
    },
    progressContainer: {
        marginBottom: Spacing.md,
    },
    progressBackground: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.primaryButton,
    },
    progressText: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.smallSize,
        color: Colors.textSecondary,
        marginTop: 4,
        textAlign: 'right',
    },
    addTaskButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.md,
        padding: Spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: Colors.primaryButton,
    },
    addTaskButtonText: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.bodySize,
        color: Colors.textPrimary,
        marginLeft: Spacing.xs,
    },
});

export default TaskList;