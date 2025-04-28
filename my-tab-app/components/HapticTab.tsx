// components/HapticTab.tsx
import React from 'react';
import { Pressable, PressableProps, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

interface HapticTabProps extends PressableProps {
  // Add any additional props specific to HapticTab here
}

export function HapticTab(props: HapticTabProps): React.ReactNode {
  const { children, onPress, onPressIn, ...otherProps } = props;
  
  return (
    <Pressable
      {...otherProps}
      onPressIn={(ev) => {
        if (Platform.OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(ev);
      }}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
}