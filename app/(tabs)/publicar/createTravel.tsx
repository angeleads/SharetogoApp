import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { addDoc, collection } from "firebase/firestore"; 
import { auth, db } from '../../../library/firebase';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateTravel() {
    const navigation = useNavigation();
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
    const [origine, setOrigine] = useState('');
    const [destination, setDestination] = useState('');
    const [carModel, setCarModel] = useState('');
    const [carSeatsAvailable, setCarSeatsAvailable] = useState('');
    const [catSeatsTaken, setCatSeatsTaken] = useState('0');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [errorMessage, setErrorMessage] = useState('');
    const [minimumTime, setMinimumTime] = useState<Date | undefined>(undefined);
    const user = auth.currentUser;

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const showTimePicker = () => {
        const isToday = selectedDate.toDateString() === new Date().toDateString();
        const minimumTime = isToday ? new Date() : undefined;
        setMinimumTime(minimumTime);
        setTimePickerVisibility(true);
    };

    const hideTimePicker = () => {
        setTimePickerVisibility(false);
    };

    const handleDateChange = (event: any, date: any) => {
        hideDatePicker();
        if (date) setSelectedDate(date);
    };

    const handleTimeChange = (event: any, time: any) => {
        hideTimePicker();
        if (time) setSelectedTime(time);
    };

    const publishTravel = () => {
        const currentDate = new Date();
        const isToday = selectedDate.toDateString() === currentDate.toDateString();
        const isBeforeCurrentHour = currentDate.getHours() > selectedTime.getHours();
        const isBeforeCurrentMinutes = currentDate.getMinutes() > selectedTime.getMinutes();

        if (origine === '') {
            setErrorMessage("Indica el origen de tu trayecto");
            return;
        }
        if (destination === '') {
            setErrorMessage("Indica el destino de tu trayecto");
            return;
        } 
        if (carModel === '') {
            setErrorMessage("Indica el modelo de coche");
            return;
        }
        const parsedCarSeatsAvailable = parseInt(carSeatsAvailable);
        if (parsedCarSeatsAvailable < 1 || parsedCarSeatsAvailable > 8) {
            setErrorMessage("Indica tus plazas libre (Entre 1 y 8)");
            return;
        }
        if (isToday && isBeforeCurrentMinutes && isBeforeCurrentHour){
            setErrorMessage("Indica una hora posterior a la actual");
            return;
        }
        setErrorMessage('');
        createData();
        navigation.goBack();
    }

    function createData() {
        const parsedCarSeatsAvailable = parseInt(carSeatsAvailable);
        const parsedCarSeatsTaken = parseInt(catSeatsTaken);
        const userId = user?.uid;
        const formattedDate = selectedDate;
        const formattedTime = selectedTime;

        addDoc(collection(db, "travels"), {
            origine: origine,
            destination: destination,
            userId: userId,
            carModel: carModel,
            carSeatsAvailable: parsedCarSeatsAvailable,
            carSeatsTaken: parsedCarSeatsTaken,
            travelTime: formattedTime,
            travelDate: formattedDate,
        }).then(() => {
            console.log("Create Travel Success: Data successfully added!");
        }).catch((error) => {
            console.error("Create Travel Error: ", error);
        });
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={styles.pagecontainer}>
                        <View style={styles.cardContainer}>
                            <TextInput
                                value={origine}
                                onChangeText={(origine) => setOrigine(origine)}
                                placeholderTextColor="#888888"
                                placeholder="Origen, calle exacta"
                                style={styles.textInputOrigin}
                            />
                            <TextInput
                                value={destination}
                                placeholderTextColor="#888888"
                                onChangeText={(destination) => setDestination(destination)}
                                placeholder="Destino"
                                style={styles.textInput}
                            />
                            <View style={styles.containerRow}>
                                <TextInput
                                    value={carModel}
                                    placeholderTextColor="#888888"
                                    onChangeText={(carModel) => setCarModel(carModel)}
                                    placeholder="Modelo de coche"
                                    style={styles.textInputRow}
                                />
                                <TextInput
                                    value={carSeatsAvailable}
                                    placeholderTextColor="#888888"
                                    onChangeText={(carSeatsAvailable) => setCarSeatsAvailable(carSeatsAvailable)}
                                    placeholder="Plazas disponibles"
                                    style={styles.textInputRow}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.containerRow}>
                                {isDatePickerVisible && (
                                    <DateTimePicker
                                        value={selectedDate}
                                        mode="date"
                                        display="default"
                                        onChange={handleDateChange}
                                        minimumDate={new Date()}
                                    />
                                )}
                                <TextInput
                                    placeholder={format(selectedDate, 'dd-MM-yyyy')}
                                    placeholderTextColor="#000"
                                    onFocus={showDatePicker}
                                    style={styles.textInputRow}
                                />
                                {isTimePickerVisible && (
                                    <DateTimePicker
                                        value={selectedTime}
                                        mode="time"
                                        display="default"
                                        onChange={handleTimeChange}
                                        minimumDate={minimumTime}
                                    />
                                )}
                                <TextInput
                                    placeholder={selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    placeholderTextColor="#000"
                                    onFocus={showTimePicker}
                                    style={styles.textInputRow}
                                />
                            </View>
                        </View>
                        <Text style={styles.errorMessage}>{errorMessage}</Text>
                        <TouchableOpacity style={styles.button} onPress={publishTravel}>
                            <Text style={styles.buttonText}>Publicar</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    textInputRow: {
      padding: 10,
      marginHorizontal: 5,
      paddingStart: 20,
      width: '52%',
      height: 50,
      marginTop: 25,
      fontSize: 14,
      borderWidth: 1,
      borderColor: '#9DD187',
      borderRadius: 15,
      backgroundColor: '#FFFFFF',
    },
    scrollView: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginVertical: 25,
    },
    text: {
        fontSize: 19,
        marginLeft: 10,
        fontStyle: 'normal', 
        marginBottom: 15,
    },
    image: {
        width: '39%',
        height: '18%',
        marginBottom: -50,
        top: -60,
    },
    cardContainer: {
        borderRadius: 10,
        backgroundColor: '#fff',
        elevation: 3,
        shadowOffset: { width: 1, height: 1 },
        shadowColor: '#333',
        shadowOpacity: 0.3,
        shadowRadius: 2,
        paddingHorizontal: 5,
        paddingVertical: 20,
        alignItems: 'center',
    },
    containerRow: {
      flexDirection: 'row',
      marginHorizontal: '5%',
      marginTop: -5,
    },
    textInputOrigin: {
      width: '95%',
      height: 50,
      paddingStart: 30,
      borderWidth: 1,
      borderColor: '#9DD187',
      borderRadius: 15,
      backgroundColor: '#FFFFFF',
  },
    textInput: {
        width: '95%',
        height: 50,
        paddingStart: 30,
        marginTop: 15,
        borderWidth: 1,
        borderColor: '#9DD187',
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
    },
    button: {
        backgroundColor: '#9DD187',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignSelf: 'center',
        marginVertical: 20,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    pagecontainer: {
      marginHorizontal: 20,
      marginVertical: 25,
    }, 
    icon: {
      flex: 1,
      left: -30,
      color: "#2A2C38",
    },
    buttonContainer: {
      marginTop: 10,
      marginLeft: 145,
    }, 
    error: {
      color: 'red',
      fontSize: 12,
      marginTop: 5,
      marginBottom: -10,
      textAlign: 'left',
      alignSelf: 'flex-start',
      marginLeft: 15,
      marginRight: 10,
    },

    errorRight: {
      color: 'red',
      fontSize: 12,
      marginBottom: -15,
      textAlign: 'left',
      alignSelf: 'flex-start',
      marginLeft: 0,
      marginRight: 0,
    },

    errorLeft: {
      color: 'red',
      fontSize: 12,
      marginBottom: -15,
      textAlign: 'left',
      alignSelf: 'flex-start',
      marginLeft: 0,
      marginRight: 0,
    },
    errorMessage: {
      color: 'red',
      marginTop: 10,
      marginLeft: 5,  
    },
    miniContainer:{
      marginHorizontal: 5,
    }
});
