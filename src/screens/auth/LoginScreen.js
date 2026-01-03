import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '../../services/supabase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password.trim(),
      });

      if (error) {
        if (error.message === 'Invalid login credentials') {
          Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
        } else {
          Alert.alert('Login Failed', error.message);
        }
        return;
      }

      // Success - navigation will be handled by App.js
      
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Reset Password', 'Please enter your email address first');
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'familyfitness://reset-password',
      });

      if (error) throw error;
      
      Alert.alert(
        'Password Reset',
        'Check your email for password reset instructions.'
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>FAMILY FITNESS</Text>
          <Text style={styles.subtitle}>GYM</Text>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.tagline}>Sign in to continue your fitness journey</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
            <View style={styles.inputWrapper}>
              <Icon name="email" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Icon
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="login" size={20} color="#fff" />
                  <Text style={styles.loginButtonText}>SIGN IN</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* Demo Info */}
          <View style={styles.demoContainer}>
            <Text style={styles.demoTitle}>Demo Accounts:</Text>
            <View style={styles.demoInfo}>
              <Icon name="person" size={16} color="#FF6B6B" />
              <Text style={styles.demoText}>Client: client@test.com / client123</Text>
            </View>
            <View style={styles.demoInfo}>
              <Icon name="badge" size={16} color="#4ECDC4" />
              <Text style={styles.demoText}>Staff: staff@test.com / staff123</Text>
            </View>
            <View style={styles.demoInfo}>
              <Icon name="admin-panel-settings" size={16} color="#FFD166" />
              <Text style={styles.demoText}>Manager: manager@test.com / manager123</Text>
            </View>
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Sign Up Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FF6B6B',
    letterSpacing: 3,
    textShadowColor: 'rgba(255, 107, 107, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#4ECDC4',
    letterSpacing: 2,
    marginTop: -10,
    textShadowColor: 'rgba(78, 205, 196, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  welcomeText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  formContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  inputGroup: {
    marginBottom: 25,
  },
  inputLabel: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 55,
    color: '#fff',
    fontSize: 16,
  },
  eyeButton: {
    padding: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#FF6B6B',
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  disabledButton: {
    backgroundColor: '#FF9B9B',
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  demoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
  },
  demoTitle: {
    color: '#FFD166',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  demoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  demoText: {
    color: '#aaa',
    fontSize: 12,
    flex: 1,
    flexWrap: 'wrap',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#888',
    fontSize: 14,
  },
  registerLink: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: 'bold',
  },
});