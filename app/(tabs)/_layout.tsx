import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { UniversalColors } from '@/constants/theme';
import { useThemeContext } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { colorScheme } = useThemeContext();

  const GlassBackground = () => (
    <View style={styles.glassContainer}>
      <BlurView
        intensity={80}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View style={[
        styles.glassBorder,
        { 
          borderColor: colorScheme === 'dark'
            ? 'rgba(255,255,255,0.15)'
            : 'rgba(255,255,255,0.4)'
        }
      ]} />
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: UniversalColors.white,
        tabBarInactiveTintColor: UniversalColors.gray400,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: GlassBackground,
        tabBarStyle: {
          position: 'absolute',
          bottom: 30,
          left: 15,
          right: 15,
          height: 80,
          borderRadius: 28,
          paddingBottom: 15,
          paddingTop: 15,
          backgroundColor: 'transparent',
          borderWidth: 0,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
          marginTop: 8,
          letterSpacing: 0.8,
        },
      }}>
      
      {['index', 'history', 'profile'].map((name) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: 
              name === 'index' ? 'RECORD' :
              name === 'history' ? 'HISTORY' : 'PROFILE',
            tabBarIcon: ({ focused }) => {
              const icons = {
                index: { active: "waveform.circle.fill", inactive: "waveform.circle" },
                history: { active: "clock.fill", inactive: "clock" },
                profile: { active: "person.circle.fill", inactive: "person.circle" },
              };
              
              return (
                <View style={styles.iconContainer}>
                  <View style={[
                    styles.iconWrapper,
                    focused && styles.iconWrapperActive,
                  ]}>
                    {focused && (
                      <View style={[
                        styles.activeGlow,
                        { 
                          backgroundColor: UniversalColors.primary,
                          shadowColor: UniversalColors.primary,
                        }
                      ]} />
                    )}
                    
                    <IconSymbol 
                      size={focused ? 24 : 22} 
                      name={focused ? icons[name].active : icons[name].inactive} 
                      color={focused ? UniversalColors.primary : UniversalColors.gray500} 
                    />
                  </View>
                </View>
              );
            },
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  glassContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 28,
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 1.5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  activeGlow: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 8,
    right: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
});