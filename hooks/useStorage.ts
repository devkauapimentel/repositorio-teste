// 📁 hooks/useStorage.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Adicionar tipo para tags
export type Tag = {
    id: string;
    name: string;
    color: string;
};

// Types
export type Task = {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    completed: boolean;
    imageUri?: string;
    completedAt?: string;
    tags: string[]; // Array de IDs de tags
};

export type TaskList = {
    id: string;
    title: string;
    tasks: Task[];
};

export type BoardData = {
    title: string;
    description: string;
    lists: TaskList[];
    tags: Tag[]; // Lista global de tags disponíveis
    activeFilter: string | null; // Filtro de tag ativo
};

// Tags padrão predefinidas
const DEFAULT_TAGS: Tag[] = [
    { id: 'tag-1', name: 'Manhã', color: '#FFD580' }, // Laranja claro
    { id: 'tag-2', name: 'Tarde', color: '#ADD8E6' }, // Azul claro
    { id: 'tag-3', name: 'Noite', color: '#D8BFD8' }, // Lavanda
    { id: 'tag-4', name: 'Semanal', color: '#90EE90' }, // Verde claro
    { id: 'tag-5', name: 'Importante', color: '#FFA07A' }, // Salmão
    { id: 'tag-6', name: 'Pessoal', color: '#FFCC99' }, // Pêssego
];

// Default data
const DEFAULT_BOARD_DATA: BoardData = {
    title: 'Rotina de Autoamor',
    description: 'Um aplicativo para organizar suas tarefas.',
    tags: DEFAULT_TAGS,
    activeFilter: null,
    lists: [
        {
            id: '1',
            title: 'Sono e Despertar',
            tasks: [
                { id: '1-1', title: 'Dormir às 23h', completed: false, tags: ['tag-3'] },
                { id: '1-2', title: 'Acordar às 7h', completed: false, tags: ['tag-1'] },
                { id: '1-3', title: 'Ritual pré-sono (banho morno, leitura leve)', completed: false, tags: ['tag-3'] },
                { id: '1-4', title: 'Evitar telas e cafeína +/-2h antes de dormir', completed: false, tags: ['tag-3'] },
            ]
        },
        {
            id: '2',
            title: 'Exercício Matinal',
            tasks: [
                { id: '2-1', title: 'Caminhar 30 min às 8h', completed: false, tags: ['tag-1'] },
                { id: '2-2', title: 'Registrar passos ou distância', completed: false, tags: ['tag-1'] },
            ]
        },
        {
            id: '3',
            title: 'Alimentação',
            tasks: [
                { id: '3-1', title: 'Café da manhã (proteína + fruta) às 7h', completed: false, tags: ['tag-1'] },
                { id: '3-2', title: 'Almoço mediterrâneo às 11h', completed: false, tags: ['tag-2'] },
                { id: '3-3', title: 'Lanche leve (oleaginosas ou iogurta) às 15h', completed: false, tags: ['tag-2'] },
                { id: '3-4', title: 'Jantar leve às 19h', completed: false, tags: ['tag-3'] },
            ]
        },
        {
            id: '4',
            title: 'Autocuidado & Hobbies',
            tasks: [
                { id: '4-1', title: 'Escrever no diário 20 min', completed: false, tags: ['tag-6', 'tag-4'] },
                { id: '4-2', title: 'Desenhar 20 min', completed: false, tags: ['tag-6'] },
                { id: '4-3', title: 'Maquilagem e autocuidado 15 min', completed: false, tags: ['tag-1', 'tag-6'] },
            ]
        },
        {
            id: '5',
            title: 'Estudo (Pomodoro)',
            tasks: [
                { id: '5-1', title: '18h-16h: 4 Pomodoros (25 min estudo + 5 min pausa)', completed: false, tags: ['tag-2'] },
                { id: '5-2', title: '16h15-19h: Revisão leve e leitura', completed: false, tags: ['tag-3'] },
            ]
        },
        {
            id: '6',
            title: 'Terapia & Medicação',
            tasks: [
                { id: '6-1', title: 'Terapia semanal (dia e hora)', completed: false, tags: ['tag-4', 'tag-5'] },
                { id: '6-2', title: 'Tomar Bupropiona ao acordar', completed: false, tags: ['tag-1', 'tag-5'] },
                { id: '6-3', title: 'Tomar Aripiprazol ao dormir', completed: false, tags: ['tag-3', 'tag-5'] },
            ]
        }
    ]
};

