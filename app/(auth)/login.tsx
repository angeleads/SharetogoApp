import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../library/firebase';
import { View, Text, Button, TextInput, TouchableOpacity,  StyleSheet, Dimensions, Keyboard, Image, TouchableWithoutFeedback } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import car_logo from '@/assets/car_logo_sharetogo.png';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import ResponsiveFontSize from 'react-native-responsive-fontsize';
import { RFValue } from 'react-native-responsive-fontsize';
import { useRouter } from 'expo-router';

export default function Login()  {
    const route = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordHidden, setPasswordHidden] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
  
    const helpPages = () => {
        route.push({
            pathname: '/helpPages',
        });
        //navigation.navigate('HelpPages');
      }    

    const togglePasswordVisibility = () => {
        setPasswordHidden(!passwordHidden);
      };

    const handleLogin = async () => {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
    
          console.log('User logged in successfully:', user.uid);
          route.push('/(tabs)/inicio');
          setErrorMessage("");
        } catch (error: any) {
          setErrorMessage("Error: el email y/o contraseña son incorrectos");
          console.error('Error logging in:', error.message);
        }
      };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <KeyboardAwareScrollView>
            <View style={styles.insideContainer}>
              <Image source={car_logo} style={styles.image} />
  
              {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
  
              <TextInput
                placeholder="Indica tu email"
                placeholderTextColor={'#808080'}
                value={email}
                style={styles.textInput}
                onChangeText={(text) => setEmail(text)}
              />
  
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
  
              <TouchableOpacity onPress={handleLogin} style={styles.buttonContainerLarge}>
                <LinearGradient
                  colors={['#2A2C38', '#2A2C38']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonLarge}
                >
                  <Text style={styles.textLarge}>Entrar</Text>
                </LinearGradient>
              </TouchableOpacity>
  
              <TouchableOpacity onPress={() => route.push('forgotPassword')}>
                <Text style={styles.forgotPassword}> ¿Has olvidado la contraseña?</Text>
              </TouchableOpacity>
  
              <TouchableOpacity onPress={helpPages}>
                <Text style={styles.howItWorks}>¿Cómo funciona?</Text>
              </TouchableOpacity>
          </View>
          </KeyboardAwareScrollView>
          <View style={styles.register}>
            <Text style={styles.noCount}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => route.push('/signUp')} style={styles.registerButton}>
              <Text style={styles.textRegisterButton}>Registrarse</Text>
            </TouchableOpacity>
            </View>
        </View>
      </TouchableWithoutFeedback>
    );
};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#9DD187',
      alignItems: 'center',
      justifyContent: 'center',
    },
    insideContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: RFValue(300),
      height: RFValue(300),
      marginBottom: '-10%',
      marginTop: RFValue(25),
    },
  
    title: {
      fontSize: 25,
      color: '#A3ED5C',
      fontStyle: 'bold',
      fontStyle: 'italic',
      marginTop: 5,
      marginBottom: 15,
    },
    subtitle: {
      fontSize: 20,
      color: 'gray',
    },
    forgotPassword: {
      fontSize: 13,
      color: '#2A2C38',
      left: '16%',
      marginTop: '3%',
    },
    howItWorks: {
      fontSize: RFValue(15),
      fontWeight: 'bold',
      color: '#2A2C38',
      left: '23%',
      marginTop: '3%',
    },
    textInput: {
      padding: 10,
      paddingStart: 30,
      width: 310,
      height: 50,
      marginTop: 25,
      borderWidth: 1,
      borderColor: '#fff',
      borderRadius: 15,
      backgroundColor: '#E8F6DF',
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
    noCount: {
      color: '#fff',
      fontWeight: 'bold',
    },
    registerButton: {
      marginLeft: 5,
      marginBottom: 15,
    },
    textRegisterButton: {
      fontSize: 15,
    },
    register: {
      flexDirection: 'row',
      //position: 'absolute',
      bottom: RFValue(10),
      //justifyContent: "space-between",
      //marginBottom: RFValue(-10),
      color: '#fff',
      fontWeight: 'bold',
    },
    error: {
      color: 'red',
      fontSize: 12,
      marginTop: 5,
      marginBottom: -2,
      textAlign: 'left',
      alignSelf: 'flex-start',
      marginLeft: -20,
    },
    textLarge: {
      fontSize: 14,
      color: '#fff',
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 5,
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
    },
    passwordInput: {
      flex: 1,
      height: 40,
    },
    passwordVisibilityButton: {
      paddingRight: 15,
    },
    error: {
      color: 'red',
      fontSize: 12,
      marginTop: 5,
      marginBottom: -10,
      textAlign: 'center',
      alignSelf: 'flex-start',
      marginLeft: '22%',
      alignContent: 'center',
    },
  });
  
