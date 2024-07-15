import React from 'react';
import { View, TouchableOpacity, Text, Image, StyleSheet, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';

export default function CreateTravelCard (props: any) {
    const router = useRouter();
    const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => router.navigate("(tabs)/publicar/createTravel")}>
        <View style={styles.mainContainer}>
          <View style={styles.container}>
            <Icon style={styles.plusIcon} name={"plus"} size={55} />
            <View>
              <Text style={styles.text}>¡Tengo plazas libres!</Text>
              <View style={styles.container}>
                <Icon style={styles.placeIcon} name={"plus"} size={25} />
                <Icon style={styles.placeIcon} name={"plus"} size={25} />
                <Icon style={styles.placeIcon} name={"plus"} size={25} />
              </View>
            </View>
          </View>
        </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
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
  container: {
    flexDirection: 'row',
  },
  text: {
    paddingTop: 17,
  },
  plusIcon: {
    paddingVertical: 25,
    paddingHorizontal: 35,
  },
  placeIcon: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
});