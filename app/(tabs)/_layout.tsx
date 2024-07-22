import { Tabs } from 'expo-router';
import { FontAwesome, FontAwesome5, Entypo, MaterialIcons } from '@expo/vector-icons';

const TabsLayout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarStyle: {
                    backgroundColor: '#9DD187', // Background color of the tab bar
                    shadowColor: '#000', // Shadow color
                    shadowOffset: { width: 0, height: 5 }, // Shadow offset
                    shadowOpacity: 0.3, // Shadow opacity
                    shadowRadius: 6, // Shadow radius
                    elevation: 10, // For Android shadow
                    height: 85, // Height of the tab bar
                },
                tabBarActiveTintColor: '#2A2C38', // Active tab icon and text color
                tabBarInactiveTintColor: '#2A2C38', // Inactive tab icon and text color
                tabBarLabelStyle: {
                    fontSize: 12, // Font size for the tab labels
                    marginBottom: -5, // Top margin for the tab labels
                },
                tabBarIconStyle: {
                    marginTop: 8, // Top margin for the icons
                },
                headerStyle: {
                    backgroundColor: '#9DD187', // Background color of the header
                },
                headerTintColor: '#2A2C38', // Optional: set the color of the header text and icons
            }}
        >
            <Tabs.Screen
                name="inicio"
                options={{
                    title: 'Inicio',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="home" color={color} size={30} />
                    ),
                }}
            />
            <Tabs.Screen
                name="publicar"
                options={{
                    title: 'Publicar',
                    tabBarIcon: ({ color, size }) => (
                        <Entypo name="add-to-list" color={color} size={30} />
                    ),
                }}
            />
            <Tabs.Screen
                name="reservar"
                options={{
                    title: 'Reservar',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="directions-car" color={color} size={30} />
                    ),
                }}
            />
            <Tabs.Screen
                name="cuenta"
                options={{
                    title: 'Cuenta',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5 name="user-alt" color={color} size={25} />
                    ),
                }}
            />
        </Tabs>
    );
};

export default TabsLayout;
