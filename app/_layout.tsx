import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { auth } from '../library/firebase';

const RootLayout = () => {
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

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
        }}>
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
        </Stack>
    );
};

export default RootLayout;
