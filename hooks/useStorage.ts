// 📁 hooks/useStorage.ts
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export type Task = {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    completed: boolean;
    imageUri?: string;
    completedAt?: string;
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
};

// Default data
const DEFAULT_BOARD_DATA: BoardData = {
    title: 'Rotina de Autoamor',
    description: 'Um aplicativo para organizar suas tarefas.',
    lists: [
        {
            id: '1',
            title: 'Sono e Despertar',
            tasks: [
                { id: '1-1', title: 'Dormir às 23h', completed: false },
                { id: '1-2', title: 'Acordar às 7h', completed: false },
                { id: '1-3', title: 'Ritual pré-sono (banho morno, leitura leve)', completed: false },
                { id: '1-4', title: 'Evitar telas e cafeína +/-2h antes de dormir', completed: false },
            ]
        },
        {
            id: '2',
            title: 'Exercício Matinal',
            tasks: [
                { id: '2-1', title: 'Caminhar 30 min às 8h', completed: false },
                { id: '2-2', title: 'Registrar passos ou distância', completed: false },
            ]
        },
        {
            id: '3',
            title: 'Alimentação',
            tasks: [
                { id: '3-1', title: 'Café da manhã (proteína + fruta) às 7h', completed: false },
                { id: '3-2', title: 'Almoço mediterrâneo às 11h', completed: false },
                { id: '3-3', title: 'Lanche leve (oleaginosas ou iogurta) às 15h', completed: false },
                { id: '3-4', title: 'Jantar leve às 19h', completed: false },
            ]
        },
        {
            id: '4',
            title: 'Autocuidado & Hobbies',
            tasks: [
                { id: '4-1', title: 'Escrever no diário 20 min', completed: false },
                { id: '4-2', title: 'Desenhar 20 min', completed: false },
                { id: '4-3', title: 'Maquilagem e autocuidado 15 min', completed: false },
            ]
        },
        {
            id: '5',
            title: 'Estudo (Pomodoro)',
            tasks: [
                { id: '5-1', title: '18h-16h: 4 Pomodoros (25 min estudo + 5 min pausa)', completed: false },
                { id: '5-2', title: '16h15-19h: Revisão leve e leitura', completed: false },
            ]
        },
        {
            id: '6',
            title: 'Terapia & Medicação',
            tasks: [
                { id: '6-1', title: 'Terapia semanal (dia e hora)', completed: false },
                { id: '6-2', title: 'Tomar Bupropiona ao acordar', completed: false },
                { id: '6-3', title: 'Tomar Aripiprazol ao dormir', completed: false },
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

    const addTask = (listId: string, task: Omit<Task, 'id' | 'completed' | 'completedAt'>) => {
        const newTask: Task = {
            id: Date.now().toString(),
            ...task,
            completed: false
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

    return {
        boardData,
        isLoading,
        updateBoardInfo,
        addList,
        updateListTitle,
        deleteList,
        addTask,
        updateTask,
        deleteTask
    };
};
