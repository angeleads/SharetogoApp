import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function TakenPlaces(props: any) {

    return (
        <View style={styles.mainContainer}>
            <View style={styles.container}>
                <Icon name={"user"} size={15} />
                <View style={styles.text}>
                    { props.takenPlaces === props.totalPlaces ? (
                        <Text style={styles.redText}>{props.takenPlaces}/{props.totalPlaces} Completo</Text>
                        ) : (
                            <Text style={styles.blackText}>{props.takenPlaces}/{props.totalPlaces} Plazas ocupadas</Text>
                            )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        paddingBottom: 5,
    },
    container: {
        flexDirection: 'row',
    },
    icon: {
        color: '#2A2C38',
    },
    circle: {
        paddingVertical: 3.5,
        paddingLeft: 2,
    },
    text: {
        marginHorizontal: 10,
        marginVertical: 1,
        color: '#2A2C38',
    },
    blackText: {
        color: 'black',
        fontSize: 13,
    },
    redText: {
        color: 'red',
        fontSize: 13,
    },
})