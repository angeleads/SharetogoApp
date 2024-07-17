import React, { useState } from 'react';
import car_logo from '../../assets/car_logo_sharetogo.png';
import { StyleSheet, Alert, Image, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../../library/firebase';
import { useRouter } from 'expo-router';

export default function ForgotPassword({ }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');


  const handleResetPassword = () => {
    if (email !== '') {
        setErrorMessage('');
        // Add your logic here to handle password reset
        sendPasswordResetEmail(auth, email)
        .then(() => {
          Alert.alert('Restablecer Contraseña', `Se ha enviado un enlace de restablecimiento a ${email}`);
        })
        .catch((error) => {
          setErrorMessage(`Error: ${error.message}`);
        });
        Alert.alert('Restablecer Contraseña', `Se ha enviado un enlace de restablecimiento a ${email}`);
    } else {
        setErrorMessage("Introduce una dirección de correo electrónico válida")
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Image
                source={car_logo}
                style={styles.image}
                />
                <Text style={styles.title}>Restablecer la contraseña</Text>
                <Text style={styles.subtitle}>
                    Podemos ayudarte a restablecer tu contraseña mediante el correo electrónico enlazado a tu cuenta.
                </Text>
                {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
                <TextInput
                    style={styles.textInput}
                    placeholder="Correo Electrónico"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                />

                <TouchableOpacity onPress={handleResetPassword} style={styles.buttonContainerLarge}>
                    <LinearGradient
                    colors={['#2A2C38', '#2A2C38']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonLarge}
                    >
                    <Text style={styles.textLarge}>Restablecer Contraseña</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.goBack}
                    onPress={() => router.back()}
                >
                    <Text style={styles.goBackText}>Volver al Inicio de Sesión</Text>
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
  image: {
    width: 365,
    height: 270,
    marginBottom: 0,
    top: -90,
  },
  subtitle: {
    fontSize: 13,
    color: '#2A2C38',
    marginHorizontal: '10%',
    textAlign: 'center',
    marginVertical: '2%',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: -30,
  },
  textInput: {
    padding: 10,
    paddingStart: 30,
    width: 310,
    height: 50,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 15,
    backgroundColor: '#E8F6DF',
  },
  buttonContainerLarge: {
    width: 200,
    alignItems: 'center',
    marginTop: 5,
  },
  textLarge: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  goBack: {
    marginTop: 20,
  },
  goBackText: {
    color: '#2A2C38',
    fontSize: 16,
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
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
    textAlign: 'center',
    alignSelf: 'flex-start',
    marginLeft: '12%',
    alignContent: 'center',
  },
});
