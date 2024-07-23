import { Stack } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ChatLayout() {
    const router = useRouter();

    return (
        <Stack
            screenOptions={{
                title: "Chat Grupal",
                headerStyle: {
                    backgroundColor: "#9DD187",
                },
                headerTintColor: "#2A2C38",
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()}>
                      <Ionicons name="arrow-back" size={24} color="#2A2C38" />
                    </TouchableOpacity>
                  ),
            }}
        >
        </Stack>
    )
}