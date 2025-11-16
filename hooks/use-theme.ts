import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const COLOR_SCHEME_KEY = 'app-color-scheme';

export function useTheme() {
    const systemColorScheme = useColorScheme();
    const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(systemColorScheme);
    const [isLoaded, setIsLoaded] = useState(false);

    const loadStoredColorScheme = useCallback( async () => {
        try {
            const storedScheme = await AsyncStorage.getItem(COLOR_SCHEME_KEY);
            if (storedScheme === 'light' || storedScheme === 'dark') {
                setColorScheme(storedScheme);
            } else {
                setColorScheme(systemColorScheme);
            }
        } catch (error) {
            console.error('Error loading color scheme:', error);
            setColorScheme(systemColorScheme);
        } finally {
            setIsLoaded(true);
        }
    }, [systemColorScheme]);

    useEffect(() => {
        loadStoredColorScheme();
    }, [loadStoredColorScheme]);


    const setStoredColorScheme = async (scheme: 'light' | 'dark') => {
        try {
            console.log('Setting theme to:', scheme);
            await AsyncStorage.setItem(COLOR_SCHEME_KEY, scheme);
            setColorScheme(scheme);
            console.log('Theme set successfully');
        } catch (error) {
            console.error('Error saving color scheme:', error);
        }
    };

    const toggleColorScheme = () => {
        const newScheme = colorScheme === 'light' ? 'dark' : 'light';
        setStoredColorScheme(newScheme);
    };

    return {
        colorScheme,
        setColorScheme: setStoredColorScheme,
        toggleColorScheme,
        isLoaded,
        isDark: colorScheme === 'dark',
        isLight: colorScheme === 'light',
    };
}