// Storage key
const BOARD_DATA_KEY = '@RotinaAutoamor:boardData';

export const useStorage = () => {
    const [boardData, setBoardData] = useState<BoardData>(DEFAULT_BOARD_DATA);
    const [isLoading, setIsLoading] = useState(true);

    // Carrega os dados ao montar o componente
    useEffect(() => {
        const loadData = async () => {
            try {
                const storedData = await AsyncStorage.getItem(BOARD_DATA_KEY);
                if (storedData) {
                    const parsedData = JSON.parse(storedData) as BoardData;
                    
                    // Migrar dados antigos se não tiverem campo de tags
                    if (!parsedData.tags) {
                        parsedData.tags = DEFAULT_TAGS;
                        parsedData.activeFilter = null;
                    }
                    
                    // Garantir que todas as tarefas tenham campo de tags
                    parsedData.lists.forEach(list => {
                        list.tasks.forEach(task => {
                            if (!task.tags) {
                                task.tags = [];
                            }
                        });
                    });
                    
                    setBoardData(parsedData);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Salva os dados no AsyncStorage
    const saveData = async (data: BoardData) => {
        try {
            await AsyncStorage.setItem(BOARD_DATA_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    };

    // Limpa tarefas completas com mais de 24h ao montar
    useEffect(() => {
        const removeOldCompletedTasks = () => {
            const now = new Date();

            const updatedLists = boardData.lists.map(list => {
                const updatedTasks = list.tasks.filter(task => {
                    if (task.completed && task.completedAt) {
                        const completedDate = new Date(task.completedAt);
                        const timeDiff = now.getTime() - completedDate.getTime();
                        const hoursDiff = timeDiff / (1000 * 60 * 60);
                        return hoursDiff < 24;
                    }
                    return true;
                });

                return { ...list, tasks: updatedTasks };
            });

            const updatedBoardData = { ...boardData, lists: updatedLists };

            // Só atualiza o estado se houver mudanças
            if (JSON.stringify(boardData) !== JSON.stringify(updatedBoardData)) {
                setBoardData(updatedBoardData);
                saveData(updatedBoardData);
            }
        };

        removeOldCompletedTasks(); // Executa uma vez

        const interval = setInterval(removeOldCompletedTasks, 60 * 60 * 1000); // Executa a cada hora
        return () => clearInterval(interval);
    }, []); // ❗ removido boardData das dependências para evitar loop

    // Atualizações de tags e filtros
    const setTagFilter = (tagId: string | null) => {
        const updatedBoardData = { ...boardData, activeFilter: tagId };
        setBoardData(updatedBoardData);
        saveData(updatedBoardData);
    };

    const addTag = (name: string, color: string) => {
        const newTag: Tag = {
            id: `tag-${Date.now()}`,
            name,
            color
        };

        const updatedBoardData = {
            ...boardData,
            tags: [...boardData.tags, newTag]
        };

        setBoardData(updatedBoardData);
        saveData(updatedBoardData);
        return newTag.id;
    };

    const updateTag = (tagId: string, updates: Partial<Omit<Tag, 'id'>>) => {
        const updatedTags = boardData.tags.map(tag =>
            tag.id === tagId ? { ...tag, ...updates } : tag
        );

        const updatedBoardData = { ...boardData, tags: updatedTags };
        setBoardData(updatedBoardData);
        saveData(updatedBoardData);
    };

    const deleteTag = (tagId: string) => {
        // Remover a tag da lista global
        const updatedTags = boardData.tags.filter(tag => tag.id !== tagId);
        
        // Remover a tag de todas as tarefas que a usam
        const updatedLists = boardData.lists.map(list => {
            const updatedTasks = list.tasks.map(task => {
                return {
                    ...task,
                    tags: task.tags.filter(id => id !== tagId)
                };
            });
            return { ...list, tasks: updatedTasks };
        });

        // Limpar o filtro ativo se ele for a tag removida
        const updatedActiveFilter = boardData.activeFilter === tagId ? null : boardData.activeFilter;

        const updatedBoardData = { 
            ...boardData, 
            tags: updatedTags, 
            lists: updatedLists,
            activeFilter: updatedActiveFilter 
        };
        
        setBoardData(updatedBoardData);
        saveData(updatedBoardData);
    };

    // Funções existentes
    const updateBoardInfo = (title: string, description: string) => {
        const updatedData = { ...boardData, title, description };
        setBoardData(updatedData);
        saveData(updatedData);
    };

    const addList = (title: string) => {
        const newList: TaskList = {
            id: Date.now().toString(),
            title,
            tasks: []
        };
        const updatedData = {
            ...boardData,
            lists: [...boardData.lists, newList]
        };
        setBoardData(updatedData);
        saveData(updatedData);
        return newList.id;
    };

    const updateListTitle = (listId: string, title: string) => {
        const updatedLists = boardData.lists.map(list =>
            list.id === listId ? { ...list, title } : list
        );
        const updatedData = { ...boardData, lists: updatedLists };
        setBoardData(updatedData);
        saveData(updatedData);
    };

    const deleteList = (listId: string) => {
        const updatedLists = boardData.lists.filter(list => list.id !== listId);
        const updatedData = { ...boardData, lists: updatedLists };
        setBoardData(updatedData);
        saveData(updatedData);
    };

    const addTask = (listId: string, task: Omit<Task, 'id' | 'completed' | 'completedAt' | 'tags'>, taskTags: string[] = []) => {
        const newTask: Task = {
            id: Date.now().toString(),
            ...task,
            completed: false,
            tags: taskTags,
        };

        const updatedLists = boardData.lists.map(list =>
            list.id === listId ? { ...list, tasks: [...list.tasks, newTask] } : list
        );

        const updatedData = { ...boardData, lists: updatedLists };
        setBoardData(updatedData);
        saveData(updatedData);
        return newTask.id;
    };

    const updateTask = (listId: string, taskId: string, updates: Partial<Omit<Task, 'id'>>) => {
        const updatedLists = boardData.lists.map(list => {
            if (list.id === listId) {
                const updatedTasks = list.tasks.map(task => {
                    if (task.id === taskId) {
                        // Se a tarefa for marcada como completa, adicionar timestamp
                        if (updates.completed && updates.completed !== task.completed) {
                            updates.completedAt = new Date().toISOString();
                        }
                        return { ...task, ...updates };
                    }
                    return task;
                });
                return { ...list, tasks: updatedTasks };
            }
            return list;
        });

        const updatedData = { ...boardData, lists: updatedLists };
        setBoardData(updatedData);
        saveData(updatedData);
    };

    // Função especial para atualizar tags em uma tarefa
    const updateTaskTags = (listId: string, taskId: string, tags: string[]) => {
        const updatedLists = boardData.lists.map(list => {
            if (list.id === listId) {
                const updatedTasks = list.tasks.map(task => {
                    if (task.id === taskId) {
                        return { ...task, tags };
                    }
                    return task;
                });
                return { ...list, tasks: updatedTasks };
            }
            return list;
        });

        const updatedData = { ...boardData, lists: updatedLists };
        setBoardData(updatedData);
        saveData(updatedData);
    };

    const deleteTask = (listId: string, taskId: string) => {
        const updatedLists = boardData.lists.map(list => {
            if (list.id === listId) {
                const updatedTasks = list.tasks.filter(task => task.id !== taskId);
                return { ...list, tasks: updatedTasks };
            }
            return list;
        });

        const updatedData = { ...boardData, lists: updatedLists };
        setBoardData(updatedData);
        saveData(updatedData);
    };

    // Obter tarefas filtradas por tag
    const getFilteredLists = () => {
        if (!boardData.activeFilter) {
            return boardData.lists;
        }

        return boardData.lists.map(list => {
            return {
                ...list,
                tasks: list.tasks.filter(task => task.tags.includes(boardData.activeFilter!))
            };
        });
    };

    // Obter todas as tarefas de uma lista específica
    const getTasksForList = (listId: string) => {
        const list = boardData.lists.find(list => list.id === listId);
        return list ? list.tasks : [];
    };

    // Obter uma tag por ID
    const getTagById = (tagId: string) => {
        return boardData.tags.find(tag => tag.id === tagId);
    };

    return {
        boardData,
        isLoading,
        getFilteredLists,
        getTasksForList,
        getTagById,
        updateBoardInfo,
        addList,
        updateListTitle,
        deleteList,
        addTask,
        updateTask,
        updateTaskTags,
        deleteTask,
        setTagFilter,
        addTag,
        updateTag,
        deleteTag,
    };
};
