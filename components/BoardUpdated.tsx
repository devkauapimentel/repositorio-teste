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
    Animated,
    Alert,
    Modal,
    Pressable
} from 'react-native';
import { useStorage } from '../hooks/useStorage';
import TaskList from './TaskList';
import { Colors, Fonts, Spacing, BorderRadius, Shadow } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

// Get screen dimensions
const windowWidth = Dimensions.get('window').width;
const isDesktop = windowWidth >= 768;

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
        updateTaskTags,
        deleteTask,
        getTagById,
        setTagFilter,
    } = useStorage();

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [newListTitle, setNewListTitle] = useState('');
    const [screenWidth, setScreenWidth] = useState(windowWidth);
    const [listAnimation] = useState(new Animated.Value(0));
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showTipsModal, setShowTipsModal] = useState(false);
    const [refreshAnimation] = useState(new Animated.Value(0));
    const [showNewListForm, setShowNewListForm] = useState(false);
    
    // New state for isolated board view
    const [isolatedListId, setIsolatedListId] = useState<string | null>(null);
    const [showTagFilterModal, setShowTagFilterModal] = useState(false);

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

    const refreshBoard = () => {
        // Rotate animation for refresh icon
        Animated.timing(refreshAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start(() => {
            refreshAnimation.setValue(0);
        });
    };

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

    // Toggle isolated list view
    const toggleIsolatedList = (listId: string | null) => {
        setIsolatedListId(listId);
    };

    // Função para abrir o modal de criação de lista
    const openNewListForm = () => {
        setShowNewListForm(true);
    };

    // Função para cancelar criação de lista
    const closeNewListForm = () => {
        setNewListTitle('');
        setShowNewListForm(false);
    };

    // Função de adicionar lista com verificação e fechamento do form
    const handleAddList = () => {
        if (newListTitle.trim() === '') return;

        // Reset animation value
        listAnimation.setValue(0);

        // Add new list
        addList(newListTitle);
        setNewListTitle('');
        setShowNewListForm(false); // Fechar o form após adicionar
    };

    // Função para reordenar listas (para implementação futura de arrastar e soltar)
    const reorderLists = (fromIndex: number, toIndex: number) => {
        // Esta função seria implementada no hook useStorage
        // e permitiria reordenar as listas no quadro
        console.log("Reordenando listas:", fromIndex, toIndex);
    };

    // Função para facilmente adicionar uma lista de template
    const addTemplateList = (templateName: string) => {
        let title = '';
        let initialTasks: { title: string; description: string }[] = [];

        switch (templateName) {
            case 'manhã':
                title = 'Cuidados da Manhã';
                initialTasks = [
                    { title: 'Beber água ao acordar', description: 'Um copo grande de água para hidratar' },
                    { title: 'Meditação matinal (5-10 min)', description: 'Respiração consciente para começar o dia' },
                    { title: 'Skincare matinal', description: 'Limpeza, tônico, hidratante e proteção solar' }
                ];
                break;
            case 'tarde':
                title = 'Cuidados da Tarde';
                initialTasks = [
                    { title: 'Pausa para alongamento', description: '5 minutos para alongar o corpo' },
                    { title: 'Lanche saudável', description: 'Frutas, oleaginosas ou iogurte' },
                    { title: 'Beber água (500ml)', description: 'Manter a hidratação durante o dia' }
                ];
                break;
            case 'noite':
                title = 'Cuidados da Noite';
                initialTasks = [
                    { title: 'Skincare noturno', description: 'Limpeza, tônico, sérum e creme noturno' },
                    { title: 'Desconexão digital', description: 'Desligar eletrônicos 1h antes de dormir' },
                    { title: 'Ritual relaxante', description: 'Chá calmante, aromaterapia ou leitura leve' }
                ];
                break;
            case 'semanal':
                title = 'Cuidados Semanais';
                initialTasks = [
                    { title: 'Máscara facial', description: 'Tratamento facial mais profundo 1-2x por semana' },
                    { title: 'Autocuidado corporal', description: 'Esfoliação e hidratação intensiva' },
                    { title: 'Registro de gratidão', description: 'Anotar 3 coisas boas da semana' }
                ];
                break;
        }

        // Reset animation value
        listAnimation.setValue(0);

        // Adicionar a lista
        const listId = addList(title);

        // Adicionar as tarefas iniciais
        initialTasks.forEach(task => {
            addTask(listId, task);
        });
    };

    const renderTemplateButtons = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templateButtonsContainer}
        >
            <TouchableOpacity
                style={styles.templateButton}
                onPress={() => addTemplateList('manhã')}
            >
                <Text style={styles.templateButtonText}>+ Manhã</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.templateButton}
                onPress={() => addTemplateList('tarde')}
            >
                <Text style={styles.templateButtonText}>+ Tarde</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.templateButton}
                onPress={() => addTemplateList('noite')}
            >
                <Text style={styles.templateButtonText}>+ Noite</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.templateButton}
                onPress={() => addTemplateList('semanal')}
            >
                <Text style={styles.templateButtonText}>+ Semanal</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    // Render tag filter modal
    const renderTagFilterModal = () => (
        <Modal
            animationType="fade"
            transparent={true}
            visible={showTagFilterModal}
            onRequestClose={() => setShowTagFilterModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Filtrar por Tag</Text>
                        <TouchableOpacity onPress={() => setShowTagFilterModal(false)}>
                            <Text style={styles.modalCloseButton}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.modalBody}>
                        <TouchableOpacity
                            style={[
                                styles.tagFilterButton,
                                !boardData.activeFilter && styles.activeTagFilterButton
                            ]}
                            onPress={() => {
                                setTagFilter(null);
                                setShowTagFilterModal(false);
                            }}
                        >
                            <Text style={styles.tagFilterButtonText}>Todas as tags</Text>
                        </TouchableOpacity>
                        
                        {boardData.tags.map(tag => (
                            <TouchableOpacity
                                key={tag.id}
                                style={[
                                    styles.tagFilterButton,
                                    { backgroundColor: tag.color + '40' },
                                    boardData.activeFilter === tag.id && styles.activeTagFilterButton
                                ]}
                                onPress={() => {
                                    setTagFilter(tag.id);
                                    setShowTagFilterModal(false);
                                }}
                            >
                                <Text style={styles.tagFilterButtonText}>{tag.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const renderInfoModal = () => (
        <Modal
            animationType="fade"
            transparent={true}
            visible={showInfoModal}
            onRequestClose={() => setShowInfoModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Sobre Rotina de Autoamor</Text>
                        <TouchableOpacity onPress={() => setShowInfoModal(false)}>
                            <Text style={styles.modalCloseButton}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.modalBody}>
                        <Text style={styles.modalParagraph}>
                            Este aplicativo foi projetado para ajudar você a criar e manter rotinas
                            de autocuidado físico e emocional, promovendo um relacionamento saudável e
                            amoroso consigo mesma.
                        </Text>
                        <Text style={styles.modalParagraph}>
                            Organize suas atividades de autocuidado em listas, defina horários e
                            acompanhe seu progresso diariamente.
                        </Text>
                        <Text style={styles.modalSectionTitle}>Como usar:</Text>
                        <Text style={styles.modalListItem}>• Crie listas para diferentes momentos do dia</Text>
                        <Text style={styles.modalListItem}>• Adicione tarefas específicas de autocuidado</Text>
                        <Text style={styles.modalListItem}>• Defina datas e horários para suas atividades</Text>
                        <Text style={styles.modalListItem}>• Marque como concluídas ao realizar</Text>
                        <Text style={styles.modalListItem}>• Use imagens para personalizar suas tarefas</Text>
                    </ScrollView>
                    <TouchableOpacity
                        style={styles.modalButton}
                        onPress={() => setShowInfoModal(false)}
                    >
                        <Text style={styles.modalButtonText}>Entendi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    const renderTipsModal = () => (
        <Modal
            animationType="fade"
            transparent={true}
            visible={showTipsModal}
            onRequestClose={() => setShowTipsModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Dicas de Autocuidado</Text>
                        <TouchableOpacity onPress={() => setShowTipsModal(false)}>
                            <Text style={styles.modalCloseButton}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.modalBody}>
                        <Text style={styles.modalSectionTitle}>Cuidados Físicos:</Text>
                        <Text style={styles.modalListItem}>• Beba pelo menos 2 litros de água por dia</Text>
                        <Text style={styles.modalListItem}>• Pratique alguma atividade física que você goste</Text>
                        <Text style={styles.modalListItem}>• Priorize sono de qualidade (7-8 horas)</Text>
                        <Text style={styles.modalListItem}>• Tenha uma rotina de skincare consistente</Text>

                        <Text style={styles.modalSectionTitle}>Cuidados Emocionais:</Text>
                        <Text style={styles.modalListItem}>• Pratique meditação ou respiração consciente</Text>
                        <Text style={styles.modalListItem}>• Mantenha um diário de gratidão</Text>
                        <Text style={styles.modalListItem}>• Estabeleça limites saudáveis nos relacionamentos</Text>
                        <Text style={styles.modalListItem}>• Reserve tempo para hobbies e atividades prazerosas</Text>

                        <Text style={styles.modalSectionTitle}>Autocuidado Mental:</Text>
                        <Text style={styles.modalListItem}>• Faça pausas regulares durante o trabalho/estudo</Text>
                        <Text style={styles.modalListItem}>• Pratique afirmações positivas diariamente</Text>
                        <Text style={styles.modalListItem}>• Limite o tempo de exposição a redes sociais</Text>
                        <Text style={styles.modalListItem}>• Busque ajuda profissional quando necessário</Text>
                    </ScrollView>
                    <TouchableOpacity
                        style={styles.modalButton}
                        onPress={() => setShowTipsModal(false)}
                    >
                        <Text style={styles.modalButtonText}>Fechar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    // Renderizar o board com as listas de tarefas - Modificado para scroll vertical no mobile
    const renderLists = () => {
        // Se estamos em modo de visualização isolada, mostrar apenas a lista selecionada
        const listsToRender = isolatedListId 
            ? boardData.lists.filter(list => list.id === isolatedListId)
            : boardData.lists;

        return (
            <View style={[
                styles.listsOuterContainer,
                isolatedListId && styles.fullscreenListContainer
            ]}>
                {isolatedListId && (
                    <View style={styles.fullscreenHeader}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => toggleIsolatedList(null)}
                        >
                            <MaterialIcons name="arrow-back" size={20} color={Colors.primaryButton} />
                            <Text style={styles.backButtonText}>Voltar</Text>
                        </TouchableOpacity>
                        
                        <View style={styles.headerActionsContainer}>
                            <TouchableOpacity onPress={() => setShowInfoModal(true)} style={styles.headerButton}>
                                <MaterialIcons name="info-outline" size={22} color={Colors.primaryButton} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={refreshBoard} style={styles.headerButton}>
                                <MaterialIcons name="refresh" size={22} color={Colors.primaryButton} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setShowTagFilterModal(true)} style={styles.headerButton}>
                                <MaterialIcons name="label" size={22} color={Colors.primaryButton} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setShowTipsModal(true)} style={styles.headerButton}>
                                <MaterialIcons name="lightbulb-outline" size={22} color={Colors.primaryButton} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                
                {/* Layout adaptativo - vertical para mobile, horizontal para desktop */}
                <ScrollView
                    horizontal={isDesktop && !isolatedListId}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[
                        isDesktop && !isolatedListId ? styles.listsContainerHorizontal : styles.listsContainerVertical
                    ]}
                >
                    {listsToRender.map((list) => {
                        // Apply animation to newly added lists
                        const animatedStyle = listAnimation ? {
                            transform: [
                                {
                                    scale: listAnimation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.9, 1],
                                    }),
                                },
                            ],
                            opacity: listAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 1],
                            }),
                        } : {};

                        return (
                            <Animated.View key={list.id} style={animatedStyle}>
                                <TaskList
                                    list={list}
                                    onUpdateTitle={(title) => updateListTitle(list.id, title)}
                                    onDeleteList={() => deleteList(list.id)}
                                    onAddTask={(task) => addTask(list.id, task)}
                                    onUpdateTask={(taskId, updates) => updateTask(list.id, taskId, updates)}
                                    onUpdateTaskTags={(taskId, tags) => updateTaskTags(list.id, taskId, tags)}
                                    onDeleteTask={(taskId) => deleteTask(list.id, taskId)}
                                    onIsolateList={() => toggleIsolatedList(list.id)}
                                    isIsolated={isolatedListId === list.id}
                                    availableTags={boardData.tags}
                                    getTagById={getTagById}
                                    isDesktopView={isDesktop}
                                />
                            </Animated.View>
                        );
                    })}
                </ScrollView>
            </View>
        );
    };

    // Modal para criação de nova lista
    const renderNewListModal = () => (
        <Modal
            visible={showNewListForm}
            transparent={true}
            animationType="fade"
            onRequestClose={closeNewListForm}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.newListModalContent}>
                    <Text style={styles.newListModalTitle}>Nova Lista</Text>
                    
                    <TextInput
                        style={styles.addListInput}
                        value={newListTitle}
                        onChangeText={setNewListTitle}
                        placeholder="Título da nova lista..."
                        placeholderTextColor={Colors.textSecondary}
                        autoFocus
                    />
                    
                    <View style={styles.newListModalButtons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={closeNewListForm}
                        >
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                newListTitle.trim() === '' && styles.disabledButton
                            ]}
                            onPress={handleAddList}
                            disabled={newListTitle.trim() === ''}
                        >
                            <Text style={styles.confirmButtonText}>Criar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

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
            <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={true}
            >
                {!isolatedListId && (
                    <View style={styles.header}>
                        <View style={styles.headerControls}>
                            <TouchableOpacity onPress={() => setShowInfoModal(true)} style={styles.headerButton}>
                                <MaterialIcons name="info-outline" size={22} color={Colors.primaryButton} />
                            </TouchableOpacity>

                            <Animated.View style={{
                                transform: [{
                                    rotate: refreshAnimation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '360deg']
                                    })
                                }]
                            }}>
                                <TouchableOpacity onPress={refreshBoard} style={styles.headerButton}>
                                    <MaterialIcons name="refresh" size={22} color={Colors.primaryButton} />
                                </TouchableOpacity>
                            </Animated.View>

                            <TouchableOpacity onPress={() => setShowTagFilterModal(true)} style={styles.headerButton}>
                                <MaterialIcons name="label" size={22} color={Colors.primaryButton} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setShowTipsModal(true)} style={styles.headerButton}>
                                <MaterialIcons name="lightbulb-outline" size={22} color={Colors.primaryButton} />
                            </TouchableOpacity>
                        </View>

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
                )}

                {renderLists()}
            </ScrollView>

            {/* Modais informativos */}
            {renderInfoModal()}
            {renderTipsModal()}
            {renderNewListModal()}
            {renderTagFilterModal()}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContainer: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: 20,
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
    headerControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: Spacing.md,
        width: '100%',
    },
    fullscreenHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        backgroundColor: Colors.background,
        zIndex: 10,
    },
    headerActionsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
        padding: Spacing.sm,
        marginHorizontal: Spacing.md,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        borderRadius: BorderRadius.md,
        ...Shadow.light,
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
    listsOuterContainer: {
        flex: 1,
    },
    listsContainerHorizontal: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.lg,
        minHeight: 600,
    },
    listsContainerVertical: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 30,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: BorderRadius.sm,
        ...Shadow.light,
    },
    backButtonText: {
        fontFamily: Fonts.bodyFamily,
        color: Colors.textPrimary,
        marginLeft: 8,
    },
    fullscreenListContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        backgroundColor: Colors.background,
        height: '100%',
    },
    templateButtonsContainer: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    templateButton: {
        backgroundColor: 'rgba(255, 182, 193, 0.3)',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: 20,
        marginHorizontal: Spacing.xs,
        borderWidth: 1,
        borderColor: Colors.primaryButton,
    },
    templateButtonText: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.smallSize,
        color: Colors.textPrimary,
    },
    addListContainer: {
        width: 280,
        minHeight: 100,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        margin: Spacing.md,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: Colors.primaryButton,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addListButtonMobile: {
        width: '90%',
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: BorderRadius.md,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: Colors.primaryButton,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    addListInput: {
        width: '100%',
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.bodySize,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.sm,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        marginVertical: Spacing.md,
    },
    addListButtonText: {
        color: Colors.textPrimary,
        fontFamily: Fonts.titleFamily,
        fontSize: 18,
    },
    addListButtonTextLarge: {
        color: Colors.textPrimary,
        fontFamily: Fonts.titleFamily,
        fontSize: 18,
    },
    disabledButton: {
        opacity: 0.5,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    modalContent: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        width: '90%',
        maxWidth: 400,
        ...Shadow.medium,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
        padding: Spacing.md,
    },
    modalTitle: {
        fontFamily: Fonts.titleFamily,
        fontSize: Fonts.titleSize,
        color: Colors.textPrimary,
    },
    modalCloseButton: {
        fontSize: 18,
        color: Colors.textSecondary,
        padding: Spacing.xs,
    },
    modalBody: {
        padding: Spacing.md,
    },
    modalParagraph: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.bodySize,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
        lineHeight: 22,
    },
    modalSectionTitle: {
        fontFamily: Fonts.titleFamily,
        fontSize: Fonts.bodySize + 2,
        color: Colors.textPrimary,
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
    },
    modalListItem: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.bodySize,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
        paddingLeft: Spacing.sm,
    },
    modalButton: {
        backgroundColor: Colors.primaryButton,
        alignItems: 'center',
        padding: Spacing.md,
        margin: Spacing.md,
        borderRadius: BorderRadius.sm,
    },
    modalButtonText: {
        fontFamily: Fonts.titleFamily,
        fontSize: Fonts.bodySize,
        color: 'white',
    },
    newListModalContent: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        width: '90%',
        padding: 20,
        ...Shadow.medium,
    },
    newListModalTitle: {
        fontFamily: Fonts.titleFamily,
        fontSize: 24,
        color: Colors.textPrimary,
        marginBottom: 16,
        textAlign: 'center',
    },
    newListModalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    cancelButton: {
        flex: 1,
        padding: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: BorderRadius.sm,
        marginRight: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontFamily: Fonts.bodyFamily,
        color: Colors.textPrimary,
    },
    confirmButton: {
        flex: 1,
        padding: 12,
        backgroundColor: Colors.primaryButton,
        borderRadius: BorderRadius.sm,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontFamily: Fonts.bodyFamily,
        color: 'white',
    },
    tagFilterButton: {
        padding: Spacing.sm,
        borderRadius: BorderRadius.sm,
        marginBottom: Spacing.sm,
        alignItems: 'center',
    },
    activeTagFilterButton: {
        borderWidth: 2,
        borderColor: Colors.primaryButton,
    },
    tagFilterButtonText: {
        fontFamily: Fonts.bodyFamily,
        fontSize: Fonts.bodySize,
        color: Colors.textPrimary,
    },
});

export default BoardUpdated;