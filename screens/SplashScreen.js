// screens/SplashScreen.js
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  StatusBar, 
  Image, 
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  SafeAreaView
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleGetStarted = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      navigation.replace('Login');
    });
  };

  const buttonScale = useRef(new Animated.Value(1)).current;

  const buttonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const buttonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#141f23" 
      />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Logo */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Image 
            source={require('../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* App Name and Tagline */}
        <View style={styles.textContainer}>
          <Text style={styles.appName}>GYM</Text>
          <View style={styles.divider} />
          <Text style={styles.tagline}>Transform Your Potential</Text>
          <Text style={styles.subTagline}>Every rep counts</Text>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity 
              style={styles.getStartedButton}
              onPress={handleGetStarted}
              onPressIn={buttonPressIn}
              onPressOut={buttonPressOut}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>
          
          <TouchableOpacity 
            style={styles.signInButton}
            onPress={() => navigation.replace('Login')}
            activeOpacity={0.7}
          >
            <Text style={styles.signInText}>
              Already have an account?{' '}
              <Text style={styles.signInLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141f23',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? 60 : 40,
  },
  logoImage: {
    width: 100,
    height: 100,
    tintColor: '#f2faea',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  appName: {
    fontSize: 36,
    fontWeight: Platform.OS === 'ios' ? '800' : 'bold',
    color: '#f2faea',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: '#59cb01',
    borderRadius: 2,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 16,
    color: '#f2faea',
    fontWeight: Platform.OS === 'ios' ? '500' : '600',
    marginBottom: 6,
  },
  subTagline: {
    fontSize: 14,
    color: 'rgba(242, 250, 234, 0.7)',
    fontWeight: Platform.OS === 'ios' ? '300' : 'normal',
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: '#59cb01',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    maxWidth: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: '#141f23',
  },
  signInButton: {
    marginTop: 20,
    padding: 12,
  },
  signInText: {
    fontSize: 15,
    color: 'rgba(242, 250, 234, 0.8)',
    textAlign: 'center',
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
  },
  signInLink: {
    color: '#59cb01',
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
  },
});

export default SplashScreen;