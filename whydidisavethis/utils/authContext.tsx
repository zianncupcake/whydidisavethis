import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen, useRouter } from "expo-router";
import React, { createContext, PropsWithChildren, useEffect, useState, useContext, useMemo } from "react";
import { apiService, Item } from "../lib/apiService";
import { Alert } from "react-native";

SplashScreen.preventAutoHideAsync();

export interface User {
    id: number;
    username: string;
    items: Item[]
}

type AuthState = {
    user: User | null;
    isLoggedIn: boolean;
    isReady: boolean;
    token: string | null;
    isLoadingAction: boolean;
    actionError: string | null;
    logIn: (username_form: string, password_form: string) => Promise<boolean>;
    logOut: () => Promise<void>;
    signUp: (username_form: string, password_form: string) => Promise<boolean>;
};

const authStorageKey = "auth-key";

export const AuthContext = createContext<AuthState>({
    user: null,
    isLoggedIn: false,
    isReady: false,
    token: null,
    isLoadingAction: false,
    actionError: null,
    logIn: async () => {
        console.warn("Login function not implemented in context default");
        return false;
    },
    logOut: async () => {
        console.warn("Logout function not implemented in context default");
    },
    signUp: async () => {
        console.warn("Singup function not implemented in context default");
        return false;
    },
});

// --- Custom Hook (Optional but recommended) ---
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export function AuthProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<User | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        const getAuthFromStorage = async () => {
            console.log("[AuthProvider] Checking auth status from storage...");
            try {
                const storedToken = await AsyncStorage.getItem(authStorageKey);
                if (storedToken) {
                    console.log("[AuthProvider] Token found in storage:", storedToken);
                    const storedUser = await apiService.getUserFromToken(storedToken);
                    setUser(storedUser)
                    setToken(storedToken);
                    setIsLoggedIn(true);
                } else {
                    console.log("[AuthProvider] No token found in storage.");
                    setUser(null);
                    setToken(null);
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error("[AuthProvider] Error fetching token from storage:", error);
                setToken(null);
                setIsLoggedIn(false);
            } finally {
                setIsReady(true);
            }
        };
        getAuthFromStorage();
    }, []);

    useEffect(() => {
        if (isReady) {
            SplashScreen.hideAsync();
            console.log("[AuthProvider] isReady is true, Splashscreen hidden.");
        }
    }, [isReady]);

    const logIn = async (username_form: string, password_form: string): Promise<boolean> => {
        setIsLoadingAction(true);
        setActionError(null);
        console.log(`[AuthProvider] logIn: Attempting API login for user: ${username_form}`);
        try {
            const response = await apiService.login(username_form, password_form);
            const newToken = response.access_token;
            await AsyncStorage.setItem(authStorageKey, newToken);
            const user = await apiService.getUserFromToken(newToken);

            setUser(user);
            setToken(newToken);
            setIsLoggedIn(true);
            setIsLoadingAction(false);
            router.replace("/");
            console.log("[AuthProvider] logIn: Success. Token stored. Navigated to /");
            return true;
        } catch (error: any) {
            const message = error.message || "Login failed. Please try again.";
            console.error("[AuthProvider] logIn: API call failed -", message, error);
            setActionError(message);
            await AsyncStorage.removeItem(authStorageKey);
            setUser(null);
            setToken(null);
            setIsLoggedIn(false);
            setIsLoadingAction(false);
            return false;
        }
    };

    const logOut = async () => {
        console.log("[AuthProvider] logOut: Logging out user.");
        setIsLoadingAction(true); // Optional: loading state for logout
        try {
            await AsyncStorage.removeItem(authStorageKey);
        } catch (error) {
            console.error("[AuthProvider] logOut: Error removing token from storage", error);
        } finally {
            setToken(null);
            setUser(null);
            setIsLoggedIn(false);
            setActionError(null);
            setIsLoadingAction(false);
            router.replace("/login");
            console.log("[AuthProvider] logOut: Token removed. Navigated to /login.");
        }
    };

    const signUp = async (username_form: string, password_form: string): Promise<boolean> => {
        setIsLoadingAction(true);
        setActionError(null);
        console.log(`[AuthProvider] signUp: Attempting for user: ${username_form}`);
        try {
            // Assuming your apiService.signup exists and handles the call
            // It might return user data or just a success status
            await apiService.signup(username_form, password_form);

            setIsLoadingAction(false);
            console.log("[AuthProvider] signUp: API success.");
            Alert.alert("Signup Successful!", "Please proceed to login with your new credentials.");
            router.push('/login'); // Navigate to login screen after successful signup
            return true;
        } catch (error: any) {
            const message = error.message || "Signup failed. Please try again.";
            console.error("[AuthProvider] signUp: API error -", message, error);
            setActionError(message);
            setIsLoadingAction(false);
            return false;
        }
    };

    // You no longer need the separate `storeAuthState` function
    // as token storage is handled within logIn and logOut.

    // Memoize context value
    const contextValue = useMemo(() => ({
        user,
        isReady,
        isLoggedIn,
        token,
        isLoadingAction,
        actionError,
        logIn,
        logOut,
        signUp
    }), [isReady, isLoggedIn, token, isLoadingAction, actionError]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}