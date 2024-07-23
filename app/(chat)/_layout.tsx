import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";

export default function ChatLayout() {
    return (
        <Stack
            screenOptions={{
                title: "Chat Grupal",
                headerStyle: {
                    backgroundColor: "#9DD187",
                },
                headerTintColor: "#2A2C38",
            }}
        >
        </Stack>
    )
}