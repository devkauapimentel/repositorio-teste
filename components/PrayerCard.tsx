import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform 
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { PrayerWithUserData } from '../hooks/usePrayers';
import { Colors, Fonts, BorderRadius, Shadow, Spacing } from '../constants/theme';

interface PrayerCardProps {
  prayer: PrayerWithUserData;
  onToggleFavorite: (id: string) => void;
  onMarkCompleted: (id: string) => void;
  onStartTimer: (id: string) => void;
  expanded: boolean;
  onToggleExpand: (id: string) => void;
}

const PrayerCard: React.FC<PrayerCardProps> = ({
  prayer,
  onToggleFavorite,
  onMarkCompleted,
  onStartTimer,
  expanded,
  onToggleExpand,
}) => {
  const { id, title, text, category, duration, userData } = prayer;
  const { favorite, completed, completionCount, lastCompleted } = userData;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <View style={[styles.card, completed && styles.completedCard]}>
      <TouchableOpacity 
        style={styles.cardHeader}
        onPress={() => onToggleExpand(id)}
      >
        <View style={styles.headerLeftSection}>
          <Text style={styles.category}>{category}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        
        <View style={styles.headerRightSection}>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => onToggleFavorite(id)}
          >
            <FontAwesome 
              name={favorite ? 'heart' : 'heart-o'} 
              size={20} 
              color={favorite ? Colors.primaryButton : Colors.textSecondary} 
            />
          </TouchableOpacity>
          
          <MaterialIcons 
            name={expanded ? 'expand-less' : 'expand-more'} 
            size={24} 
            color={Colors.textSecondary} 
          />
        </View>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.expandedContent}>
          <Text style={styles.prayerText}>{text}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <MaterialIcons name="timer" size={18} color={Colors.textSecondary} />
              <Text style={styles.statText}>{duration} min</Text>
            </View>
            
            {completed && (
              <View style={styles.stat}>
                <MaterialIcons name="check-circle" size={18} color={Colors.primaryButton} />
                <Text style={styles.statText}>
                  {completionCount}x
                </Text>
              </View>
            )}
            
            {lastCompleted && (
              <View style={styles.stat}>
                <MaterialIcons name="event" size={18} color={Colors.textSecondary} />
                <Text style={styles.statText}>
                  Última: {formatDate(lastCompleted)}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.timerButton}
              onPress={() => onStartTimer(id)}
            >
              <MaterialIcons name="timelapse" size={18} color="white" />
              <Text style={styles.buttonText}>Iniciar Timer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.completeButton,
                completed && styles.completedButton
              ]}
              onPress={() => onMarkCompleted(id)}
            >
              <MaterialIcons 
                name={completed ? "refresh" : "check"} 
                size={18} 
                color="white" 
              />
              <Text style={styles.buttonText}>
                {completed ? "Repetir" : "Concluir"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadow.light,
  },
  completedCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primaryButton,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  headerLeftSection: {
    flex: 1,
  },
  headerRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontFamily: Fonts.bodyFamily,
    fontSize: Fonts.smallSize,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  title: {
    fontFamily: Fonts.titleFamily,
    fontSize: Fonts.titleSize,
    color: Colors.textPrimary,
  },
  favoriteButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  expandedContent: {
    padding: Spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  prayerText: {
    fontFamily: Fonts.bodyFamily,
    fontSize: Fonts.bodySize,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  statText: {
    fontFamily: Fonts.bodyFamily,
    fontSize: Fonts.smallSize,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timerButton: {
    backgroundColor: Colors.secondaryButton,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  completeButton: {
    backgroundColor: Colors.primaryButton,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    flex: 1,
  },
  completedButton: {
    backgroundColor: Colors.secondaryButton,
  },
  buttonText: {
    fontFamily: Fonts.bodyFamily,
    fontSize: Fonts.smallSize,
    color: 'white',
    marginLeft: 4,
  },
});

export default PrayerCard; 