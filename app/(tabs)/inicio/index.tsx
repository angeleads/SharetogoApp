import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import MapCard from '../../../components/inicio/MapCard';
import TravelCard from '../../../components/TravelCards';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore'; // Import onSnapshot for realtime updates
import { auth, db } from '../../../library/firebase';
import moment from 'moment';
import _ from 'lodash';

export default function Inicio() {
    const router = useRouter();
    const [travelData, setTravelData] = useState([]);
    const [emptyData, setEmptyData] = useState(true);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false); 

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'travels'), (snapshot) => {
        fetchTravelData();
        });

        return () => unsubscribe();
    }, []);

    const fetchTravelData = async () => {
        const user = auth.currentUser;
        try {
          const userId = user?.uid;
          const userDocRef = doc(collection(db, "users"), userId);
          const userDocSnapshot = await getDoc(userDocRef);
      
          if (userDocSnapshot.exists()) {
              const userData = userDocSnapshot.data();
              const reservedTravels = userData.reservedTravels || [];
      
              if (reservedTravels.length > 0) {
                const reservedTravelData = await Promise.all(
                    reservedTravels.map(async (travelId: any) => {
                    const travelDocRef = doc(db, "travels", travelId);
                    const travelDocSnapshot = await getDoc(travelDocRef);
                    if (travelDocSnapshot.exists()) {
                        const travelData = travelDocSnapshot.data();
                        if (travelData.status !== 'cancelled') {
                        return { id: travelId, ...travelData };
                        }
                    }
                    return null;
                  })
              );
      
              const validReservedTravels = reservedTravelData.filter(
                  (travel) => travel !== null
              );
              setTravelData(sortTravelData(validReservedTravels));
              } else {
              setTravelData([]);
              }
          } else {
              setEmptyData(true);
          }
          setLoading(false);
        } catch (error) {
        console.error("Error fetching travel data:", error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
        await fetchTravelData();
        } catch (error) {
        console.error("Error while refreshing:", error);
        }
        setRefreshing(false);
    };

    const handleOpenGetPlace = () => {
        router.push("/(tabs)/reservar")
    };

  const sortTravelData = (data: any) => {
    return data.sort((a: any, b: any) => {
        const dateA = moment(a.travelDate.toDate());
        const dateB = moment(b.travelDate.toDate());

        if (dateA.isSame(dateB, 'day')) {
            const timeA = moment(a.travelTime.toDate());
            const timeB = moment(b.travelTime.toDate());
            return (timeA - timeB);
        }
          return (dateA - dateB);
      });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <MapCard />
        <Text style={styles.title}>¡Tus reservas!</Text>
        {loading ? (
            <ActivityIndicator style={styles.loadingIndicator} size="large" color="#000" />
          ) : (
            <>
              {travelData.length === 0 ? (
                <View style={styles.startBooking}>
                  <Text style={styles.startBookingText}>¿Aún no tienes ningún trayecto?</Text> 
                  <TouchableOpacity onPress={() => handleOpenGetPlace()}>
                    <LinearGradient
                      colors={['#9DD187', '#9DD187']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.button}
                    >
                      <Text style={styles.buttonText}>Empieza a reservar aquí</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                _.sortBy(travelData, [ 'travelDate.title', 'travelTime.time']).map((travel, index) => {
                  const titleDate = new Date(travel.travelDate.seconds * 1000 + travel.travelDate.nanoseconds / 1e6);
                  const formattedTitle = titleDate.toLocaleDateString('en-GB');

                  const timeDate = new Date(travel.travelTime.seconds * 1000 + travel.travelTime.nanoseconds / 1e6);
                  const formattedTime = Number(timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

                  return (
                      <TravelCard
                          key={index}
                          userId={travel.userId}
                          carModel={travel.carModel}
                          travelId={travel.id}
                          title={formattedTitle}
                          time={formattedTime}
                          from={travel.origine}
                          to={travel.destination}
                          buttonText="Chat"
                          totalPlaces={travel.carSeatsAvailable}
                          takenPlaces={travel.carSeatsTaken === '' ? "0" : travel.carSeatsTaken.toString()}
                          iconName="car"
                          takenPlaces={travel.carSeatsTaken === '' ? "0" : travel.carSeatsTaken.toString()}
                      />
                  );
              })
              )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    marginHorizontal: 20,
    marginVertical: 25,
    paddingBottom: 100,
  },
  title: {
    paddingTop: 18,
    paddingBottom: 20,
    color: '#2A2C38',
    fontSize: 25,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  startBooking: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: '5%',
  },
  startBookingText: {
    textAlign: 'center',
    fontSize: 18,
  },
  button: {
    width: '60%',
    height: 45,
    marginVertical: '3%',
    alignContent: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 11,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 15,
  },
  loadingIndicator: {
    flex: 1,
    marginTop:'25%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
