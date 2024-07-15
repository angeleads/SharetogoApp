import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import TravelCard from '../../../components/TravelCards';
import CreateTravelCard from '../../../components/publicar/createTravelCard';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { auth, db } from '../../../library/firebase';
import moment from 'moment';

export default function Publicar() {
    const [travelData, setTravelData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const user = auth.currentUser;

    useEffect(() => {
        const userId = user?.uid;
        const q = query(collection(db, 'travels'), where('userId', '==', userId));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const travels = querySnapshot.docs.map((doc) => {
                const data = doc.data();
                return { ...data, id: doc.id };
            });
            setTravelData(sortTravelData(travels));
            setLoading(false);
            setRefreshing(false);
        });

        return () => unsubscribe();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        const userId = user?.uid;
        const q = query(collection(db, 'travels'), where('userId', '==', userId));

        onSnapshot(q, (querySnapshot) => {
            const travels = querySnapshot.docs.map((doc) => doc.data());
            setTravelData(sortTravelData(travels));
            setRefreshing(false);
        });
    };

    const sortTravelData = (data: any) => {
        return data.filter((item: any) => moment(item.travelDate.toDate()).isSameOrAfter(moment(), 'day'))
            .sort((a: any, b: any) => {
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
            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <Text style={styles.text}>¡Publica tus plazas libres!</Text>
                <CreateTravelCard go={"CreateTravel"} />
                <Text style={styles.text_mine}>¡Tus trayectos publicados!</Text>
                {loading ? (
                    <ActivityIndicator style={styles.loadingIndicator} size="large" color="#000" />
                ) : (
                    <View style={styles.travelList}>
                        {travelData.map((travel, index) => (
                            <TravelCard
                                key={index}
                                userId={travel.userId}
                                carModel={travel.carModel}
                                travelId={travel.id}
                                title={moment(travel.travelDate.toDate()).format('DD/MM/YYYY')}
                                time={moment(travel.travelTime.toDate()).format('HH:mm')}
                                from={travel.origine}
                                to={travel.destination}
                                buttonText="Chat"
                                totalPlaces={travel.carSeatsAvailable}
                                takenPlaces={travel.carSeatsTaken === '' ? '0' : travel.carSeatsTaken}
                                iconName="car" onReserve={undefined} travelReservation={false}                            />
                        ))}
                    </View>
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
    text: {
        fontSize: 19,
        fontWeight: '600',
        marginLeft: 10,
        marginBottom: 15,
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 100,
    },
    text_mine: {
        fontSize: 19,
        fontWeight: '600',
        marginLeft: 10,
        marginBottom: 15,
        marginTop: 15,
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
