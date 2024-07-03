import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../library/firebase';
import { View, Text, Button, TextInput, TouchableOpacity } from 'react-native';

export default function Login()  {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordHidden, setPasswordHidden] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async () => {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
    
          console.log('User logged in successfully:', user.uid);
          router.push('/(tabs)/inicio');
          setErrorMessage("");
        } catch (error: any) {
          setErrorMessage("Error: el email y/o contraseña son incorrectos");
          console.error('Error logging in:', error.message);
        }
      };

    return (
        <View className="flex flex-col items-center justify-center h-screen bg-green-500">
            {errorMessage ? <Text className="text-red-600">{errorMessage}</Text> : null}
            <Text className="text-3xl font-bold mb-4">Login</Text>
            <TextInput
                placeholder="Indica tu email"
                value={email}
                onChangeText={(text) => setEmail(text)}
                className="border border-gray-300 rounded-md px-4 py-2 mb-2 "
            />
            <TextInput
                placeholder="Indica tu contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={passwordHidden}
                autoCapitalize="none"
                className="border border-gray-300 rounded-md px-4 py-2 mb-2"
            />
            <Button
                className="bg-green-800 text-white rounded-md px-4 py-2"
                onPress={handleLogin}
                title="Login"
            />
            <TouchableOpacity onPress={() => router.push('/(auth)/signUp')}>
                <Text className="text-bold">Don't have an account? Sign up</Text>
            </TouchableOpacity>
        </View>
    );
};