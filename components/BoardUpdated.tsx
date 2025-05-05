import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Animated
} from 'react-native';
import { useStorage } from '../hooks/useStorage';
import TaskList from './TaskList';
import { Colors, Fonts, Spacing } from '../constants/theme';

// Get screen dimensions
const windowWidth = Dimensions.get('window').width;
const isSmallScreen = windowWidth < 600;

const BoardUpdated: React.FC = () => {
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
    const [screenWidth, setScreenWidth] = useState(windowWidth);
    const [listAnimation] = useState(new Animated.Value(0));

    const scrollViewRef = useRef<ScrollView>(null);
    const titleInputRef = useRef<TextInput>(null);
    const descriptionInputRef = useRef<TextInput>(null);

    // Monitor screen width changes
    useEffect(() => {
        const handleDimensionsChange = ({ window: { width } }: { window: { width: number } }) => {
            setScreenWidth(width);
        };

        const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

        return () => {
            subscription.remove();
        };
    }, []);

    // Scroll to the last list when a new one is added
    useEffect(() => {
        if (!isSmallScreen && boardData.lists.length > 0 && scrollViewRef.current) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 300);
        }
    }, [boardData.lists.length, isSmallScreen]);

    // Run animation when lists change
    useEffect(() => {
        Animated.spring(listAnimation, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true,
        }).start();

        return () => {
            listAnimation.setValue(0);
        };
    }, [boardData.lists.length, listAnimation]);

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

        // Reset animation value
        listAnimation.setValue(0);

        // Add new list
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
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <View style={styles.header}>
                {isEditingTitle ? (
                    <TextInput
                        ref={titleInputRef}
                        style={styles.titleInput}
                        value={boardData.title}
                        onChangeText={handleTitleChange}
                        onBlur={handleTitleBlur}
                        autoFocus
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
                ref={scrollViewRef}
                horizontal={!isSmallScreen}
                contentContainerStyle={[
                    styles.listsContainer,
                    isSmallScreen && styles.listsContainerSmall
                ]}
                showsHorizontalScrollIndicator={!isSmallScreen}
                showsVerticalScrollIndicator={isSmallScreen}
                scrollEventThrottle={16}
            >
                {boardData.lists.map((list, index) => (
                    <Animated.View
                        key={list.id}
                        style={{
                            transform: [
                                {
                                    scale: index === boardData.lists.length - 1
                                        ? listAnimation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.9, 1]
                                        })
                                        : 1
                                }
                            ],
                            opacity: index === boardData.lists.length - 1
                                ? listAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.7, 1]
                                })
                                : 1
                        }}
                    >
                        <TaskList
                            list={list}
                            onUpdateTitle={(title) => updateListTitle(list.id, title)}
                            onDeleteList={() => deleteList(list.id)}
                            onAddTask={(task) => addTask(list.id, task)}
                            onUpdateTask={(taskId, updates) => updateTask(list.id, taskId, updates)}
                            onDeleteTask={(taskId) => deleteTask(list.id, taskId)}
                        />
                    </Animated.View>
                ))}

                <View style={[
                    styles.addListContainer,
                    isSmallScreen && styles.addListContainerSmall
                ]}>
                    <TextInput
                        style={styles.addListInput}
                        value={newListTitle}
                        onChangeText={setNewListTitle}
                        placeholder="Título da nova lista"
                        placeholderTextColor={Colors.textSecondary}
                        onSubmitEditing={handleAddList}
                    />
                    <TouchableOpacity
                        style={[
                            styles.addListButton,
                            newListTitle.trim() === '' && styles.disabledButton
                        ]}
                        onPress={handleAddList}
                        disabled={newListTitle.trim() === ''}
                    >
                        <Text style={styles.addListButtonText}>+ Nova Lista</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
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
        marginBottom: Spacing.md,
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
        marginBottom: Spacing.md,
        minWidth: 250,
    },
    listsContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.xl,
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
        alignSelf: 'flex-start',
    },
    addListContainerSmall: {
        width: '92%',
        alignSelf: 'center',
        marginHorizontal: 0,
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

export default BoardUpdated;