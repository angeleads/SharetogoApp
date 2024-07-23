import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import TakenPlaces from './TakenPlaces';
import FromTo from './inicio/FromTo';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { auth, db } from '../library/firebase';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

interface TravelCardsProps {
  onReserve: any;
  title: string;
  time: string;
  from: string;
  to: string;
  totalPlaces: number;
  takenPlaces: number;
  travelId: string;
  travelReservation: boolean;
  userId: string;
  iconName: string;
  carModel: string;
  buttonText: string;
}

export default function TravelCards(props: TravelCardsProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const [isReserving, setIsReserving] = useState(false);
  const [reservationMessage, setReservationMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReserveButton = async () => {
    setIsLoading(true);
    setIsReserving(true);
    try {
      if (props.onReserve) {
        const querySnapshot = await getDoc(doc(db, 'users', auth.currentUser?.uid || ''));

        if (querySnapshot.exists()) {
          const userData = querySnapshot.data();
          const reservedTravels: string[] = userData?.reservedTravels || [];

          if (!reservedTravels.includes(props.travelId)) {
            const updateReservedTravels = [...reservedTravels, props.travelId];
            const userDocRef = doc(db, 'users', auth.currentUser?.uid || '');

            await updateDoc(userDocRef, { reservedTravels: updateReservedTravels });

            const travelDocRef = doc(db, 'travels', props.travelId);
            const travelDocSnapshot = await getDoc(travelDocRef);

            if (travelDocSnapshot.exists()) {
              const travelData = travelDocSnapshot.data();
              const updatedTakenPlaces = (travelData?.carSeatsTaken || 0) + 1;
              await updateDoc(travelDocRef, { carSeatsTaken: updatedTakenPlaces });

              console.log('Travel Cards | Reservation successful!');
            }
            setTimeout(() => {
              setReservationMessage('');
            }, 3000);
          } else {
            console.log('You have already reserved this travel');
            setReservationMessage('You have already reserved this travel');
            setTimeout(() => {
              setReservationMessage('');
            }, 3000);
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error handling reservation and navigation:', error);
    }
    setIsReserving(false);
    setIsLoading(false);
  };

  const openURL = async () => {
    const url = 'https://t.me/Share2Go/12';
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
  };

  const handleChatNavigation = () => {
    router.push({
      pathname: '/(chat)',
      params: {
        travelId: props.travelId,
        userId: auth.currentUser?.uid,
        creatorId: props.userId,
      },
    });
  };


  const handleOpenTravelInfo = () => {
    const travelData = {
      title: props.title,
      time: props.time,
      from: props.from,
      to: props.to,
      totalPlaces: props.totalPlaces,
      takenPlaces: props.takenPlaces,
      travelId: props.travelId,
      userId: props.userId,
      iconName: props.iconName,
      carModel: props.carModel,
      buttonText: props.buttonText,
    };
  
    router.push({
      pathname: '/(travelInfo)',
      params: travelData,
    });
  };

  const handleButtonPress = () => {
    if (props.buttonText === 'Chat') {
      handleChatNavigation();
    } else if (props.buttonText === 'Anular') {
      handleOpenTravelInfo();
    } else if (props.buttonText === 'Reservar') {
      console.log('This button has been clicked');
      handleReserveButton();
    } else {
      console.log('Button text not recognized');
    }
  };

  const isReservationDisabled = parseInt(props.takenPlaces.toString()) >= parseInt(props.totalPlaces.toString());

  return (
    <TouchableOpacity onPress={() => handleOpenTravelInfo()}>
      <View style={props.buttonText === 'Anular' ? styles.containerReserved : styles.container}>
        <View style={styles.textContainer}>
          <View style={styles.titlePriceContainer}>
            <Icon name={props.iconName} size={20} style={styles.iconTravel} />
            <Text style={styles.title}>Trayecto del {props.title}</Text>
            <Text style={styles.price}>0€</Text>
          </View>
          <View style={styles.container2}>
            <FromTo from={props.from} to={props.to} />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleButtonPress()}
                disabled={isReservationDisabled && props.buttonText !== 'Chat'}
              >
                <LinearGradient
                  colors={
                    isReservationDisabled && props.buttonText !== 'Chat' && props.buttonText !== 'Anular'
                      ? ['#FF8C94', '#FF8C94']
                      : props.buttonText === 'Anular'
                      ? ['#FF4747', '#FF4747']
                      : ['#9DD187', '#9DD187']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  {isReservationDisabled ? (
                    props.buttonText === 'Chat' || props.buttonText === 'Anular' ? (
                      <Text style={styles.text}>{props.buttonText}</Text>
                    ) : (
                      <Text style={styles.text}>Completo</Text>
                    )
                  ) : (
                    <Text style={styles.text}>{isReserving ? 'Reservando...' : props.buttonText}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.placesContainer}>
            <Text style={styles.textTime}>Hora salida: {props.time}</Text>
            <TakenPlaces totalPlaces={props.totalPlaces} takenPlaces={props.takenPlaces} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 3,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: '#333',
    shadowOpacity: 0.8,
    shadowRadius: 2,
    marginHorizontal: 5,
    marginVertical: 6,
  },
  containerReserved: {
    borderRadius: 10,
    backgroundColor: '#E0ECD5',
    elevation: 3,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: '#333',
    shadowOpacity: 0.8,
    shadowRadius: 2,
    marginHorizontal: 5,
    marginVertical: 6,
  },
  titlePriceContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  textContainer: {
    padding: 10,
  },
  container2: {
    flexDirection: 'row',
  },
  placesContainer: {
    flexDirection: 'row',
  },
  price: {
    position: 'absolute',
    right: '2%',
    fontSize: 18,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2A2C38',
    paddingBottom: 15,
  },
  textTime: {
    fontSize: 12,
    paddingVertical: 10,
    color: '#2A2C38',
    marginTop: 5,
  },
  text: {
    fontSize: 18,
    color: '#2A2C38',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  iconTravel: {
    paddingRight: '3%',
  },
  button: {
    width: '100%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 11,
  },
  buttonContainer: {
    alignItems: 'center',
    paddingRight: 15,
  },
});
