
import { View, Text, StyleSheet, TextInput, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";
import { Link } from 'expo-router';
import { useAuth } from "@/utils/authContext";
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function LoginScreen() {
    const {
        logIn,
        isLoadingAction,
        actionError,
    } = useAuth();
    const colorScheme = useColorScheme();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert("Input Required", "Please enter both username and password.");
            return;
        }
        const loginSuccessful = await logIn(username, password);

        if (loginSuccessful) {
            setUsername('');
            setPassword('');
            console.log("[LoginScreen] Login successful callback received.");
        } else {
            console.log("[LoginScreen] Login failed callback received. Error should be in authContext.actionError.");
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>Login</Text>
            <TextInput
                style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground, color: Colors[colorScheme ?? 'light'].text, borderColor: Colors[colorScheme ?? 'light'].border }]}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor={Colors[colorScheme ?? 'light'].textMuted}
            />
            <View style={[styles.passwordContainer, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground, borderColor: Colors[colorScheme ?? 'light'].border }]}>
                <TextInput
                    style={[styles.passwordInput, { color: Colors[colorScheme ?? 'light'].text }]}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].textMuted}
                />
                <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
                    <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={24}
                        color={Colors[colorScheme ?? 'light'].icon}
                    />
                </TouchableOpacity>
            </View>

            {actionError && (
                <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].error }]}>{actionError}</Text>
            )}

            {isLoadingAction ? (
                <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} style={styles.loader} />
            ) : (
                <TouchableOpacity style={[styles.loginButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]} onPress={handleLogin}>
                    <Text style={[styles.loginButtonText, { color: '#FFFFFF' }]}>Login</Text>
                </TouchableOpacity>
            )}

            <Link href="/signup" asChild style={styles.linkContainer} disabled={isLoadingAction}>
                <TouchableOpacity>
                    <Text style={[styles.linkText, { color: Colors[colorScheme ?? 'light'].primary }]}>Don&apos;t have an account? Sign Up</Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 15,
        borderRadius: 8,
        fontSize: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        marginBottom: 15,
        borderRadius: 8,
        height: 50,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 15,
        fontSize: 16,
        height: '100%',
    },
    eyeIcon: {
        padding: 12,
    },
    errorText: {
        textAlign: 'center',
        marginBottom: 15,
        fontSize: 14,
    },
    loader: {
        marginVertical: 20,
    },
    linkContainer: {
        marginTop: 25,
    },
    linkText: {
        textAlign: 'center',
        fontSize: 16,
    },
    loginButton: {
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});