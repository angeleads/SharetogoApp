import React, { useState } from 'react';
import { StyleSheet, Image, Button, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Alert, Platform, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from "../../library/firebase";

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';

export default function SignUp() {
    const route = useRouter();
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

    const togglePasswordVisibility = () => {
        setPasswordHidden(!passwordHidden);
    };

    const toggleConfirmPasswordVisibility = () => {
        setConfirmPasswordHidden(!confirmPasswordHidden);
    };

    const togglePrivacyPolicy = () => {
        setPrivacyPolicyChecked(!privacyPolicyChecked);
    };

        
    const handleSubmit = async (e: any) => {
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

    const openURL = async () => {
        const url = 'https://www.sharetogo.org/privacy';
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                console.error(`Cannot open URL: ${url}`);
            }
        } catch (error) {
            console.error(`An error occurred: ${error}`);
        }
    }
    const handleGoBack = () => {
        route.back();
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <Image
                        source={require('../../assets/car_logo_sharetogo.png')}
                        style={styles.image}
                    />
                    <Text style={styles.title}>¡Registrate!</Text>
                    <View style={styles.inputRow}>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                placeholder="Indica tu nombre"
                                placeholderTextColor={'#808080'}
                                value={name}
                                style={styles.textInput}
                                onChangeText={text => setName(text)}
                            />
                            {nameError ? <Text style={styles.shortError}>{nameError}</Text> : null}
                        </View>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                placeholder="Indica tu apellido"
                                placeholderTextColor={'#808080'}
                                value={lastName}
                                style={styles.textInput}
                                onChangeText={text => setLastName(text)}
                            />
                            {lastNameError ? <Text style={styles.shortError}>{lastNameError}</Text> : null}
                        </View>
                    </View>
                    <View style={styles.inputRow}>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                placeholder="Indica tu teléfono"
                                placeholderTextColor={'#808080'}
                                value={phone}
                                style={styles.textInput}
                                keyboardType="numeric"
                                onChangeText={text => setPhone(text)}
                            />
                            {phoneError ? <Text style={styles.shortError}>{phoneError}</Text> : null}
                        </View>

                        <View style={styles.inputWrapper}>
                            <TextInput
                                placeholder="Indica tu email"
                                placeholderTextColor={'#808080'}
                                value={email}
                                style={styles.textInput}
                                onChangeText={text => setEmail(text)}
                            />
                            {emailError ? <Text style={styles.shortError}>{emailError}</Text> : null}
                        </View>
                    </View>
                    <View style={styles.passwordInputContainer}>
                        <TextInput
                            placeholder="Indica tu contraseña"
                            placeholderTextColor={'#808080'}
                            value={password}
                            onChangeText={setPassword}
                            style={styles.passwordInput}
                            secureTextEntry={passwordHidden}
                            autoCapitalize="none"
                            autoCompleteType="password"
                        />
                        <TouchableOpacity
                            style={styles.passwordVisibilityButton}
                            onPress={togglePasswordVisibility}
                        >
                            <Ionicons
                            name={passwordHidden ? 'eye-outline' : 'eye-off-outline'}
                            size={24}
                            color="black"
                            />
                        </TouchableOpacity>
                    </View>
                    {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
                    <View style={styles.passwordInputContainer}>
                        <TextInput
                            placeholder="Confirma tu contraseña"
                            placeholderTextColor={'#808080'}
                            value={confirmPassword}
                            onChangeText={text => setConfirmPassword(text)}
                            style={styles.passwordInput}
                            secureTextEntry={confirmPasswordHidden}
                            autoCapitalize="none"
                            autoCompleteType="confirmPassword"
                        />
                            <TouchableOpacity
                            style={styles.passwordVisibilityButton}
                            onPress={toggleConfirmPasswordVisibility}
                        >
                            <Ionicons
                            name={confirmPasswordHidden ? 'eye-outline' : 'eye-off-outline'}
                            size={24}
                            color="black"
                            />
                        </TouchableOpacity>
                    </View>
                    {confirmPasswordError ? <Text style={styles.error}>{confirmPasswordError}</Text> : null}
                    <View style={styles.privacyPolicyContainer}>
                        <TouchableOpacity onPress={togglePrivacyPolicy}>
                            <Ionicons
                                name={privacyPolicyChecked ? 'checkmark-circle-outline' : 'ellipse-outline'}
                                size={30}
                                color="#2A2C38"
                                style={styles.checkboxIcon}
                            />
                        </TouchableOpacity>
                            <TouchableOpacity onPress={openURL} >
                                <Text style={styles.privacyPolicyText}> He leído y acepto la política de privacidad y los términos y condiciones de uso.</Text>
                            </TouchableOpacity>
                    </View>
                    {privacityError ? <Text style={styles.error}>{privacityError}</Text> : null}
                    <TouchableOpacity onPress={handleSubmit} style={styles.buttonContainerLarge}>
                        <LinearGradient
                            colors={['#2A2C38', '#2A2C38']}
                            start={{x:0, y:0}}
                            end={{x:1, y:1}}
                            style={styles.buttonLarge}
                        >
                            <Text style={styles.textLarge}>Registrarse</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleGoBack} style={styles.buttonContainerLarge}>
                        <LinearGradient
                            colors={['#2A2C38', '#2A2C38']}
                            start={{x:0, y:0}}
                            end={{x:1, y:1}}
                            style={styles.buttonLarge}
                        >
                            <Text style={styles.textLarge}>Volver</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
        );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#9DD187',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRow: {
        flexDirection: 'row',
        marginHorizontal: '5%',
    },
    inputWrapper: {
        flex: 1,
        marginRight: -20,
    },
    image: {
        width: '40%',
        height: '20%',
        marginTop: 5,
      },
    title: {
        fontSize: 28,
        marginBottom: 5,
        color: '#2A2C38',
    },
    image: {
        width: 250,
        height: 250,
        marginBottom: -50,
        top: -50,
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 30,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 15,
        backgroundColor: '#E8F6DF',
        width: 310,
        height: 50,
    },
    passwordVisibilityButton: {
        paddingRight: 15,
    },
    passwordInput: {
        flex: 1,
        height: 40,
    },
    text: {
        top: -100,
        fontSize: 25,
        color: 'gray',
        fontWeight: 900,
    },
    header_image: {
        width: '110%',
        top: -120,
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 30,
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 15,
        backgroundColor: '#E8F6DF',
        width: 330,
        height: 50,
    },
    passwordInput: {
        flex: 1,
        height: 40,
  },
    passwordVisibilityButton: {
        paddingRight: 15,
    },
    textInput: {
        paddingStart: 15,
        paddingEnd: 15,
        width: 155,
        height: 50,
        marginTop: 18,
        marginLeft: 10,
        borderWidth: 1,
        borderColor: '#9DD187',
        borderRadius: 15,
        backgroundColor: '#E8F6DF',
    },

    textLarge: {
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    buttonLarge: {
        width: 300,
        height: 50,
        marginTop: 10,
        alignContent: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 8,
    },
    buttonContainerLarge: {
        width: 200,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: -15,
    },
    error: {
        color: 'red',
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 5,
        marginBottom: -2,
        textAlign: 'left',
        alignSelf: 'center',
        marginLeft: 55,
        marginRight: 55,
    },
    shortError: {
        color: 'red',
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 5,
        marginBottom: -2,
        textAlign: 'left',
        alignSelf: 'center',
        marginLeft: 25,
        marginRight: 55,
    },
    checkboxIcon: {
        marginRight: 10,
    },
    privacyPolicyContainer:  {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 43,
        marginTop: 20,
    },
    privacyPolicyText: {
        fontSize: 12,
        textDecorationLine: 'underline',
        color: '#2A2C38',
        marginRight: 50,
    },
});
