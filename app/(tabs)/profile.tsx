import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView,
  Image,
  Modal,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, BorderRadius, Spacing } from '../../constants/theme';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import useUserProfile, { ThemePreset } from '../../hooks/useUserProfile';
import ColorPicker from 'react-native-wheel-color-picker';
import FontLoader from '../../components/FontLoader';

export default function ProfileScreen() {
  const { 
    profile, 
    updateName, 
    updatePhoto, 
    changeThemePreset, 
    updateCustomColors,
    themePresets
  } = useUserProfile();
  
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showCustomThemeModal, setShowCustomThemeModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [currentColor, setCurrentColor] = useState('#FFB6C1'); // Default pink
  const [currentColorKey, setCurrentColorKey] = useState<keyof typeof Colors | null>(null);

  const handleResetData = async () => {
    Alert.alert(
      'Resetar dados',
      'Tem certeza que deseja resetar todos os dados do aplicativo? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Sucesso', 'Todos os dados foram resetados com sucesso. Reinicie o aplicativo.');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível resetar os dados.');
            }
          }
        }
      ]
    );
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos da permissão para acessar suas fotos.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        await updatePhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    }
  };

  const handleNameUpdate = async () => {
    if (editName.trim() === '') {
      Alert.alert('Erro', 'O nome não pode estar vazio.');
      return;
    }
    
    const success = await updateName(editName);
    if (success) {
      setShowNameModal(false);
    } else {
      Alert.alert('Erro', 'Não foi possível atualizar o nome.');
    }
  };

  const handleThemePresetChange = async (preset: ThemePreset) => {
    const success = await changeThemePreset(preset);
    
    if (success) {
      if (preset === 'custom') {
        setShowCustomThemeModal(true);
      } else {
        setShowThemeModal(false);
      }
    } else {
      Alert.alert('Erro', 'Não foi possível alterar o tema.');
    }
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
  };

  const handleUpdateCustomColor = async () => {
    if (!currentColorKey) return;
    
    const colorUpdate = {
      [currentColorKey]: currentColor
    };
    
    const success = await updateCustomColors(colorUpdate as any);
    
    if (success) {
      setCurrentColorKey(null);
    } else {
      Alert.alert('Erro', 'Não foi possível atualizar a cor.');
    }
  };

  const openColorPicker = (colorKey: keyof typeof Colors) => {
    setCurrentColorKey(colorKey);
    setCurrentColor(profile.activeThemeColors[colorKey]);
  };

  return (
    <FontLoader>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.title}>Perfil</Text>
              <Text style={styles.subtitle}>
                Gerencie sua conta e preferências
              </Text>
            </View>

            <View style={styles.profileContainer}>
              <TouchableOpacity 
                style={styles.avatarContainer}
                onPress={handlePickImage}
              >
                {profile.photoUri ? (
                  <Image 
                    source={{ uri: profile.photoUri }} 
                    style={styles.avatar} 
                  />
                ) : (
                  <FontAwesome name="user-circle" size={80} color={Colors.textPrimary} />
                )}
                <View style={styles.editIconContainer}>
                  <FontAwesome name="camera" size={16} color="white" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.usernameContainer}
                onPress={() => {
                  setEditName(profile.name);
                  setShowNameModal(true);
                }}
              >
                <Text style={styles.username}>{profile.name}</Text>
                <FontAwesome name="pencil" size={14} color={Colors.textSecondary} style={styles.editIcon} />
              </TouchableOpacity>

              <View style={styles.optionsContainer}>
                <TouchableOpacity 
                  style={styles.optionItem}
                  onPress={() => setShowThemeModal(true)}
                >
                  <FontAwesome name="paint-brush" size={24} color={Colors.textPrimary} style={styles.optionIcon} />
                  <Text style={styles.optionText}>Tema do aplicativo</Text>
                  <View style={[styles.themePreview, { backgroundColor: profile.activeThemeColors.primaryButton }]} />
                  <FontAwesome name="chevron-right" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.optionItem}
                  onPress={() => Alert.alert('Notificações', 'Configurações de notificações estarão disponíveis em breve.')}
                >
                  <FontAwesome name="bell" size={24} color={Colors.textPrimary} style={styles.optionIcon} />
                  <Text style={styles.optionText}>Notificações</Text>
                  <FontAwesome name="chevron-right" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.optionItem}
                  onPress={() => Alert.alert('Google Calendar', 'Integração com Google Calendar estará disponível em breve.')}
                >
                  <FontAwesome name="calendar" size={24} color={Colors.textPrimary} style={styles.optionIcon} />
                  <Text style={styles.optionText}>Google Calendar</Text>
                  <FontAwesome name="chevron-right" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem}>
                  <FontAwesome name="question-circle" size={24} color={Colors.textPrimary} style={styles.optionIcon} />
                  <Text style={styles.optionText}>Ajuda e suporte</Text>
                  <FontAwesome name="chevron-right" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.optionItem, styles.dangerOption]}
                  onPress={handleResetData}
                >
                  <FontAwesome name="trash" size={24} color={Colors.deleteButton} style={styles.optionIcon} />
                  <Text style={[styles.optionText, styles.dangerText]}>Resetar dados</Text>
                  <FontAwesome name="chevron-right" size={16} color={Colors.deleteButton} />
                </TouchableOpacity>
              </View>

              <View style={styles.versionContainer}>
                <Text style={styles.versionText}>Versão 1.0.0</Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escolha um tema</Text>
              <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <TouchableOpacity 
                style={[
                  styles.themeOption,
                  profile.themePreset === 'default' && styles.themeOptionActive
                ]}
                onPress={() => handleThemePresetChange('default')}
              >
                <View style={[styles.themeColorPreview, { backgroundColor: themePresets.default.primaryButton }]} />
                <Text style={styles.themeOptionText}>Padrão (Rosa)</Text>
                {profile.themePreset === 'default' && (
                  <MaterialIcons name="check-circle" size={24} color={themePresets.default.primaryButton} />
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.themeOption,
                  profile.themePreset === 'blue' && styles.themeOptionActive
                ]}
                onPress={() => handleThemePresetChange('blue')}
              >
                <View style={[styles.themeColorPreview, { backgroundColor: themePresets.blue.primaryButton }]} />
                <Text style={styles.themeOptionText}>Azul</Text>
                {profile.themePreset === 'blue' && (
                  <MaterialIcons name="check-circle" size={24} color={themePresets.blue.primaryButton} />
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.themeOption,
                  profile.themePreset === 'green' && styles.themeOptionActive
                ]}
                onPress={() => handleThemePresetChange('green')}
              >
                <View style={[styles.themeColorPreview, { backgroundColor: themePresets.green.primaryButton }]} />
                <Text style={styles.themeOptionText}>Verde</Text>
                {profile.themePreset === 'green' && (
                  <MaterialIcons name="check-circle" size={24} color={themePresets.green.primaryButton} />
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.themeOption,
                  profile.themePreset === 'purple' && styles.themeOptionActive
                ]}
                onPress={() => handleThemePresetChange('purple')}
              >
                <View style={[styles.themeColorPreview, { backgroundColor: themePresets.purple.primaryButton }]} />
                <Text style={styles.themeOptionText}>Roxo</Text>
                {profile.themePreset === 'purple' && (
                  <MaterialIcons name="check-circle" size={24} color={themePresets.purple.primaryButton} />
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.themeOption,
                  profile.themePreset === 'custom' && styles.themeOptionActive,
                  styles.customThemeOption
                ]}
                onPress={() => handleThemePresetChange('custom')}
              >
                <View style={styles.customThemePreviewContainer}>
                  <View style={[styles.customColorSwatch, { backgroundColor: profile.activeThemeColors.primaryButton }]} />
                  <View style={[styles.customColorSwatch, { backgroundColor: profile.activeThemeColors.background }]} />
                  <View style={[styles.customColorSwatch, { backgroundColor: profile.activeThemeColors.card }]} />
                </View>
                <Text style={styles.themeOptionText}>Personalizado</Text>
                {profile.themePreset === 'custom' && (
                  <MaterialIcons name="check-circle" size={24} color={profile.activeThemeColors.primaryButton} />
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Custom Theme Editor Modal */}
      <Modal
        visible={showCustomThemeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCustomThemeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.customThemeModal]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Personalizar Tema</Text>
              <TouchableOpacity onPress={() => setShowCustomThemeModal(false)}>
                <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.customThemeDescription}>
                Toque em uma cor para personalizá-la:
              </Text>

              <View style={styles.colorOptionsList}>
                <TouchableOpacity 
                  style={styles.colorOption}
                  onPress={() => openColorPicker('primaryButton')}
                >
                  <View style={[styles.colorSwatch, { backgroundColor: profile.activeThemeColors.primaryButton }]} />
                  <Text style={styles.colorName}>Cor Principal</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.colorOption}
                  onPress={() => openColorPicker('secondaryButton')}
                >
                  <View style={[styles.colorSwatch, { backgroundColor: profile.activeThemeColors.secondaryButton }]} />
                  <Text style={styles.colorName}>Botão Secundário</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.colorOption}
                  onPress={() => openColorPicker('background')}
                >
                  <View style={[styles.colorSwatch, { backgroundColor: profile.activeThemeColors.background }]} />
                  <Text style={styles.colorName}>Fundo</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.colorOption}
                  onPress={() => openColorPicker('card')}
                >
                  <View style={[styles.colorSwatch, { backgroundColor: profile.activeThemeColors.card }]} />
                  <Text style={styles.colorName}>Cartão</Text>
                </TouchableOpacity>
              </View>

              {currentColorKey && (
                <View style={styles.colorPickerContainer}>
                  <Text style={styles.colorPickerTitle}>
                    Ajuste a cor: {currentColorKey}
                  </Text>
                  
                  <View style={styles.currentColorPreview}>
                    <View style={[styles.colorPreview, { backgroundColor: currentColor }]} />
                    <Text style={styles.colorHexCode}>{currentColor}</Text>
                  </View>
                  
                  <View style={styles.colorPickerWrapper}>
                    <ColorPicker
                      color={currentColor}
                      onColorChange={handleColorChange}
                      thumbSize={30}
                      sliderSize={30}
                      noSnap={true}
                      row={false}
                    />
                  </View>
                  
                  <View style={styles.colorPickerActions}>
                    <TouchableOpacity 
                      style={styles.cancelColorButton}
                      onPress={() => setCurrentColorKey(null)}
                    >
                      <Text style={styles.colorActionText}>Cancelar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.applyColorButton, { backgroundColor: currentColor }]}
                      onPress={handleUpdateCustomColor}
                    >
                      <Text style={styles.applyColorText}>Aplicar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Name Modal */}
      <Modal
        visible={showNameModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Nome</Text>
              <TouchableOpacity onPress={() => setShowNameModal(false)}>
                <MaterialIcons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.nameEditContainer}>
              <TextInput
                style={styles.nameInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Seu nome"
              />
              
              <TouchableOpacity
                style={styles.saveNameButton}
                onPress={handleNameUpdate}
              >
                <Text style={styles.saveNameText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </FontLoader>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.titleFamily,
    fontSize: 28,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Fonts.bodyFamily,
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  profileContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 4,
    borderColor: Colors.primaryButton,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primaryButton,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  username: {
    fontFamily: Fonts.titleFamily,
    fontSize: 24,
    color: Colors.textPrimary,
  },
  editIcon: {
    marginLeft: Spacing.xs,
  },
  optionsContainer: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  optionIcon: {
    marginRight: Spacing.md,
    width: 24,
    textAlign: 'center',
  },
  optionText: {
    flex: 1,
    fontFamily: Fonts.bodyFamily,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  dangerOption: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: Colors.deleteButton,
  },
  versionContainer: {
    marginTop: 'auto',
    paddingBottom: Spacing.lg,
  },
  versionText: {
    fontFamily: Fonts.bodyFamily,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  themePreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: Spacing.sm,
  },
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
    maxHeight: '80%',
    overflow: 'hidden',
  },
  customThemeModal: {
    maxHeight: '90%',
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
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  themeOptionActive: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  themeColorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: Spacing.md,
  },
  themeOptionText: {
    flex: 1,
    fontFamily: Fonts.bodyFamily,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  customThemeOption: {
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  customThemePreviewContainer: {
    flexDirection: 'row',
    marginRight: Spacing.md,
  },
  customColorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 2,
  },
  customThemeDescription: {
    fontFamily: Fonts.bodyFamily,
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  colorOptionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: '48%',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    padding: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.sm,
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  colorName: {
    fontFamily: Fonts.bodyFamily,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  colorPickerContainer: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
  },
  colorPickerTitle: {
    fontFamily: Fonts.bodyFamily,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  currentColorPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  colorHexCode: {
    fontFamily: Fonts.bodyFamily,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  colorPickerWrapper: {
    height: 300,
    marginBottom: Spacing.md,
  },
  colorPickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelColorButton: {
    flex: 1,
    padding: Spacing.md,
    marginRight: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  colorActionText: {
    fontFamily: Fonts.bodyFamily,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  applyColorButton: {
    flex: 1,
    padding: Spacing.md,
    marginLeft: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  applyColorText: {
    fontFamily: Fonts.bodyFamily,
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  nameEditContainer: {
    padding: Spacing.lg,
  },
  nameInput: {
    fontFamily: Fonts.bodyFamily,
    fontSize: 16,
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  saveNameButton: {
    backgroundColor: Colors.primaryButton,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  saveNameText: {
    fontFamily: Fonts.bodyFamily,
    fontSize: 16,
    color: 'white',
  },
});