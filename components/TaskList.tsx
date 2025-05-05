import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ScrollView,
} from 'react-native';
import { TaskList as TaskListType, Task } from '../hooks/useStorage';
import TaskCard from './TaskCard';
import { Colors, Fonts, BorderRadius, Shadow, Spacing } from '../constants/theme';

interface TaskListProps {
    list: TaskListType;
    onUpdateTitle: (title: string) => void;
    onDeleteList: () => void;
    onAddTask: (task: Omit<Task, 'id' | 'completed' | 'completedAt'>) => void;
    onUpdateTask: (taskId: string, updates: Partial<Omit<Task, 'id'>>) => void;
    onDeleteTask: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
    list,
    onUpdateTitle,
    onDeleteList,
    onAddTask,
    onUpdateTask,
    onDeleteTask,
}) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const titleInputRef = useRef<TextInput>(null);

    const handleTitlePress = () => {
        setIsEditingTitle(true);
        setTimeout(() => {
            titleInputRef.current?.focus();
        }, 100);
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
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

    const handleAddTask = () => {
        if (newTaskTitle.trim() === '') return;

        onAddTask({
            title: newTaskTitle,
        });

        setNewTaskTitle('');
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {isEditingTitle ? (
                    <TextInput
                        ref={titleInputRef}
                        style={styles.titleInput}
                        value={list.title}
                        onChangeText={onUpdateTitle}
                        onBlur={handleTitleBlur}
                    />
                ) : (
                    <TouchableOpacity onPress={handleTitlePress} style={styles.titleContainer}>
                        <Text style={styles.title}>{list.title}</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={handleDeleteList} style={styles.deleteButton}>
                    <Text style={styles.deleteButtonText}>✖</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.tasksContainer}>
                {list.tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onUpdate={(updates) => onUpdateTask(task.id, updates)}
                        onDelete={() => onDeleteTask(task.id)}
                    />
                ))}
            </ScrollView>

            <View style={styles.addTaskContainer}>
                <TextInput
                    style={styles.addTaskInput}
                    value={newTaskTitle}
                    onChangeText={setNewTaskTitle}
                    placeholder="Adicionar nova tarefa..."
                    placeholderTextColor={Colors.textSecondary}
                    onSubmitEditing={handleAddTask}
                />
                <TouchableOpacity
                    style={[styles.addButton, newTaskTitle.trim() === '' && styles.disabledButton]}
                    onPress={handleAddTask}
                    disabled={newTaskTitle.trim() === ''}
                >
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 280,
        minHeight: 300,
        maxHeight: 500,
        backgroundColor: Colors.listHeader,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        margin: Spacing.md,
        ...Shadow.medium,
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
    },
    deleteButton: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 12,
    },
    deleteButtonText: {
        color: Colors.deleteButton,
        fontSize: 12,
        fontWeight: 'bold',
    },
    tasksContainer: {
        flex: 1,
        marginBottom: Spacing.md,
    },
    addTaskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
        paddingTop: Spacing.md,
    },
    addTaskInput: {
        flex: 1,
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.bodySize,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.sm,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        marginRight: Spacing.sm,
    },
    addButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.primaryButton,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.5,
    },
});

export default TaskList;