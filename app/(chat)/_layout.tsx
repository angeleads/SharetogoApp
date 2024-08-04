import { Stack } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ChatLayout() {
    const router = useRouter();
    const { travelDate } = useLocalSearchParams(); // Extract travelDate from route params

    return (
        <Stack
            screenOptions={{
                title: travelDate ? `Trayecto del ${travelDate}` : "Chat Grupal", // Dynamic title
                headerStyle: {
                    backgroundColor: '#9DD187', // Background color of the header
                    height: Platform.OS === 'ios' ? 100 : 72, // Adjust header height based on platform
                    shadowOffset: { width: 0, height: 5 }, // Shadow offset
                    shadowOpacity: 0.7, // Shadow opacity
                    shadowRadius: 6, // Shadow radius
                    elevation: Platform.OS === 'android' ? 4 : 0, // Elevation for Android
                },
                headerTintColor: "#2A2C38",
                headerTitleAlign: 'center', // Center the header title
                headerTitleStyle: {
                    fontSize: (Platform.OS === 'ios') ? 19 : 17,
                },
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