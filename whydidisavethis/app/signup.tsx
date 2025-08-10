import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ActivityIndicator,
    StyleSheet,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';

import { useAuth } from "@/utils/authContext";
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function SignupScreen() {
    const {
        signUp,
        isLoadingAction,
        actionError,
    } = useAuth();
    const router = useRouter();
    const colorScheme = useColorScheme();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignup = async () => {
        if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
            Alert.alert("Input Required", "Please fill in all fields.");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Password Mismatch", "The passwords do not match.");
            return;
        }

        // Call the signUp function from the context
        const signupSuccessful = await signUp(username, password);

        if (signupSuccessful) {
            // AuthProvider's signUp might already handle navigation or show an alert.
            // You can add additional logic here if needed.
            setUsername('');
            setPassword('');
            setConfirmPassword('');
            console.log("[SignupScreen] Signup successful callback received.");
            // Example: Alert.alert("Success", "Account created! Please log in.", [{ text: "OK", onPress: () => router.replace('/login') }]);
            // No explicit navigation here if AuthProvider handles it.
        } else {
            console.log("[SignupScreen] Signup failed callback received. Error should be in authContext.actionError.");
            // Error message is displayed via authContext.actionError
        }
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>Create Account</Text>
            <TextInput
                style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground, color: Colors[colorScheme ?? 'light'].text, borderColor: Colors[colorScheme ?? 'light'].border }]}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
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
            <View style={[styles.passwordContainer, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground, borderColor: Colors[colorScheme ?? 'light'].border }]}>
                <TextInput
                    style={[styles.passwordInput, { color: Colors[colorScheme ?? 'light'].text }]}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].textMuted}
                />
                <TouchableOpacity onPress={toggleShowConfirmPassword} style={styles.eyeIcon}>
                    <Ionicons
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
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
                <TouchableOpacity style={[styles.signupButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]} onPress={handleSignup}>
                    <Text style={[styles.signupButtonText, { color: '#FFFFFF' }]}>Sign Up</Text>
                </TouchableOpacity>
            )}

            <Link href="/login" asChild style={styles.linkContainer} disabled={isLoadingAction}>
                <TouchableOpacity>
                    <Text style={[styles.linkText, { color: Colors[colorScheme ?? 'light'].primary }]}>Already have an account? Log In</Text>
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
    signupButton: {
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    signupButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});