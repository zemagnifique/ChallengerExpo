import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface WeekdayPickerProps {
  selectedDay: string | null;
  onDaySelected: (day: string) => void;
  disabled?: boolean;
}

export const WeekdayPicker: React.FC<WeekdayPickerProps> = ({
  selectedDay,
  onDaySelected,
  disabled = false,
}) => {
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  
  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>Select Day:</ThemedText>
      <View style={styles.weekdaysContainer}>
        {weekdays.map((day) => (
          <TouchableOpacity
            key={day}
            onPress={() => onDaySelected(day)}
            disabled={disabled}
            style={[
              styles.dayButton,
              { backgroundColor: day === selectedDay ? '#2B5876' : backgroundColor },
              disabled && styles.disabledButton,
            ]}
          >
            <ThemedText 
              style={[
                styles.dayText, 
                day === selectedDay && styles.selectedText,
                disabled && styles.disabledText,
              ]}
            >
              {day.substring(0, 3)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  weekdaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayButton: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
    width: '30%',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
  },
  selectedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
}); 