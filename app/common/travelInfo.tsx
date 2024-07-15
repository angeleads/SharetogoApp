import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../library/firebase';

export default function TravelInfo() {
    const navigation = useNavigation();
    const route = useRoute();
    const { travelData } = route.params || {};

    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReserving, setIsReserving] = useState(false);
    const [editor, setEditor] = useState(false);
    const [tempTime, setTempTime] = useState(travelData.time);
    const [tempCarModel, setTempCarModel] = useState(travelData.carModel);
    const [editAvailable, setEditAvailable] = useState(travelData.userId === auth.currentUser?.uid);

    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
    const [minimunTime, setMinimunTime] = useState('');

    useEffect(() => {
        const fetchTravelData = async () => {
            try {
                const travelDoc = await getDoc(doc(db, 'travels', travelData.travelId));
                if (travelDoc.exists()) {
                    const data = travelDoc.data();
                    setTempTime(data.time);
                    setTempCarModel(data.carModel);
                }
            } catch (error) {
                console.error('Error fetching travel data:', error);
            }
            setIsLoading(false);
        };

        if (travelData) {
            fetchTravelData();
        }
    }, [travelData]);

    const handleInputChange = (field, value) => {
        if (field === 'time') {
            setTempTime(value);
        } else if (field === 'carModel') {
            setTempCarModel(value);
        }
    };

    const handleSaveChanges = async () => {
        try {
            const travelDocRef = doc(db, 'travels', travelData.travelId);
            await updateDoc(travelDocRef, {
                time: tempTime,
                carModel: tempCarModel,
            });
            console.log('Travel Info | Changes saved successfully');
            setEditor(false);
        } catch (error) {
            console.error('Error saving changes:', error);
        }
    };

    const handleCancelChanges = () => {
        setEditor(false);
        setTempTime(travelData.time);
        setTempCarModel(travelData.carModel);
    };

    const showTimePicker = () => {
        if (travelData.title === formattedDate){
            setMinimunTime(new Date());
        }
        else {
            setMinimunTime(null);
        }      
        setTimePickerVisibility(true);
    };       

    const hideTimePicker = () => {
        setTimePickerVisibility(false);
    };

    const handleOpenEdit = () => {
        setEditor(true);
    };

    const handleDeleteTravel = async () => {
        setIsDeleting(true);
        try {
            await deleteDoc(doc(db, 'travels', travelData.travelId));
            console.log('Travel Info | Travel deleted successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Error deleting travel:', error);
        }
        setIsDeleting(false);
    };

    const handleReserveButton = async () => {
        setIsReserving(true);
        try {
            const travelDocRef = doc(db, 'travels', travelData.travelId);
            const travelDoc = await getDoc(travelDocRef);
            if (travelDoc.exists()) {
                const travelInfo = travelDoc.data();
                if (travelInfo.carSeatsTaken < travelInfo.totalPlaces) {
                    await updateDoc(travelDocRef, {
                        carSeatsTaken: travelInfo.carSeatsTaken + 1,
                    });
                    console.log('Travel Info | Seat reserved successfully');
                } else {
                    console.log('No seats available');
                }
            }
        } catch (error) {
            console.error('Error reserving seat:', error);
        }
        setIsReserving(false);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <ScrollView>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Información del Viaje</Text>
                </View>
                <View style={styles.profileSection}>
                    <Image source={{ uri: travelData.profilePicture }} style={styles.profileImage} />
                    <Text style={styles.profileName}>{travelData.userName}</Text>
                </View>
                <View style={styles.travelDetails}>
                    {editor ? (
                        <View>
                            <Text style={styles.inputLabel}>Hora:</Text>
                            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                                <Text style={styles.inputField}>{moment(tempTime).format('HH:mm')}</Text>
                            </TouchableOpacity>
                            <DateTimePicker
                                isVisible={showTimePicker}
                                mode="time"
                                onConfirm={(time) => handleInputChange('time', time)}
                                onCancel={() => setShowTimePicker(false)}
                            />
                            <Text style={styles.inputLabel}>Modelo del coche:</Text>
                            <TextInput
                                style={styles.inputField}
                                value={tempCarModel}
                                onChangeText={(text) => handleInputChange('carModel', text)}
                            />
                            <View style={styles.buttons}>
                                <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
                                    <Text style={styles.buttonText}>Guardar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelChanges}>
                                    <Text style={styles.buttonText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View>
                            <Text style={styles.infoText}>Origen: {travelData.from}</Text>
                            <Text style={styles.infoText}>Destino: {travelData.to}</Text>
                            <Text style={styles.infoText}>Número de plazas: {travelData.totalPlaces}</Text>
                            <Text style={styles.infoText}>Plazas reservadas: {travelData.takenPlaces}</Text>
                            <Text style={styles.infoText}>Modelo del coche: {travelData.carModel}</Text>
                            <Text style={styles.infoText}>Hora: {travelData.time}</Text>
                        </View>
                    )}
                </View>
                {editAvailable && !editor && (
                    <TouchableOpacity style={styles.editButton} onPress={handleOpenEdit}>
                        <Text style={styles.buttonText}>Editar</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.reserveButton} onPress={handleReserveButton} disabled={isReserving}>
                    <Text style={styles.buttonText}>{isReserving ? 'Reservando...' : 'Reservar Plaza'}</Text>
                </TouchableOpacity>
                {editAvailable && (
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteTravel} disabled={isDeleting}>
                        <Text style={styles.buttonText}>{isDeleting ? 'Eliminando...' : 'Eliminar Viaje'}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        padding: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 10,
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    travelDetails: {
        marginBottom: 20,
    },
    infoText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    inputField: {
        fontSize: 16,
        color: '#333',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 5,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    saveButton: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 5,
    },
    cancelButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    reserveButton: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 20,
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    editButton: {
        backgroundColor: '#ffc107',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
