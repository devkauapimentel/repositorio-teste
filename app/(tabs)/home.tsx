import React from 'react';
import { StyleSheet, View, StatusBar, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BoardUpdated from '../../components/BoardUpdated';
import CreateActionButton from '../../components/CreateActionButton';
import { useStorage } from '../../hooks/useStorage';
import { Colors } from '../../constants/theme';
import FontLoader from '../../components/FontLoader';

const windowWidth = Dimensions.get('window').width;
const isSmallScreen = windowWidth < 600;

export default function HomeScreen() {
  const { boardData, addList, addTask } = useStorage();

  const handleAddList = (title: string, imageUri?: string) => {
    // Note: The useStorage hook currently doesn't support list images,
    // but we're making it ready for future implementation
    addList(title);
  };

  const handleAddTask = (task: {
    title: string;
    description?: string;
    dueDate?: string;
    imageUri?: string;
    tags: string[];
    targetListId?: string;
  }) => {
    if (task.targetListId) {
      addTask(task.targetListId, {
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        imageUri: task.imageUri,
      }, task.tags);
    }
  };

  return (
    <FontLoader>
      <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <View style={[
          styles.boardContainer,
          isSmallScreen && styles.boardContainerMobile
        ]}>
          <BoardUpdated />
          <CreateActionButton 
            onAddList={handleAddList}
            onAddTask={handleAddTask}
            lists={boardData.lists.map(list => ({ id: list.id, title: list.title }))}
            availableTags={boardData.tags}
          />
        </View>
      </SafeAreaView>
    </FontLoader>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  boardContainer: {
    flex: 1,
  },
  boardContainerMobile: {
    paddingBottom: 60, // Increased padding to avoid tab bar overlap
  }
});
