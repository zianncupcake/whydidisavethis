import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/utils/authContext";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export default function RootLayout() {
    const colorScheme = useColorScheme();
    
    return (
        <AuthProvider>
            <ActionSheetProvider
                userInterfaceStyle={colorScheme === 'dark' ? 'dark' : 'light'}
            >
                <>
                    <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                    <Stack>
                        <Stack.Screen
                            name="(protected)"
                            options={{
                                headerShown: false,
                                animation: "none",
                            }}
                        />
                        <Stack.Screen
                            name="login"
                            options={{
                                headerShown: false,
                                animation: "none",
                            }}
                        />
                        <Stack.Screen
                            name="signup"
                            options={{
                                headerShown: false,
                                animation: "none",
                            }}
                        />
                    </Stack>
                </>
            </ActionSheetProvider>
        </AuthProvider>
    );
}