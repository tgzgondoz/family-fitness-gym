import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();

// Import your screen components here
import HomeScreen from '../screens/client/HomeScreen';
import MembershipScreen from '../screens/client/MembershipScreen';
import ProfileScreen from '../screens/client/ProfileScreen';

export function ClientTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#2a2a2a',
          borderTopColor: '#333',
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#888',
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Membership"
        component={MembershipScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="fitness-center" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}