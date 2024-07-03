import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { auth } from '../library/firebase';

export default function HomeScreen() {
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user: any )=> {
            setCurrentUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return null; // or a loading spinner if you prefer
    }

    return currentUser ? (
        <Redirect href="/(tabs)/inicio" />
    ) : (
        <Redirect href="/(auth)/login" />
    );
}
