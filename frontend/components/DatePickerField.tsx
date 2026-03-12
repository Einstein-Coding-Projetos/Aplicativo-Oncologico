import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { formatDateLabel } from '../lib/treatment';

type DatePickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  helperText?: string;
};

export default function DatePickerField({
  label,
  value,
  onChange,
  minDate,
  helperText,
}: DatePickerFieldProps) {
  const [visible, setVisible] = useState(false);

  const markedDates = useMemo(
    () => ({
      [value]: {
        selected: true,
        selectedColor: '#0B63F6',
      },
    }),
    [value]
  );

  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.field} onPress={() => setVisible(true)}>
        <View style={styles.content}>
          <Text style={styles.value}>{formatDateLabel(value)}</Text>
          {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
        </View>
        <View style={styles.actionBadge}>
          <Text style={styles.action}>Alterar</Text>
        </View>
      </Pressable>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>{label}</Text>
                <Text style={styles.sheetSubtitle}>Escolha a data no calendario.</Text>
              </View>
              <Pressable onPress={() => setVisible(false)}>
                <Text style={styles.close}>Fechar</Text>
              </Pressable>
            </View>

            <Calendar
              current={value}
              minDate={minDate}
              onDayPress={({ dateString }) => {
                onChange(dateString);
                setVisible(false);
              }}
              markedDates={markedDates}
              theme={{
                backgroundColor: '#091324',
                calendarBackground: '#091324',
                dayTextColor: '#EAF4FF',
                monthTextColor: '#EAF4FF',
                textDisabledColor: '#4B5E84',
                selectedDayBackgroundColor: '#0B63F6',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#7DD3FC',
                arrowColor: '#7DD3FC',
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: '#B9D6FF',
    marginBottom: 6,
    fontWeight: '600',
  },
  field: {
    borderWidth: 1,
    borderColor: '#2E4D79',
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    backgroundColor: '#10213F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  value: {
    color: '#F0F7FF',
    fontSize: 16,
    fontWeight: '600',
    flexShrink: 1,
  },
  helper: {
    marginTop: 4,
    color: '#9FB2D8',
    fontSize: 12,
    lineHeight: 18,
    flexShrink: 1,
  },
  actionBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2E4D79',
    backgroundColor: '#0C2C57',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'center',
  },
  action: {
    color: '#7DD3FC',
    fontSize: 13,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 10, 20, 0.72)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#091324',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
    paddingBottom: 28,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetTitle: {
    color: '#EAF4FF',
    fontSize: 18,
    fontWeight: '700',
  },
  sheetSubtitle: {
    color: '#9FB2D8',
    fontSize: 13,
    marginTop: 4,
  },
  close: {
    color: '#7DD3FC',
    fontSize: 14,
    fontWeight: '700',
  },
});
