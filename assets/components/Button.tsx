import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// We are NOT importing Theme here to break the crash loop
interface Props {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  // We make colors optional, providing a high-end default
  colors?: [string, string, ...string[]]; 
}

export const PrimaryButton = ({ 
  title, 
  onPress, 
  style, 
  textStyle, 
  colors = ['#00D2FF', '#8B5CF6'] // Default "Spark" Gradient
}: Props) => {

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.85} 
      style={[styles.container, style]}
    >
      <LinearGradient 
        colors={colors} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 0 }} 
        style={styles.button}
      >
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { 
    width: '100%', 
    marginVertical: 12,
    shadowColor: '#00D2FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    height: 60,
    borderRadius: 16, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  }
});

export default PrimaryButton;