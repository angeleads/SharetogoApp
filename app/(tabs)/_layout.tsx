import { Tabs } from 'expo-router'
import { FontAwesome, FontAwesome5, Entypo, MaterialIcons } from '@expo/vector-icons' 

const TabsLayout = () => {
    return (
        <Tabs>
            <Tabs.Screen
                name="inicio"
                options = {{
                    title: 'Inicio',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="home" color="forestgreen" size={30} />
                    )
                }}
            />
            <Tabs.Screen
                name="publicar"
                options = {{
                    title: 'Publicar', 
                    tabBarIcon: ({ color, size }) => (
                        <Entypo name="add-to-list" color="green" size={30} />
                    )
                }}
            />
            <Tabs.Screen
                name="reservar"
                options = {{
                    title: 'Reservar',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="directions-car" color="green" size={30}/>
                    )
                }}
            />
            <Tabs.Screen
                name="cuenta"
                options = {{
                    title: 'Cuenta' ,
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome5 name="user-alt" color="green" size={25} />
                    )
                }}
            />
        </Tabs>
    )
}

export default TabsLayout