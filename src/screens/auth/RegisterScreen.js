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

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      // First, sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password.trim(),
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Then, create user profile in our users table
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email: email.trim().toLowerCase(),
              full_name: fullName.trim(),
              phone_number: phone.trim(),
              role: 'client', // Default role for new registrations
              is_active: true,
            }
          ]);

        if (profileError) {
          // If profile creation fails, try to delete the auth user
          await supabase.auth.signOut();
          throw profileError;
        }

        Alert.alert(
          'Success!',
          'Account created successfully! You can now log in.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      }

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.message.includes('already registered')) {
        Alert.alert('Error', 'An account with this email already exists. Please log in instead.');
      } else if (error.message.includes('invalid email')) {
        Alert.alert('Error', 'Please enter a valid email address');
      } else {
        Alert.alert('Error', error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>FAMILY FITNESS</Text>
          <Text style={styles.subtitle}>GYM</Text>
          <Text style={styles.welcomeText}>Join Our Family</Text>
          <Text style={styles.tagline}>Create your account to start your fitness journey</Text>
        </View>

        {/* Registration Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <View style={styles.inputWrapper}>
              <Icon name="person" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#666"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          </View>

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
            <Text style={styles.inputLabel}>PHONE NUMBER</Text>
            <View style={styles.inputWrapper}>
              <Icon name="phone" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#666"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create a password (min. 6 characters)"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password-new"
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

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Icon name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#666"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoComplete="password-new"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <Icon
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={loading}
          >
            <View style={styles.buttonContent}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="person-add" size={20} color="#fff" />
                  <Text style={styles.registerButtonText}>CREATE ACCOUNT</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          {/* Membership Benefits */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Membership Benefits:</Text>
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={16} color="#4ECDC4" />
              <Text style={styles.benefitText}>Track your membership & payments</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={16} color="#4ECDC4" />
              <Text style={styles.benefitText}>Renew subscription with Ecocash</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={16} color="#4ECDC4" />
              <Text style={styles.benefitText}>Log workouts & track progress</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="check-circle" size={16} color="#4ECDC4" />
              <Text style={styles.benefitText}>Receive invoices via WhatsApp</Text>
            </View>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
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
    paddingTop: 40,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 10,
    padding: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FF6B6B',
    letterSpacing: 2,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4ECDC4',
    letterSpacing: 1,
    marginTop: -5,
  },
  welcomeText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 14,
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
    marginBottom: 20,
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
    height: 50,
    color: '#fff',
    fontSize: 16,
  },
  eyeButton: {
    padding: 5,
  },
  registerButton: {
    backgroundColor: '#4ECDC4',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 25,
  },
  disabledButton: {
    backgroundColor: '#7FD9D1',
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  benefitsContainer: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.2)',
  },
  benefitsTitle: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  benefitText: {
    color: '#ccc',
    fontSize: 12,
    flex: 1,
    flexWrap: 'wrap',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#888',
    fontSize: 14,
  },
  loginLink: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: 'bold',
  },
});