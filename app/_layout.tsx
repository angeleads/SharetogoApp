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
        <Stack>
            {currentUser ? (
                <Stack.Screen
                    name="(tabs)"
                    options={{
                        headerShown: false,
                        title: 'Inicio',
                    }}
                />
            ) : (
                <Stack.Screen
                    name="(auth)"
                    options={{
                        headerShown: false,
                    }}
                />
            )}
        </Stack>
    );
};

export default RootLayout;
