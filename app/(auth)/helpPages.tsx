import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import car_logo_sharetogo from '../../assets/car_logo_sharetogo.png';
import shareCar2_img from '../../assets/shareCar2_img.jpg';
import shareCar_img from '../../assets/shareCar_img.jpg';
import price from '../../assets/price.png';
import payment from '../../assets/payment.png';
import chat_img from '../../assets/chat_img.png';
import car_logo_text from '../../assets/car_logo_text.png';
import { useRouter } from 'expo-router';

export default function HelpPages({  }) {
    const route = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const helpPagesNumber = 4;

    const handleSkip = () => {
        route.back()
    };

    const handleNext = () => {
        if (currentStep < helpPagesNumber - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            route.back()
        }
    };

    const handleBefore = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const titles = [
        'Actúa como conductor y/o pasajero',
        'Publica tus plazas libres',
        'Una vez confirmado el trayecto, se abrirá un chat interno entre los miembros del trayecto',
        'Para tí, para todos, comparte',
    ];
    const images = [
        shareCar_img,
        shareCar2_img,
        chat_img,
        car_logo_text,
    ];

    const renderDots = () => {
        const dots = [];
        for (let i = 0; i < helpPagesNumber; i++) {
            dots.push(
                <View
                    key={i}
                    style={[styles.dot, { backgroundColor: i === currentStep ? '#2A2C38' : '#E8F6DF' }]}
                />
            );
        }
        return dots;
    };

    return (
        
        <View style={styles.container}>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.buttonText}>
                        Saltar
                    </Text>
            </TouchableOpacity>
            <View style={styles.circleContainer}>
                <View style={styles.whiteCircle}>
                    <Image source={images[currentStep]} style={helpPagesNumber < 2 ? styles.image : styles.imageCircle} />
                </View>
            <Text style={styles.title}>{titles[currentStep]}</Text>
            </View> 
            <View style={styles.bottomButtonsContainer}>
                <TouchableOpacity style={styles.button} onPress={handleBefore}>
                    <Text style={styles.buttonText}>
                        {currentStep !== 0 ? 'Atrás' : 'Atrás'}
                    </Text>
                </TouchableOpacity>
                <View style={styles.dotsContainer}>{renderDots()}</View>
                <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>
                        {currentStep < helpPagesNumber - 1 ? 'Siguiente' : 'Finalizar'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#9DD187',
        justifyContent: 'center',
        alignItems: 'center',
    },
    circleContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        top: '13%',
        flex: 1,
    },
    title: {
        paddingTop: '5%',
        fontSize: 22,
        fontWeight: 'bold',
        color: "#2A2C38",
        marginHorizontal: 25,
        textAlign: 'center',
    },
    whiteCircle: {
        backgroundColor: '#E8F6DF',
        width: 350,
        height: 350,
        borderRadius: 250,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '85%',
        height: '85%',
    },
    imageCircle: {
        width: '80%',
        height: '80%',
        borderRadius: 200,
    },
    bottomButtonsContainer: {
        flexDirection: 'row',
        position: 'absolute',
        alignItems: 'center',
        bottom: 45,
        justifyContent: 'space-between',
    },
    button: {
        backgroundColor: 'transparent',
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    skipButton: {
        top: '-42%',
        marginRight: -275,
    },
    buttonText: {
        color: '#2A2C38',
        fontSize: 16,
        marginHorizontal: 45,
    },
    beforeText:{
        padding: -2,
        borderRadius: 5,
    },
    dotsContainer: {
        marginLeft: 12,
        marginRight: -10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 0,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
});
