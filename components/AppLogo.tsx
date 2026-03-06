import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

type AppLogoProps = {
  size?: number;
  bordered?: boolean;
};

export function AppLogo({ size = 72, bordered = true }: AppLogoProps) {
  return (
    <View
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
          borderWidth: bordered ? 1 : 0,
          padding: Math.max(4, Math.round(size * 0.08)),
        },
      ]}
    >
      <Image
        source={require('../assets/images/brand.logo.png')}
        style={[
          styles.image,
          {
            borderRadius: Math.round(size * 0.22),
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
