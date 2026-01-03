import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { supabase } from './src/services/supabase';

// Import your screens
import LoadingScreen from './src/screens/auth/LoadingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

const Stack = createStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={session ? "Home" : "Login"}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#1a1a1a' }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        
        {/* We'll add Home/Dashboard screens later */}
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Temporary HomeScreen
function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
      <Text style={{ color: '#FF6B6B', fontSize: 24, fontWeight: 'bold' }}>Family Fitness Gym</Text>
      <Text style={{ color: '#4ECDC4', fontSize: 16, marginTop: 10 }}>Dashboard Coming Soon</Text>
    </View>
  );
}