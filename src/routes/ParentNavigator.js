import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Telas
import ParentDashboard from '../screens/ParentDashboard';
import MyChildren from '../screens/MyChildren';
import EnrollmentStatus from '../screens/EnrollmentStatus';
import CrecheDetails from '../screens/CrecheDetails';
import Profile from '../screens/Profile';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ParentHome" component={ParentDashboard} />
      <Stack.Screen name="CrecheDetails" component={CrecheDetails} />
      <Stack.Screen name="Profile" component={Profile} />
    </Stack.Navigator>
  );
}

export default function ParentNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Children') iconName = focused ? 'happy' : 'happy-outline';
          else if (route.name === 'MyEnrollments') iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'ProfileTab') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 10,
          paddingTop: 10,
          height: 70,
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ tabBarLabel: 'Explorar' }} />
      <Tab.Screen name="Children" component={MyChildren} options={{ tabBarLabel: 'Filhos' }} />
      <Tab.Screen name="MyEnrollments" component={EnrollmentStatus} options={{ tabBarLabel: 'Matrículas' }} />
      <Tab.Screen name="ProfileTab" component={Profile} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
}
