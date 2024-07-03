import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';

export default function MapCard() {
    const navigation = useNavigation();
    const [location, setLocation] = useState<LocationObject | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access location was denied');
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);
        })();
    }, []);

    const defaultRegion: Region = {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    const region: Region = location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    } : defaultRegion;

    return (
        <TouchableOpacity>
            <View style={styles.container}>
                <MapView style={styles.map} region={region}>
                    {location && (
                        <Marker
                            coordinate={{
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            }}
                            title="Your location"
                        />
                    )}
                </MapView>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 10,
        backgroundColor: '#fff',
        elevation: 3,
        shadowOffset: { width: 1, height: 1 },
        shadowColor: '#333',
        shadowOpacity: 0.3,
        shadowRadius: 2,
        marginHorizontal: 5,
        marginVertical: 6,
    },
    map: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
});
