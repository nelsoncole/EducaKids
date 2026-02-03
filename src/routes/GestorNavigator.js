import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Telas
import GestorDashboard from '../screens/GestorDashboard';
import GestorCreche from '../screens/GestorCreche';
import GestorEnrollments from '../screens/GestorEnrollments';
import Profile from '../screens/Profile';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack para permitir navegação do dashboard para outras telas
function GestorStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GestorHome" component={GestorDashboard} />
      <Stack.Screen name="MinhaCreche" component={GestorCreche} />
      <Stack.Screen name="Matriculas" component={GestorEnrollments} />
      <Stack.Screen name="Profile" component={Profile} />
    </Stack.Navigator>
  );
}

export default function GestorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Main') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'EnrollmentsTab') iconName = focused ? 'school' : 'school-outline';
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
      <Tab.Screen name="Main" component={GestorStack} options={{ tabBarLabel: 'Painel' }} />
      <Tab.Screen name="EnrollmentsTab" component={GestorEnrollments} options={{ tabBarLabel: 'Alunos' }} />
      <Tab.Screen name="ProfileTab" component={Profile} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
}
