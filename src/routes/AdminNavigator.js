import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Telas
import AdminDashboard from '../screens/AdminDashboard';
import AdminUsers from '../screens/AdminUsers';
import AdminCreches from '../screens/AdminCreches';
import AdminReviews from '../screens/AdminReviews';
import CrecheDetails from '../screens/CrecheDetails';
import Profile from '../screens/Profile';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stacks aninhadas para navegação de detalhes
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminDashboard} />
      <Stack.Screen name="ModerarReviews" component={AdminReviews} />
      <Stack.Screen name="Profile" component={Profile} />
    </Stack.Navigator>
  );
}

function CrecheStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CrechesList" component={AdminCreches} />
      <Stack.Screen name="CrecheDetails" component={CrecheDetails} />
    </Stack.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Users') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Creches') iconName = focused ? 'business' : 'business-outline';
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
      <Tab.Screen name="Dashboard" component={DashboardStack} options={{ tabBarLabel: 'Painel' }} />
      <Tab.Screen name="Users" component={AdminUsers} options={{ tabBarLabel: 'Usuários' }} />
      <Tab.Screen name="Creches" component={CrecheStack} options={{ tabBarLabel: 'Creches' }} />
      <Tab.Screen name="ProfileTab" component={Profile} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  );
}
