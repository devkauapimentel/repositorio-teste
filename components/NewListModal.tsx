import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Fonts, BorderRadius, Shadow, Spacing } from '../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface NewListModalProps {
  visible: boolean;
  onClose: () => void;
  onAddList: (title: string, imageUri?: string) => void;
}

const NewListModal: React.FC<NewListModalProps> = ({
  visible,
  onClose,
  onAddList,
}) => {
  const [title, setTitle] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  const resetForm = () => {
    setTitle('');
    setImageUri(undefined);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddList = () => {
    if (title.trim() === '') return;

    onAddList(title.trim(), imageUri);
    resetForm();
    onClose();
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Precisamos de permissão para acessar sua galeria de fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Novo Quadro</Text>
            <TouchableOpacity onPress={handleClose}>
              <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Título do Quadro</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Digite o título do novo quadro..."
              placeholderTextColor={Colors.textSecondary}
              autoFocus
            />

            <Text style={styles.inputLabel}>Imagem (opcional)</Text>
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: imageUri }} 
                  style={styles.image} 
                  resizeMode="cover"
                />
                <View style={styles.imageActions}>
                  <TouchableOpacity 
                    style={styles.imageActionButton}
                    onPress={handlePickImage}
                  >
                    <MaterialIcons name="edit" size={20} color="white" />
                    <Text style={styles.imageActionText}>Mudar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.imageActionButton, { backgroundColor: Colors.deleteButton }]}
                    onPress={() => setImageUri(undefined)}
                  >
                    <MaterialIcons name="delete" size={20} color="white" />
                    <Text style={styles.imageActionText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={handlePickImage}
              >
                <MaterialIcons name="image" size={24} color={Colors.textSecondary} />
                <Text style={styles.imagePickerText}>
                  Toque para adicionar uma imagem
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.createButton,
                title.trim() === '' && styles.disabledButton
              ]}
              onPress={handleAddList}
              disabled={title.trim() === ''}
            >
              <Text style={styles.createButtonText}>Criar Quadro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
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
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  titleInput: {
    fontFamily: Fonts.bodyFamily,
    fontSize: Fonts.bodySize,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    backgroundColor: 'white',
  },
  imageContainer: {
    marginTop: Spacing.sm,
  },
  image: {
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
  createButton: {
    backgroundColor: Colors.primaryButton,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  createButtonText: {
    fontFamily: Fonts.bodyFamily,
    color: 'white',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default NewListModal; 