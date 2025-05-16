
import { Button, View, Text, StyleSheet, TextInput, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from "@/utils/authContext";
import { useContext, useState } from "react";
import { Link } from 'expo-router';

export default function LoginScreen() {
    const authContext = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert("Input Required", "Please enter both username and password.");
            return;
        }
        const loginSuccessful = await authContext.logIn(username, password);

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
        <View style={styles.container}>
            <Text style={styles.title}>Login Screen</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoComplete="username"
                keyboardType="email-address"
            />
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                />
                <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeIcon}>
                    <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={24}
                        color="grey"
                    />
                </TouchableOpacity>
            </View>

            {authContext.actionError && (
                <Text style={styles.errorText}>{authContext.actionError}</Text>
            )}

            {authContext.isLoadingAction ? (
                <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
            ) : (
                <Button title="Login" onPress={handleLogin} />
            )}

            <Link href="/signup" asChild style={styles.linkContainer} disabled={authContext.isLoadingAction}>
                <TouchableOpacity>
                    <Text style={styles.linkText}>Don&apos;t have an account? Sign Up</Text>
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