import { Tabs } from 'expo-router';
import { FontAwesome, FontAwesome5, Entypo, MaterialIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';

const TabsLayout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: '#9DD187',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 5 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 10,
                    height: (Platform.OS === 'ios') ? '11%' : '12%',
                },
                tabBarHideOnKeyboard: true,
                tabBarActiveTintColor: '#2A2C38', // Active tab icon and text color
                tabBarInactiveTintColor: '#2A2C38', // Inactive tab icon and text color
                tabBarLabelStyle: {
                    fontSize: 12, // Font size for the tab labels
                    marginBottom:(Platform.OS === 'ios') ? -5 : 18, // Top margin for the tab labels
                },
                tabBarIconStyle: {
                    marginTop: 8, // Top margin for the icons
                },
                headerStyle: {
                    backgroundColor: '#9DD187', // Background color of the header
                    height:(Platform.OS === 'ios') ? 100 : 72, // Increase the header height
                },
                headerTintColor: '#2A2C38', // Optional: set the color of the header text and icons
                headerTitleAlign: 'center', // Center the header title
                headerTitleStyle: {
                    fontSize: (Platform.OS === 'ios') ? 19 : 17,
                }
            }}
        >
            <Tabs.Screen
                name="inicio"
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="home" color={color} size={(Platform.OS === 'ios') ? 30 : 25} />
                    ),
                }}
            />
            <Tabs.Screen
                name="publicar"
                options={{
                    title: 'Publicar',
                    tabBarIcon: ({ color, size }) => (
                        <Entypo name="add-to-list" color={color} size={(Platform.OS === 'ios') ? 30 : 25} />
                    ),
                }}
            />
            <Tabs.Screen
                name="reservar"
                options={{
                    title: 'Reservar',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="directions-car" color={color} size={(Platform.OS === 'ios') ? 30 : 25} />
                    ),
                }}
            />
            <Tabs.Screen
                name="cuenta"
                options={{
                    title: 'Cuenta',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5 name="user-alt" color={color} size={(Platform.OS === 'ios') ? 27 : 22} />
                    ),
                }}
            />
        </Tabs>
    );
};

export default TabsLayout;
