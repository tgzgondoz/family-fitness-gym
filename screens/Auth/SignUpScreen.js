// screens/Auth/SignUpScreen.js
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');

const SignUpScreen = ({ navigation }) => {
  const [role, setRole] = useState('client');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState({
    fullName: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  const { signUp, isManager } = useAuth();

  React.useEffect(() => {
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
      })
    ]).start();
    
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const roles = [
    { label: 'Client', value: 'client', icon: 'person-outline' },
    { label: 'Staff', value: 'staff', icon: 'people-outline' },
    { label: 'Manager', value: 'manager', icon: 'shield-checkmark-outline' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }

    if (formData.phone.length < 8) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }

    if (!formData.password) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (!acceptTerms) {
      Alert.alert('Error', 'You must accept the terms and conditions');
      return false;
    }

    // Check role restrictions
    if (role === 'staff' || role === 'manager') {
      Alert.alert(
        'Permission Required',
        'Staff and manager accounts can only be created by existing managers. Please sign up as a client or contact an administrator.',
        [
          { 
            text: 'Sign up as Client', 
            onPress: () => {
              setRole('client');
              proceedWithSignUp();
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    await proceedWithSignUp();
  };

  const proceedWithSignUp = async () => {
    setIsLoading(true);
    
    const userData = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      fullName: formData.fullName.trim(),
      phone: formData.phone.trim(),
      role: role // This will always be 'client' for self-signup
    };

    const result = await signUp(userData);
    
    setIsLoading(false);
    
    if (result.success) {
      Alert.alert(
        'Success!',
        result.message || 'Account created successfully!',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Login') 
          }
        ]
      );
    } else {
      Alert.alert('Sign Up Failed', result.error || 'Failed to create account');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Back Button */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color="#141f23" 
                style={{ opacity: 0.8 }}
              />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Start your fitness journey with us</Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Full Name */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <View style={[
                  styles.inputContainer,
                  isFocused.fullName && styles.inputContainerFocused
                ]}>
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={isFocused.fullName ? '#59cb01' : '#8a9a9f'} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="#8a9a9f"
                    value={formData.fullName}
                    onChangeText={(text) => handleInputChange('fullName', text)}
                    onFocus={() => handleFocus('fullName')}
                    onBlur={() => handleBlur('fullName')}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <View style={[
                  styles.inputContainer,
                  isFocused.email && styles.inputContainerFocused
                ]}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={isFocused.email ? '#59cb01' : '#8a9a9f'} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#8a9a9f"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Phone Number */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <View style={[
                  styles.inputContainer,
                  isFocused.phone && styles.inputContainerFocused
                ]}>
                  <Ionicons 
                    name="call-outline" 
                    size={20} 
                    color={isFocused.phone ? '#59cb01' : '#8a9a9f'} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#8a9a9f"
                    value={formData.phone}
                    onChangeText={(text) => handleInputChange('phone', text)}
                    onFocus={() => handleFocus('phone')}
                    onBlur={() => handleBlur('phone')}
                    keyboardType="phone-pad"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Password *</Text>
                <View style={[
                  styles.inputContainer,
                  isFocused.password && styles.inputContainerFocused
                ]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={isFocused.password ? '#59cb01' : '#8a9a9f'} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Create a password (min. 6 characters)"
                    placeholderTextColor="#8a9a9f"
                    value={formData.password}
                    onChangeText={(text) => handleInputChange('password', text)}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                  <TouchableOpacity 
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    style={styles.eyeIcon}
                    activeOpacity={0.7}
                    disabled={isLoading}
                  >
                    <Ionicons 
                      name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#8a9a9f" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Confirm Password *</Text>
                <View style={[
                  styles.inputContainer,
                  isFocused.confirmPassword && styles.inputContainerFocused
                ]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={isFocused.confirmPassword ? '#59cb01' : '#8a9a9f'} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Confirm your password"
                    placeholderTextColor="#8a9a9f"
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleInputChange('confirmPassword', text)}
                    onFocus={() => handleFocus('confirmPassword')}
                    onBlur={() => handleBlur('confirmPassword')}
                    secureTextEntry={!isConfirmPasswordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                  <TouchableOpacity 
                    onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                    style={styles.eyeIcon}
                    activeOpacity={0.7}
                    disabled={isLoading}
                  >
                    <Ionicons 
                      name={isConfirmPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#8a9a9f" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms Checkbox */}
              <View style={styles.termsContainer}>
                <TouchableOpacity 
                  style={styles.checkbox} 
                  onPress={() => setAcceptTerms(!acceptTerms)}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <Ionicons 
                    name={acceptTerms ? "checkbox" : "square-outline"} 
                    size={24} 
                    color={acceptTerms ? '#59cb01' : '#8a9a9f'} 
                  />
                </TouchableOpacity>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink} onPress={() => Alert.alert('Terms of Service', 'Coming soon...')}>
                    Terms of Service
                  </Text>{' '}
                  and{' '}
                  <Text style={styles.termsLink} onPress={() => Alert.alert('Privacy Policy', 'Coming soon...')}>
                    Privacy Policy
                  </Text>
                  {' *'}
                </Text>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity 
                style={[
                  styles.signUpButton,
                  isLoading && styles.signUpButtonDisabled
                ]}
                onPress={handleSignUp}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#141f23" />
                ) : (
                  <Text style={styles.signUpButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Already have account */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2faea',
  },
  container: {
    flex: 1,
    backgroundColor: '#f2faea',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 12 : 20,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20, 31, 35, 0.05)',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: Platform.OS === 'ios' ? '800' : 'bold',
    color: '#141f23',
    letterSpacing: -0.5,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  subtitle: {
    fontSize: 16,
    color: '#8a9a9f',
    textAlign: 'center',
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    lineHeight: 22,
    paddingHorizontal: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#141f23',
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    marginBottom: 8,
    opacity: 0.9,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 31, 35, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(20, 31, 35, 0.1)',
    borderRadius: Platform.OS === 'ios' ? 10 : 8,
    paddingHorizontal: 16,
    height: 56,
  },
  inputContainerFocused: {
    borderColor: '#59cb01',
    backgroundColor: 'rgba(89, 203, 1, 0.02)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#141f23',
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    paddingVertical: 0,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  termsText: {
    fontSize: 15,
    color: '#8a9a9f',
    flex: 1,
    lineHeight: 22,
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  termsLink: {
    color: '#59cb01',
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  signUpButton: {
    backgroundColor: '#59cb01',
    paddingVertical: 16,
    borderRadius: Platform.OS === 'ios' ? 12 : 10,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#59cb01',
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'ios' ? 4 : 6,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0.3,
    shadowRadius: Platform.OS === 'ios' ? 8 : 12,
    elevation: 4,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    fontSize: 17,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: '#141f23',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#8a9a9f',
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  loginLink: {
    fontSize: 16,
    color: '#59cb01',
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
});

export default SignUpScreen;