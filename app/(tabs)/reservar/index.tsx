import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import TravelCard from '../../../components/TravelCards';
import { Searchbar } from 'react-native-paper';
import { collection, getDocs, doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../../library/firebase';
import moment from 'moment';

export default function Reservar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [travelData, setTravelData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'travels'), (snapshot) => {
      fetchTravelData();
    });

    return () => unsubscribe();
  }, []);

  const fetchTravelData = async () => {
    setLoading(true);
    setRefreshing(true);
    try {
      const userId = user?.uid;
      console.log('Fetching travel data for userId:', userId);
  
      const travelsQuerySnapshot = await getDocs(collection(db, 'travels'));
      const travels = travelsQuerySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          return { ...data, id: doc.id };
        })
        .filter((travel) => travel.userId !== userId);
  
      console.log('Setting travelData with travels:', travels);
      setTravelData(sortTravelData(travels));
  
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching travel data:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchTravelData();
  }, []);

  useEffect(() => {
    console.log('Travel Data before rendering:', travelData);
  }, [travelData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTravelData();
  };

  const handleReserveButton = async (travelId, carSeatsAvailable, carSeatsTaken) => {
    try {
      if (carSeatsTaken >= carSeatsAvailable) {
        console.log('No available seats for reservation.');
        return;
      }
      if (user) {
        const userDocSnapshot = await getDoc(doc(db, 'users', user.uid));
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();

          if (!reservedTravels.includes(travelId)) {
            const updatedReservedTravels = [...reservedTravels, travelId];

            const userDocRef = doc(db, 'users', userDocSnapshot.id);
            await updateDoc(userDocRef, { reservedTravels: updatedReservedTravels });

            const travelDocRef = doc(db, 'travels', travelId);
            const travelDocSnapshot = await getDoc(travelDocRef);

            if (travelDocSnapshot.exists()) {
              const travelData = travelDocSnapshot.data();
              const updatedTakenPlaces = travelData.carSeatsTaken + 1;
              await updateDoc(travelDocRef, { carSeatsTaken: updatedTakenPlaces });

              console.log('Reservation successful!');
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
      console.error('Error reserving travel:', error);
    }
  };

  const sortTravelData = (data) => {
    return data
      .filter((item) => moment(item.travelDate.toDate()).isSameOrAfter(moment(), 'day'))
      .sort((a, b) => {
        const dateA = moment(a.travelDate.toDate());
        const dateB = moment(b.travelDate.toDate());

        if (dateA.isSame(dateB, 'day')) {
          const timeA = moment(a.travelTime.toDate());
          const timeB = moment(b.travelTime.toDate());
          return timeA.diff(timeB);
        } else {
          return dateA.diff(dateB);
        }
      });
  };

  return (
    <View style={styles.container}>
      <Searchbar
        style={styles.search_bar}
        placeholder="Buscar"
        onChangeText={setSearchQuery}
        value={searchQuery}
      />
      <ScrollView
        contentContainerStyle={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.text_mine}>¡Mejores trayectos!</Text>
        {loading ? (
          <ActivityIndicator style={styles.loadingIndicator} size="large" color="#000" />
        ) : (
          <View style={styles.travelList}>
            {travelData.map((travel, index) => {
              const titleDate = new Date(travel.travelDate.seconds * 1000 + travel.travelDate.nanoseconds / 1e6);
              const formattedTitle = titleDate.toLocaleDateString('en-GB');

              const timeDate = new Date(travel.travelTime.seconds * 1000 + travel.travelTime.nanoseconds / 1e6);
              const formattedTime = timeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <TravelCard
                  key={index}
                  userId={travel.userId}
                  carModel={travel.carModel}
                  title={formattedTitle}
                  time={formattedTime}
                  from={travel.origine}
                  to={travel.destination}
                  totalPlaces={travel.carSeatsAvailable}
                  travelReservation={travel.travelReservation}
                  buttonText={
                    travel.reservedTravels && travel.reservedTravels.includes(travel.id)
                      ? "Anular"
                      : "Reservar"
                  }
                  takenPlaces={travel.carSeatsTaken === '' ? '0' : travel.carSeatsTaken}
                  travelId={travel.id}
                  onReserve={() => handleReserveButton(travel.id, travel.carSeatsAvailable, travel.carSeatsTaken)}
                  iconName="couch"
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
    
    const styles = StyleSheet.create({
      container_bar: {
        backgroundColor: '#fff',
        elevation: 3,
        shadowOffset: { width: 1, height: 1 },
        shadowColor: '#333',
        shadowOpacity: 0.3,
        shadowRadius: 2,
        marginVertical: 3,
      },
      text_mine: {
        fontSize: 19,
        fontWeight: '600',
        marginLeft: 10,
        marginBottom: 15,
        marginTop: 15,
      },
      search_bar: {
        marginHorizontal: 10,
        marginVertical: 12,
        height: 50,
        shadowOffset: { width: 1, height: 1 },
        shadowColor: '#333',
        shadowOpacity: 0.8,
        shadowRadius: 2,
      },
      container: {
        flex: 1,
        backgroundColor: '#fff',
      },
      text: {
        fontSize: 19,
        fontWeight: '600',
        marginLeft: 10,
        marginBottom: 15,
      },
      textTwo: {
        fontSize: 17,
        fontWeight: 600,
        marginLeft: 10,
        marginTop: 15,
        marginBottom: 15,
      },
      scrollView: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 100,
      },
      travelList: {
        flex: 1,
      },
      loadingIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
    });
    