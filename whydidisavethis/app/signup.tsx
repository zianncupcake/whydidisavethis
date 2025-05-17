import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    ActivityIndicator,
    StyleSheet,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For password visibility icons
import { Link, useRouter } from 'expo-router'; // For navigation

import { useAuth } from "@/utils/authContext"; // Using your specified path

export default function SignupScreen() {
    const {
        signUp,
        isLoadingAction,
        actionError,
    } = useAuth();
    const router = useRouter();

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
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoComplete="username" // Use "username" for new username suggestion
            />
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="new-password" // Hint for password managers
                />
                <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
                    <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={24}
                        color="grey"
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="new-password"
                />
                <TouchableOpacity onPress={toggleShowConfirmPassword} style={styles.eyeIcon}>
                    <Ionicons
                        name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                        size={24}
                        color="grey"
                    />
                </TouchableOpacity>
            </View>

            {actionError && (
                <Text style={styles.errorText}>{actionError}</Text>
            )}

            {isLoadingAction ? (
                <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
            ) : (
                <Button title="Sign Up" onPress={handleSignup} />
            )}

            <Link href="/login" asChild style={styles.linkContainer} disabled={isLoadingAction}>
                <TouchableOpacity>
                    <Text style={styles.linkText}>Already have an account? Log In</Text>
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
        backgroundColor: '#f0f2f5',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#1A202C',
    },
    input: {
        height: 50,
        borderColor: '#CBD5E0',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 15,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        fontSize: 16,
        color: '#2D3748',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#CBD5E0',
        borderWidth: 1,
        marginBottom: 15,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        height: 50,
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#2D3748',
        height: '100%',
    },
    eyeIcon: {
        padding: 12,
    },
    errorText: {
        color: '#E53E3E',
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
        color: '#2B6CB0',
        textAlign: 'center',
        fontSize: 16,
    },
});