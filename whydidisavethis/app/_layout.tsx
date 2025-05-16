import { Stack } from "expo-router";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/utils/authContext";

export default function RootLayout() {
    return (
        <AuthProvider>
            <StatusBar style="auto" />
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
            </Stack>
        </AuthProvider>
    );
}