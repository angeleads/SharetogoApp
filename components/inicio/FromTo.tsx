import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
//https://github.com/oblador/react-native-vector-icons/blob/master/glyphmaps/FontAwesome.json

export default function FromTo(props: any) {
    return (
        <View style={styles.mainContainer}>
            <View style={styles.container}>
                <Icon name={"map-marker-alt"} size={15} />
                <Text style={styles.text} >{props.from}</Text>
            </View>
            <Icon style={styles.circle} name={"circle"} size={6} solid />
            <Icon style={styles.circle} name={"circle"} size={6} solid />
            <View style={styles.container}>
                <Icon name={"flag-checkered"} size={15} />
                <Text style={styles.text} >{props.to}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
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
        fontSize: 12,
        color: '#2A2C38',

    },
})