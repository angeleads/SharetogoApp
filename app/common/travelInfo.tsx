import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../library/firebase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome5';

export default function TravelInfo() {
    const navigation = useNavigation();
    const route = useRouter();
    const travelData = useLocalSearchParams();
    const [editor, setEditor] = useState(false);
    const [editedTravelData, setEditedTravelData] = useState(travelData || {});
    const [tempFrom, setTempFrom] = useState(travelData?.from || '');
    const [tempTo, setTempTo] = useState(travelData?.to || '');
    const [tempTotalPlaces, setTempTotalPlaces] = useState(travelData?.totalPlaces || '');
    const [tempTakenPlaces, setTempTakenPlaces] = useState(travelData?.takenPlaces || '');
    const [tempCarModel, setTempCarModel] = useState(travelData?.carModel || '');
    const [creatorName, setCreatorName] = useState('');
    const [creatorLastName, setCreatorLastName] = useState('');
    const [creatorProfilePicture, setCreatorProfilePicture] = useState('');
    const [refreshing, setRefreshing] = useState(false); 
    const [editAvailable, setEditAvailable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReserving, setIsReserving] = useState(false);
    const [reservationMessage, setReservationMessage] = useState(false);
    const [errorChanges, setErrorChanges] = useState("");
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
    const [minimunTime, setMinimunTime] = useState(null);

        // Create a new Date object with the current date and extracted hours/minutes
        const [hours, minutes] = travelData.time ? travelData.time.split(':') : ['00', '00'];
        const currentDate = new Date();
        currentDate.setHours(parseInt(hours, 10));
        currentDate.setMinutes(parseInt(minutes, 10));
        const [tempTime, setTempTime] = useState(currentDate);
    
    
        //Creating formated Date
        const todayDate = new Date();
        const year = todayDate.getFullYear();
        const month = String(todayDate.getMonth() + 1).padStart(2, '0');
        const day = String(todayDate.getDate()).padStart(2, '0');
        const formattedDate = `${day}/${month}/${year}`;  
        
        const showTimePicker = () => {
            if (travelData.title === formattedDate){
                setMinimunTime(new Date()); // Set minimunTime to current date as a Date object
            } else {
                setMinimunTime(null);
            }      
            setTimePickerVisibility(true);
        };       
    
        const hideTimePicker = () => {
            setTimePickerVisibility(false);
        };
    
    const fetchTravelData = async (travelId) => {
        try {
            const travelDocRef = doc(db, 'travels', travelId);
            const travelDocSnapshot = await getDoc(travelDocRef);
            
            if (travelDocSnapshot.exists()) {
                const travelInfo = travelDocSnapshot.data();
                //console.log('Fetched travel data:', travelInfo);
            } else {
                console.log('Travel not found.');
            }
        } catch (error) {
            console.error('Error fetching travel data:', error);
        }
    };

    useEffect(() => {
        setTempFrom(editedTravelData.from);
        setTempTo(editedTravelData.to);
        //setTempTime(editedTravelData.time);
        setTempTotalPlaces(editedTravelData.totalPlaces);
        setTempTakenPlaces(editedTravelData.takenPlaces);
        setTempCarModel(editedTravelData.carModel);
    
        const user = auth.currentUser;
        if (user && user.uid === travelData.userId) {
            setEditAvailable(true);
        } else {
            setEditAvailable(false);
        }
    }, [editedTravelData.from, editedTravelData.to, editedTravelData.time, editedTravelData.totalPlaces, editedTravelData.takenPlaces, editedTravelData.carModel, auth.currentUser, travelData.userId]);
    
    useEffect(() => {
        const fetchCreatorInfo = async () => {
            try {
                const creatorUserId = travelData.userId;
                const userRef = doc(db, 'users', creatorUserId);
                const userDocSnapshot = await getDoc(userRef);
        
                if (userDocSnapshot.exists()) {
                    const creatorData = userDocSnapshot.data();
                    setCreatorName(creatorData.name);
                    setCreatorLastName(creatorData.lastName);
                    setCreatorProfilePicture(creatorData.profilePicture);
                }
            } catch (error) {
                console.error('Error fetching creator information:', error);
            }
        };
        fetchCreatorInfo();
    }, [travelData.userId, route]);

    const handleGoBack = () => {
        setEditor(false);
        if (editAvailable) {
            route.back();
            onRefresh();
        } else {
            route.back();
            onRefresh();
        }
    };

    const handleOpenEdit = () => {
        if (editAvailable && !editor) {
            setEditor(true);
        }
    };
    
    const handleCloseEdit = () => {
        if (editAvailable && editor) {
            setEditor(false);
        }
    };
  
    const handleInputChange = (field, value) => {
        setEditedTravelData((prevData) => ({
          ...prevData,
          [field]: value,
        }));
        if (field === 'from') {
          setTempFrom(value);
        } else if (field === 'to') {
          setTempTo(value);
        } else if (field === 'time') {
          setTempTime(value);
        } else if (field === 'totalPlaces') {
          setTempTotalPlaces(value);
        } else if (field === 'takenPlaces') {
          setTempTakenPlaces(value);
        } else if (field === 'carModel') {
          setTempCarModel(value);
        }
      };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await fetchTravelData(travelData.travelId);
        } catch (error) {
            console.error("Error while refreshing:", error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        navigation.setOptions({
          headerRight: () => (
            <TouchableOpacity onPress={() => handleReserveButton()}>
              <Text>Reserve</Text>
            </TouchableOpacity>
          ),
        });
    }, []);

    const handleSaveChanges = async () => {
        if (travelData.takenPlaces > tempTotalPlaces) {
            setErrorChanges("ERROR: el número máximo de pasajeros no puede ser superior al numero de plazas reservadas.")
            return;
        }
        if (!/^\d+$/.test(tempTotalPlaces)) {
			setErrorChanges("ERROR: Indica tus plazas libre (Entre 1 y 8)");
			return;
        }
        if (tempTotalPlaces < 1 || tempTotalPlaces > 8) {
			setErrorChanges("ERROR: Indica tus plazas libre (Entre 1 y 8)");
			return;
        }
        if (tempCarModel === '') {
            setErrorChanges("ERROR: Indica el modelo de coche para tu trayecto");
            return;
        }
        if (tempFrom === '') {
            setErrorChanges("ERROR: Indica el origen (calle exacta)");
            return;
        }
        if (tempTo === '') {
            setErrorChanges("ERROR: Indica el destino del trayecto");
            return;
        }
        setErrorChanges("");
        setIsLoading(true);
        try {
          const travelDocRef = doc(db, 'travels', travelData.travelId);
          console.log(travelDocRef);
          const fieldsToUpdate = {
              origine: tempFrom,
              destination: tempTo,
              travelTime: tempTime,
              carSeatsAvailable: tempTotalPlaces,
              carSeatsTaken:tempTakenPlaces,
              carModel: tempCarModel,
            };
            await updateDoc(travelDocRef, fieldsToUpdate);
            console.log("Travel data updated successfully!");
            handleGoBack();
            setEditor(false);
        } catch (error) {
            console.error('Error updating travel data:', error);
        }
        setIsLoading(false);
        onRefresh();
    };

    const handleReserveButton = async () => {
        setIsLoading(true);
        setIsReserving(true);
        try {
            const user = auth.currentUser;

            if (user) {
                const userDocSnapshot = await getDoc(doc(db, 'users', auth.currentUser.uid));
                
                if (userDocSnapshot.exists()) {
                    const userData = userDocSnapshot.data();
                    const reservedTravels = userData.reservedTravels || [];
                        
                    if (!reservedTravels.includes(travelData.travelId)) {
                        const updatedReservedTravels = [...reservedTravels, travelData.travelId];
                        const userDocRef = doc(db, 'users', auth.currentUser.uid);
                        await updateDoc(userDocRef, { reservedTravels: updatedReservedTravels });
            
                        const travelDocRef = doc(db, 'travels', travelData.travelId);
                        const travelDocSnapshot = await getDoc(travelDocRef);
                        if (travelDocSnapshot.exists()) {
                            const travelInfo = travelDocSnapshot.data();
                            const updatedTakenPlaces = travelInfo.carSeatsTaken + 1;
                            await updateDoc(travelDocRef, { carSeatsTaken: updatedTakenPlaces });
                
                            console.log('Travel Info | Reservation successful!');
                            onRefresh();
                        }
                    } else {
                        console.log('You have already reserved this travel.');
                    }
                }
            } else {
                console.log('User not logged in');
            }
        } catch (error) {
            console.error('TravelInfo | Error reserving travel:', error);
        }
        setIsReserving(false);
        setIsLoading(false);
        onRefresh();
        handleGoBack();
        onRefresh();
      };
      
      const handleCancelTrip = async () => {
        setIsDeleting(true);
        setIsLoading(true);
        const user = auth.currentUser;
        if (!user) {
          console.log('User is not logged in.');
          setIsDeleting(false);
          return;
        } try {
          const userRef = doc(db, 'users', user.uid);
          const userDocSnapshot = await getDoc(userRef);
      
          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            const reservedTravels = userData.reservedTravels || [];
      
            if (user.uid === travelData.userId) {
              const travelDocRef = doc(db, 'travels', travelData.travelId);
              await deleteDoc(travelDocRef);
              console.log(`${travelData.travelId}: Travel canceled successfully.`);
              navigation.goBack();
            } else if (reservedTravels.includes(travelData.travelId)) {
              const updatedReservedTravels = reservedTravels.filter(
                (reservedTravelId) => reservedTravelId !== travelData.travelId
              );
              await updateDoc(userRef, { reservedTravels: updatedReservedTravels });
      
              const travelDocRef = doc(db, 'travels', travelData.travelId);
              const travelDocSnapshot = await getDoc(travelDocRef);
      
              if (travelDocSnapshot.exists()) {
                const travelData = travelDocSnapshot.data();
                const updatedCarSeatsTaken = travelData.carSeatsTaken - 1;
      
                await updateDoc(travelDocRef, { carSeatsTaken: updatedCarSeatsTaken });
                console.log('Reservation canceled successfully. Car seats updated.');
              } else {
                console.log('Travel not found.');
              }
            } else {
              console.log('User has not reserved this travel.');
            }
          } else {
            console.log('User data not found.');
          }
        } catch (error) {
          console.error('Error canceling travel/reservation:', error);
        }
        setIsDeleting(false);
        setIsLoading(false);
        onRefresh();
        handleGoBack();
        onRefresh();
      };
      
    
    const confirmCancel = () => {
        Alert.alert(
          "¿Estás seguro de que quieres anular el trayecto?",
          "",
          [
            { text: "NO", onPress: () => console.log("NO Pressed") },
            { text: "SI", onPress: handleCancelTrip }
          ]
        );
      };

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <View style={styles.cardContent}>
                    <View style={styles.content}>
                        <View style={styles.contentTop}>
                            <Text style={styles.title}> Trayecto del {travelData.title}</Text>
                            {editAvailable && !editor ? (
                                <TouchableOpacity style={styles.editButton} onPress={handleOpenEdit}>
                                    <View>
                                    <Icon name='edit' size={25} />
                                    </View>
                                </TouchableOpacity>
                            ) : (editAvailable && editor ? (
                                <TouchableOpacity style={styles.editButton} onPress={handleCloseEdit}>
                                    <View>
                                        <Icon name='times' size={25} />
                                    </View>
                                </TouchableOpacity>
                            ) : null)}
                        </View>
                    <View style={styles.contentTop}>
                        <View style={styles.FromTomainContainer}>
                            <View style={styles.FromTocontainer}>
                                <Icon name={"map-marker-alt"} size={15} />
                                {editor ? (
                                    <TextInput
                                        value={tempFrom}
                                        onChangeText={(text) => handleInputChange('from', text)}
                                        placeholder="Origen"
                                        editable={editor}
                                        style={styles.inputOriginDestination}
                                    />
                                ) : (
                                    <Text style={styles.FromTotext} >{travelData.from}</Text>
                                )}
                            </View>
                            <Icon style={styles.FromTocircle} name={"circle"} size={6} solid />
                            <Icon style={styles.FromTocircle} name={"circle"} size={6} solid />
                            <View style={styles.FromTocontainer}>
                                <Icon name={"flag-checkered"} size={15} />
                                {editor ? (
                                    <TextInput
                                        value={tempTo}
                                        onChangeText={(text) => handleInputChange('to', text)}
                                        placeholder="Destino"
                                        editable={editor}
                                        style={styles.inputOriginDestination}
                                    />
                                ) : (
                                    <Text style={styles.FromTotext} >{travelData.to}</Text>
                                )}
                            </View>
                        </View>
                        {creatorProfilePicture !== '' && (
                            <Image source={{ uri: creatorProfilePicture }} style={styles.profileImage} />
                        )}
                        <Text style={styles.text}>{creatorName}</Text>
                    </View>
                    <View style={styles.contentTop}>
                        <View style={styles.contentInfo}>
                            <Text style={styles.subtitle}>Hora de salida:</Text>
                            {editor ? (
                            <>
                            <TouchableOpacity style={styles.input} onPress={showTimePicker}>
                                <Text>{moment(tempTime).format('HH:mm')}</Text>
                            </TouchableOpacity>
                            {isTimePickerVisible && (
                                <DateTimePicker
                                    value={tempTime}
                                    mode="time"
                                    display="default"
                                    onChange={(event, selectedTime) => {
                                        if (event.type === 'set') {
                                            handleInputChange('time', selectedTime);
                                        }
                                        hideTimePicker();
                                    }}
                                    minimumDate={minimunTime}
                                />
                            )}
                            </>
                        ) : (
                            <Text style={styles.FromTotext}>{travelData.time}</Text>
                        )}
                        </View>
                        <View style={styles.contentInfo}>
                            <Text style={styles.subtitle}>Precio por persona:</Text>
                            <Text style={styles.textInfo}>0€</Text>
                        </View>
                    </View>
                    <View style={styles.contentTop}>
                        <View style={styles.contentInfo}>
                            <Text style={styles.subtitle}>Modelo de coche:</Text>
                            {editor ? (
                                <TextInput
                                    value={tempCarModel}
                                    onChangeText={(text) => handleInputChange('carModel', text)}
                                    placeholder="modelo del coche"
                                    editable={editor}
                                    style={styles.input}
                                />
                            ) : (
                                <Text style={styles.textInfo}>{ travelData.carModel }</Text>
                            )}
                        </View>
                        <View style={styles.contentInfo}>
                            <Text style={styles.subtitle}>Número de pasajeros:</Text>
                            {editor ? (
                                <View style={styles.editableRow}>
                                    <Text>{travelData.takenPlaces}</Text>
                                    <Text style={styles.divider}>/</Text>
                                    <TextInput
                                        value={tempTotalPlaces.toString()}
                                        onChangeText={(text) => setTempTotalPlaces(text)}
                                        placeholder="Total Places"
                                        keyboardType="numeric"
                                        style={styles.inputPlacesAvailables}
                                    />
                                </View>
                                ) : (
                                    <Text style={styles.FromTotext} >
                                    {travelData.takenPlaces} / {travelData.totalPlaces} pasajeros
                                    </Text>
                                )}
                            </View>
                        </View>
                        <View style={styles.contentBottom}>
                            <View style={styles.contentInfo}>
                                <View style={styles.buttonContainer}>
                            {travelData.buttonText !== "Completo" && travelData.buttonText !== "Reservar"?
                                <TouchableOpacity
                                    style={styles.chatButton}
                                    onPress={handleSaveChanges}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.buttonTextChat}>Chat</Text>

                                </TouchableOpacity>
                            : null
                            }
                                {editor ? (
                                    <TouchableOpacity
                                        style={styles.saveButton}
                                        onPress={handleSaveChanges}
                                        disabled={isLoading}
                                    >
                                        <Text style={styles.buttonText}>
                                            {isLoading ? 'Guardando...' : 'Guardar cambios'}
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    travelData.buttonText !== 'Reservar' ? (
                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={confirmCancel}
                                            disabled={isDeleting}
                                        >
                                            <Text style={styles.buttonText}>
                                                {isDeleting ? 'Anulando...' : editAvailable ? 'Anular trayecto' : 'Anular reserva'}
                                            </Text>
                                        </TouchableOpacity>
                                    ) : travelData.takenPlaces < travelData.totalPlaces ?(
                                        <TouchableOpacity
                                            style={styles.reservationButton}
                                            onPress={handleReserveButton}
                                            disabled={isDeleting}
                                        >
                                            <Text style={styles.buttonText}>
                                                {isReserving ? 'Reservando...' : 'Reservar trayecto'}
                                            </Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.completeButton}
                                            disabled={true}
                                        >
                                            <Text style={styles.buttonText}>
                                                Completo
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                )}
                                </View>
                                
                            </View>
                        </View>
                    </View>
                </View>
                <Text
                style={styles.textError}>
                {errorChanges}
            </Text>
        </ScrollView>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
        
    },
    input: {
        fontSize: 12,
        backgroundColor: '#FFFFFF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 2,
        width: '70%',
        borderColor: '#D1D1D1',
        color: '#2A2C38',
    },
    inputOriginDestination: {
        fontSize: 12,
        backgroundColor: '#FFFFFF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginHorizontal: 8,
        borderRadius: 8,
        top: -8,
        borderWidth: 2,
        width: '74%',
        borderColor: '#D1D1D1',
        color: '#2A2C38',
    },
    inputPlacesAvailables: {
        fontSize: 12,
        backgroundColor: '#FFFFFF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginHorizontal: 8,
        borderRadius: 8,
        borderWidth: 2,
        width: '21%',
        borderColor: '#D1D1D1',
        color: '#2A2C38',
    },
    editableRow: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      divider: {
        marginHorizontal: 5,
        fontSize: 18,
        color: '#2A2C38',
      },
    cardContent: {
        borderRadius: 10,
        backgroundColor: '#fff',
        elevation: 3,
        shadowOffset: { width: 1, height: 1 },
        shadowColor: '#333',
        shadowOpacity: 0.3,
        shadowRadius: 2,
        marginHorizontal: 15,
        marginVertical: 15,
    },
    content : {
        marginHorizontal: 15,
    },
    contentTop: {
        flexDirection: 'row',
        marginTop: '7%',
    },
    profileImage: {
        width: '18%',
        height: 58,
        borderRadius: 55,
        marginRight: '3%',
    },
    textUp: {
        flex: 1,
        paddingLeft: 10,
    },
    backButton: {
        marginLeft: '5%',
        marginTop: '4%',
        marginBottom: -5,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        marginLeft: -6,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    text: {
        fontSize: 14,
        lineHeight: 24,
        textAlign: 'justify',
        marginTop: '5%',
        marginRight: '8%',
    },
    textInfo: {
        marginTop: 0,
        fontSize: 14,
    },
    textInfoPassenger: {
        marginBottom: 5,
        fontSize: 14,
    },
    dot: {
        fontSize: 12,
        marginRight: 5,
      },
    itemText: {
        fontSize: 14,
      },
      FromTomainContainer: {
        flex: 1,
    },
    FromTocontainer: {
        flexDirection: 'row',
    },
    FromToicon: {
        color: '#2A2C38',
    },
    FromTocircle: {
        paddingVertical: 3.5,
        paddingLeft: 2,
    },
    FromTotext: {
        marginHorizontal: 10,
        marginVertical: 1,
        fontSize: 12,
        color: '#2A2C38',
    },
    contentBottom: {
        flexDirection: 'row',
        //justifyContent: 'center', 
        marginBottom: '6%',
    },
    contentInfo: {
        flex: 1,
        marginTop: '3%',
        marginBottom: '2%',
    },
    buttonContainer: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        width: '48%',
        height: 45,
        borderRadius: 8,
        justifyContent: 'center',
        marginTop: 15,
        marginBottom: -10,
        marginLeft: '50%',
    },
    chatButton: {
        backgroundColor: '#2A2C38',
        width: '48%',
        height: 45,
        borderRadius: 8,
        justifyContent: 'center',
        marginTop: 15,
        marginBottom: -10,
        marginRight: '-45%',
        marginLeft: '-2%',
    },
    completeButton: {
        backgroundColor: '#FF8C94',
        width: '50%',
        height: 45,
        borderRadius: 8,
        justifyContent: 'center',
        marginTop: 15,
        marginBottom: -10,
        marginLeft: '50%',
    },
    reservationButton: {
        backgroundColor: '#9DD187',
        width: '50%',
        height: 45,
        borderRadius: 8,
        justifyContent: 'center',
        marginTop: 15,
        marginBottom: -10,
        marginLeft: '50%',
    },
    buttonText: {
        fontSize: 18,
        color: '#2A2C38',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonTextChat: {
        fontSize: 18,
        color: '#FFFF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    editButton: {
        position: 'absolute',
        right: 5,
    },
    cancelButton: {
        backgroundColor: '#FF4747',
        width: '50%',
        height: 45,
        borderRadius: 8,
        justifyContent: 'center',
        marginTop: 15,
        marginBottom: -10,
        marginLeft: '50%',
    },
    textError: {
        color: 'red',
        marginLeft: 20,
    }
});