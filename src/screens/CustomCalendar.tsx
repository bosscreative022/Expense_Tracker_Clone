import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CustomCalendar({
  value,
  onSelect,
  onClose,
}: {
  value: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(
    new Date(value.getFullYear(), value.getMonth(), 1)
  );

  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, inactive: true });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, inactive: false });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length, inactive: true });
  }

  return (
   
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => setCurrent(new Date(year, month - 1, 1))}>
            <ChevronLeft color="#888" size={18} />
          </Pressable>
          <Text style={styles.title}>
            {current.toLocaleString('en-US', { month: 'long' })} {year}
          </Text>
          <Pressable onPress={() => setCurrent(new Date(year, month + 1, 1))}>
            <ChevronRight color="#888" size={18} />
          </Pressable>
        </View>

        {/* Week Days */}
        <View style={styles.weekRow}>
          {DAYS.map(d => (
            <Text key={d} style={styles.weekText}>{d}</Text>
          ))}
        </View>

        {/* Dates */}
        <View style={styles.grid}>
          {cells.map((item, index) => {
            const isSelected =
              !item.inactive &&
              value.getDate() === item.day &&
              value.getMonth() === month &&
              value.getFullYear() === year;

            return (
              <Pressable
                key={index}
                disabled={item.inactive}
                onPress={() => {
                  onSelect(new Date(year, month, item.day));
                  onClose();
                }}
                style={[
                  styles.dayCell,
                  isSelected && styles.selected,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    item.inactive && styles.inactiveText,
                    isSelected && styles.selectedText,
                  ]}
                >
                  {item.day}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
  
  );
}
const styles = StyleSheet.create({

card: {
  width: '81%',       
  backgroundColor: '#0a0a0a',
  borderRadius: 20,
  padding: 12,
  borderWidth: 1,
  borderColor: '#1d2321',

},

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Outfit-Bold',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
weekText: {
  width: 36,
  textAlign: 'center',
  color: '#80848e',
  fontSize: 12,
  fontFamily: 'Outfit-SemiBold',
},

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
dayCell: {
  width: 36,
  height: 36,
  justifyContent: 'center',
  alignItems: 'center',
  marginVertical: 4,
},

  dayText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Outfit-SemiBold',
  },
  inactiveText: {
    color: '#80848e',
  },
 selected: {
  backgroundColor: '#3b82f6',
  borderRadius: 10,
},

  selectedText: {
    color: '#fff',
    fontFamily: 'Outfit-Bold',
  },
});
