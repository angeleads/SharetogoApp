import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { auth } from '../library/firebase';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';


const RootLayout = () => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return null; // or a loading spinner if you prefer
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#9DD187', // Background color of the header
        },
        headerTintColor: '#2A2C38',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#2A2C38" />
          </TouchableOpacity>
        ),
      }}
    >
      {currentUser ? (
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            title: 'Volver',
          }}
        />
      ) : (
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            title: 'Volver',
          }}
        />
      )}
      <Stack.Screen
        name="(chat)"
        options={{
          headerShown: false,
          title: 'Chat Grupal',
        }}
      />
      <Stack.Screen
        name="(travelInfo)"
        options={{
          headerShown: false,
          title: 'Trayecto Información',
        }}
      />
    </Stack>
  );
};

export default RootLayout;
