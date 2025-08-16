import { useAuth } from "@/utils/authContext";
import { Redirect, Stack } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export const unstable_settings = {
  initialRouteName: "(tabs)", // anchor
};

export default function ProtectedLayout() {
  const {
    isReady,
    isLoggedIn
  } = useAuth();
  const colorScheme = useColorScheme();

  if (!isReady) {
    return null;
  }

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
          title: 'My saves',
        }}
      />
      <Stack.Screen
        name="item/[id]"
        options={{
          headerShown: true,
          title: 'Post Details',
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].text,
          headerTitleStyle: {
            color: Colors[colorScheme ?? 'light'].text,
          },
        }}
      />
      <Stack.Screen
        name="item/edit"
        options={{
          headerShown: true,
          title: 'Edit Post',
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].text,
          headerTitleStyle: {
            color: Colors[colorScheme ?? 'light'].text,
          },
        }}
      />
    </Stack>
  );
}
