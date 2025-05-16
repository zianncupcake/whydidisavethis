import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen, useRouter } from "expo-router";
import React, { createContext, PropsWithChildren, useEffect, useState, useContext, useMemo } from "react";
import { apiService } from "../lib/apiService";

SplashScreen.preventAutoHideAsync();

type AuthState = {
    isLoggedIn: boolean;
    isReady: boolean;
    token: string | null;
    isLoadingAction: boolean;
    actionError: string | null;
    logIn: (username_form: string, password_form: string) => Promise<boolean>;
    logOut: () => Promise<void>;
};

const authStorageKey = "auth-key";

export const AuthContext = createContext<AuthState>({
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
});

// --- Custom Hook (Optional but recommended) ---
// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (context === undefined) {
//         throw new Error("useAuth must be used within an AuthProvider");
//     }
//     return context;
// };

export function AuthProvider({ children }: PropsWithChildren) {
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
                const storedToken = await AsyncStorage.getItem(authStorageKey); // Now expecting a token string
                if (storedToken !== null) {
                    console.log("[AuthProvider] Token found in storage:", storedToken);
                    setToken(storedToken);
                    setIsLoggedIn(true);
                } else {
                    console.log("[AuthProvider] No token found in storage.");
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
            setIsLoggedIn(false);
            setActionError(null);
            setIsLoadingAction(false);
            router.replace("/login");
            console.log("[AuthProvider] logOut: Token removed. Navigated to /login.");
        }
    };

    // You no longer need the separate `storeAuthState` function
    // as token storage is handled within logIn and logOut.

    // Memoize context value
    const contextValue = useMemo(() => ({
        isReady,
        isLoggedIn,
        token,
        isLoadingAction,
        actionError,
        logIn,
        logOut,
    }), [isReady, isLoggedIn, token, isLoadingAction, actionError]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}