import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function CommonLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        title: "Información del Trayecto",
        headerStyle: {
          backgroundColor: "#9DD187",
        },
        headerTintColor: "#2A2C38",
        headerTitleAlign: 'center', // Center the title
        headerTitleStyle: {
          fontSize: 20, // Adjust the font size of the title
          fontWeight: 'bold', // Optional: set the font weight of the title
        },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#2A2C38" />
          </TouchableOpacity>
        ),
      }}
    >
    </Stack>
  );
}
