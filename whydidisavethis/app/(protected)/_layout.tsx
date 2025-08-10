import { useAuth } from "@/utils/authContext";
import { Redirect, Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)", // anchor
};

export default function ProtectedLayout() {
  const {
    isReady,
    isLoggedIn
  } = useAuth();

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
        }}
      />
      <Stack.Screen
        name="item/edit"
        options={{
          headerShown: true,
          title: 'Edit Post',
        }}
      />
    </Stack>
  );
}
