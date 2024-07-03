import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from "../../library/firebase";

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [profilePic, setProfilePic] = useState("");
    const [passwordHidden, setPasswordHidden] = useState(true);
    const [confirmPasswordHidden, setConfirmPasswordHidden] = useState(true);
    const [nameError, setNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [privacityError, setPrivacityError] = useState('');
    const [privacyPolicyChecked, setPrivacyPolicyChecked] = useState(false);
    const [error, setError] = useState('');


    async function addDataToDatabase(user: any) {
        try {
            await setDoc(doc(db, 'users', user.uid), {
                userId: user.uid,
                emailAdress: email,
                name: name,
                lastName: lastName,
                phoneNumber: phone,
                profilePicture: profilePic,
            });
            console.log("Success: Data successfully added to user's database!");
        } catch (error) {
            console.error("Error: ", error);
        }
    }
        
    const handleSignUp = async (e: any) => {
		e.preventDefault();
        if (!name) {
            setNameError("Introduce tu nombre");
            console.log("ERROR");
            return;
        }
        setNameError("");
        if (!lastName) {
            setLastNameError("Introduce tu apellido");
            return;
        }
        setLastNameError("");
        if (!/^\d+$/.test(phone) || phone.length < 9) {
            setPhoneError("El número de teléfono no tiene un formato válido");
            return;
        }
        setPhoneError("");
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            setEmailError("El correo electrónico no tiene un formato válido");
            return;
        }
        setEmailError("");
        if (password.length < 8 || (password.match(/\d/g) || []).length < 2) {
            setPasswordError("La contrasñea debe tener como mínimo 8 carácterres y 2 dígitos");
            return;
        }
        setPasswordError("")
		if (password !== confirmPassword) {
			setConfirmPasswordError("Las contraseñas no coinciden");
			return;
		}
        setConfirmPasswordError("");
        if (privacyPolicyChecked === false) {
            setPrivacityError("Debes aceptar los términos y condiciones para continuar.");
            return;
        }
        setPrivacityError("");
		try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            addDataToDatabase(user);
            } catch (error: any) {
            if (error.code === 'auth/weak-password') {
                setPasswordError("Password should be at least 6 characters");
            } else if (error.code === 'auth/email-already-in-use') {
                setEmailError("Este email ya esta en uso");
            }
        }
    };

    return (
        <View className="flex flex-col items-center justify-center h-screen bg-green-500">
            <Text className="text-3xl font-bold mb-4">¡Registrate!</Text>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={(text) => setEmail(text)}
                className="border border-gray-300 rounded-md px-4 py-2 mb-2 "

            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={(text) => setPassword(text)}
                className="border border-gray-300 rounded-md px-4 py-2 mb-2 "
            />
            <Button title="Sign Up" onPress={handleSignUp} />
            {error ? <Text>{error}</Text> : null}
        </View>
    );
};

export default SignUp;