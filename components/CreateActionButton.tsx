import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Fonts, BorderRadius, Shadow, Spacing } from '../constants/theme';
import NewTaskModal from './NewTaskModal';
import NewListModal from './NewListModal';
import { Tag } from '../hooks/useStorage';

interface CreateActionButtonProps {
  onAddTask: (task: {
    title: string;
    description?: string;
    dueDate?: string;
    imageUri?: string;
    tags: string[];
    targetListId?: string;
  }) => void;
  onAddList: (title: string, imageUri?: string) => void;
  lists: { id: string; title: string }[];
  availableTags: Tag[];
}

const CreateActionButton: React.FC<CreateActionButtonProps> = ({
  onAddTask,
  onAddList,
  lists,
  availableTags,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  });
  const isDesktop = dimensions.width >= 768;

  // Monitor screen dimensions changes
  useEffect(() => {
    const handleDimensionsChange = ({ window }: { window: { width: number, height: number } }) => {
      setDimensions({ width: window.width, height: window.height });
    };

    const subscription = Dimensions.addEventListener('change', handleDimensionsChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;

    // Animate main button rotation
    Animated.spring(animation, {
      toValue,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();

    // Add a subtle "pop" animation when toggling
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    Animated.spring(animation, {
      toValue: 0,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
    setIsOpen(false);
  };

  const rotation = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg'],
        }),
      },
      {
        scale: scaleAnimation
      }
    ],
  };

  const taskButtonStyle = {
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [40, -80],
        }),
      },
    ],
    opacity: animation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1],
    }),
  };

  const listButtonStyle = {
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [40, -150],
        }),
      },
    ],
    opacity: animation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1],
    }),
  };

  const handleOpenNewTask = () => {
    closeMenu();
    setShowNewTaskModal(true);
  };

  const handleOpenNewList = () => {
    closeMenu();
    setShowNewListModal(true);
  };

  const handleAddTask = (task: {
    title: string;
    description?: string;
    dueDate?: string;
    imageUri?: string;
    tags: string[];
    targetListId?: string;
  }) => {
    onAddTask(task);
    setShowNewTaskModal(false);
  };

  const handleAddList = (title: string, imageUri?: string) => {
    onAddList(title, imageUri);
    setShowNewListModal(false);
  };

  return (
    <>
      <View style={[
        styles.container,
        isDesktop ? styles.containerDesktop : styles.containerMobile
      ]}>
        {/* Botão para criar tarefa */}
        <Animated.View style={[styles.actionButton, styles.secondaryButton, taskButtonStyle]}>
          <TouchableOpacity
            style={styles.actionButtonInner}
            onPress={handleOpenNewTask}
            activeOpacity={0.7}
          >
            <MaterialIcons name="assignment" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.actionButtonLabel}>
            <Text style={styles.actionButtonText}>Nova Atividade</Text>
          </View>
        </Animated.View>

        {/* Botão para criar quadro/lista */}
        <Animated.View style={[styles.actionButton, styles.secondaryButton, listButtonStyle]}>
          <TouchableOpacity
            style={styles.actionButtonInner}
            onPress={handleOpenNewList}
            activeOpacity={0.7}
          >
            <MaterialIcons name="dashboard" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.actionButtonLabel}>
            <Text style={styles.actionButtonText}>Novo Quadro</Text>
          </View>
        </Animated.View>

        {/* Botão principal */}
        <Animated.View style={[
          styles.actionButton, 
          styles.mainButton, 
          rotation,
          isOpen && styles.activeMainButton
        ]}>
          <TouchableOpacity
            style={styles.actionButtonInner}
            onPress={toggleMenu}
            activeOpacity={0.7}
          >
            <MaterialIcons name="add" size={30} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Overlay para fechar o menu quando aberto */}
      {isOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={0}
          onPress={closeMenu}
        />
      )}

      {/* Modais */}
      <NewTaskModal
        visible={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        onAddTask={handleAddTask}
        availableTags={availableTags}
        listTitle="Selecione um quadro"
        lists={lists}
      />

      <NewListModal
        visible={showNewListModal}
        onClose={() => setShowNewListModal(false)}
        onAddList={handleAddList}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 999,
  },
  containerMobile: {
    bottom: Platform.OS === 'ios' ? 90 : 65,
    right: 20,
  },
  containerDesktop: {
    bottom: 30,
    left: 30,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  actionButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.medium,
  },
  actionButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButton: {
    backgroundColor: Colors.primaryButton,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeMainButton: {
    backgroundColor: Colors.secondaryButton,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.secondaryButton || '#FF8FA3',
  },
  actionButtonLabel: {
    position: 'absolute',
    right: 60,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: Fonts.bodyFamily,
  },
});

export default CreateActionButton; 