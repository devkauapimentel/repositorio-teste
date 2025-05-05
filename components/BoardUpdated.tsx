import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useStorage } from '../hooks/useStorage';
import TaskList from './TaskList';
import { Colors, Fonts, Spacing } from '../constants/theme';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 600;

const Board: React.FC = () => {
    const {
        boardData,
        isLoading,
        updateBoardInfo,
        addList,
        updateListTitle,
        deleteList,
        addTask,
        updateTask,
        deleteTask,
    } = useStorage();

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [newListTitle, setNewListTitle] = useState('');

    const titleInputRef = useRef<TextInput>(null);
    const descriptionInputRef = useRef<TextInput>(null);

    const handleTitlePress = () => {
        setIsEditingTitle(true);
        setTimeout(() => {
            titleInputRef.current?.focus();
        }, 100);
    };

    const handleTitleChange = (text: string) => {
        updateBoardInfo(text, boardData.description);
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
    };

    const handleDescriptionPress = () => {
        setIsEditingDescription(true);
        setTimeout(() => {
            descriptionInputRef.current?.focus();
        }, 100);
    };

    const handleDescriptionChange = (text: string) => {
        updateBoardInfo(boardData.title, text);
    };

    const handleDescriptionBlur = () => {
        setIsEditingDescription(false);
    };

    const handleAddList = () => {
        if (newListTitle.trim() === '') return;

        addList(newListTitle);
        setNewListTitle('');
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {isEditingTitle ? (
                    <TextInput
                        ref={titleInputRef}
                        style={styles.titleInput}
                        value={boardData.title}
                        onChangeText={handleTitleChange}
                        onBlur={handleTitleBlur}
                    />
                ) : (
                    <TouchableOpacity onPress={handleTitlePress}>
                        <Text style={styles.title}>{boardData.title} ❤️</Text>
                    </TouchableOpacity>
                )}

                {isEditingDescription ? (
                    <TextInput
                        ref={descriptionInputRef}
                        style={styles.descriptionInput}
                        value={boardData.description}
                        onChangeText={handleDescriptionChange}
                        onBlur={handleDescriptionBlur}
                        multiline
                    />
                ) : (
                    <TouchableOpacity onPress={handleDescriptionPress}>
                        <Text style={styles.description}>{boardData.description}</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                horizontal={!isSmallScreen}
                contentContainerStyle={[
                    styles.listsContainer,
                    isSmallScreen && styles.listsContainerSmall
                ]}
            >
                {boardData.lists.map((list) => (
                    <TaskList
                        key={list.id}
                        list={list}
                        onUpdateTitle={(title) => updateListTitle(list.id, title)}
                        onDeleteList={() => deleteList(list.id)}
                        onAddTask={(task) => addTask(list.id, task)}
                        onUpdateTask={(taskId, updates) => updateTask(list.id, taskId, updates)}
                        onDeleteTask={(taskId) => deleteTask(list.id, taskId)}
                    />
                ))}

                <View style={styles.addListContainer}>
                    <TextInput
                        style={styles.addListInput}
                        value={newListTitle}
                        onChangeText={setNewListTitle}
                        placeholder="Título da nova lista"
                        placeholderTextColor={Colors.textSecondary}
                    />
                    <TouchableOpacity
                        style={[styles.addListButton, newListTitle.trim() === '' && styles.disabledButton]}
                        onPress={handleAddList}
                        disabled={newListTitle.trim() === ''}
                    >
                        <Text style={styles.addListButtonText}>+ Nova Lista</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    loadingText: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.titleSize,
        color: Colors.textPrimary,
    },
    header: {
        padding: Spacing.lg,
        alignItems: 'center',
    },
    title: {
        fontFamily: Fonts.titleFamily,
        fontSize: 28,
        color: Colors.textPrimary,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    titleInput: {
        fontFamily: Fonts.titleFamily,
        fontSize: 28,
        color: Colors.textPrimary,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: Colors.inputFocusBorder,
        borderRadius: 8,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        marginBottom: Spacing.sm,
        minWidth: 200,
    },
    description: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.bodySize,
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    descriptionInput: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.bodySize,
        color: Colors.textSecondary,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: Colors.inputFocusBorder,
        borderRadius: 8,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        minWidth: 250,
    },
    listsContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.lg,
    },
    listsContainerSmall: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    addListContainer: {
        width: 280,
        margin: Spacing.md,
        padding: Spacing.lg,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: Colors.primaryButton,
        alignItems: 'center',
    },
    addListInput: {
        width: '100%',
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.bodySize,
        color: Colors.textPrimary,
        backgroundColor: Colors.card,
        borderRadius: 8,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    addListButton: {
        backgroundColor: Colors.primaryButton,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: 20,
    },
    addListButtonText: {
        fontFamily: Fonts.titleFamily,
        fontSize: Fonts.bodySize,
        color: 'white',
    },
    disabledButton: {
        opacity: 0.5,
    },
});

export default Board;