// components/HapticTab.tsx
import React, { ReactNode } from 'react';
import { Pressable, PressableProps, Platform } from 'react-native';

interface HapticTabProps extends PressableProps {
  children?: ReactNode;
}

export function HapticTab({ children, onPress, ...props }: HapticTabProps) {
  return (
    <Pressable
      {...props}
      onPress={(e) => {
        // Simple version without haptic feedback for now
        // You can add it back later when dependencies are sorted
        if (onPress) onPress(e);
      }}
    >
      {children}
    </Pressable>
  );
}