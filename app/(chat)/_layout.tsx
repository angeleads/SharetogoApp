import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";

export default function ChatLayout() {
    return (
        <Stack
          screenOptions={{
            headerShown: false,
            
          }}
        >
          <Stack.Screen
            name="Chat"
            options={{
                title: 'Chat',
            }}
            />
        </Stack>
    )
}