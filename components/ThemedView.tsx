import { SafeAreaView, View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  padding?: number;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  padding = 20,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <SafeAreaView style={{ backgroundColor: backgroundColor, display: 'flex', height: '100%' }}>
      <View style={[{ paddingHorizontal: padding, paddingVertical: padding+20 }, style]} {...otherProps} />
    </SafeAreaView>
  );
}
