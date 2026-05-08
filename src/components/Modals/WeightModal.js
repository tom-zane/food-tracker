import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../styles/theme';

const WeightModal = ({ visible, onClose, onAdd }) => {
  const [weight, setWeight] = useState('');

  const handleSubmit = () => {
    if (!weight) return;
    onAdd(weight);
    setWeight('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Log Today's Weight</Text>
          
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="Weight (kg)"
            placeholderTextColor={COLORS.textSecondary}
            value={weight}
            onChangeText={setWeight}
            autoFocus
          />

          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
              <Text style={styles.submitText}>Save Entry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  content: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 24,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  footer: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  cancelBtn: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  cancelText: {
    color: COLORS.textSecondary,
  },
  submitBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    alignItems: 'center',
    borderRadius: 12,
  },
  submitText: {
    color: '#000',
    fontWeight: 'bold',
  }
});

export default WeightModal;
