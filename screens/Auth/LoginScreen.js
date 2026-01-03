// screens/Auth/LoginScreen.js (Updated version)
import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const [isLoading, setIsLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  const { login } = useAuth();

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
  }, []);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email or username');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setIsLoading(true);
    
    const result = await login(email, password);
    
    setIsLoading(false);
    
    if (result.success) {
      // Login successful - navigation handled by auth state
    } else {
      Alert.alert('Login Failed', result.error || 'Invalid credentials');
    }
  };

  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
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
            {/* Back Button - REMOVED or DISABLED since Splash screen might not be in stack */}
            {/* If you want to keep back navigation, use goBack() instead */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}  // Changed from navigate('Splash') to goBack()
              activeOpacity={0.7}
            >
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color="#f2faea" 
                style={{ opacity: 0.9 }}
              />
            </TouchableOpacity>

            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue your fitness journey</Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email or Username</Text>
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
                    placeholder="Enter your email or username"
                    placeholderTextColor="#8a9a9f"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    selectionColor="#59cb01"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Password</Text>
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
                    placeholder="Enter your password"
                    placeholderTextColor="#8a9a9f"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize="none"
                    autoCorrect={false}
                    selectionColor="#59cb01"
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
                
                {/* Forgot Password */}
                <TouchableOpacity 
                  style={styles.forgotPassword}
                  onPress={() => navigation.navigate('ForgotPassword')}
                  disabled={isLoading}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#141f23" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login (Optional) */}
              <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButton} disabled={isLoading}>
                  <Ionicons name="logo-apple" size={20} color="#f2faea" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.socialButton} disabled={isLoading}>
                  <Ionicons name="logo-google" size={20} color="#f2faea" />
                </TouchableOpacity>
              </View>

              {/* Sign Up Link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('SignUp')}
                  activeOpacity={0.7}
                  disabled={isLoading}
                >
                  <Text style={styles.signupLink}>Sign Up</Text>
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
    backgroundColor: '#141f23',
  },
  container: {
    flex: 1,
    backgroundColor: '#141f23',
  },
  scrollContent: {
    flexGrow: 1,
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
    backgroundColor: 'rgba(242, 250, 234, 0.1)',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.08,
    marginBottom: 40,
  },
  logoImage: {
    width: 100,
    height: 100,
    tintColor: '#f2faea',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: Platform.OS === 'ios' ? '800' : 'bold',
    color: '#f2faea',
    letterSpacing: -0.5,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    textAlign: 'center',
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
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    color: '#f2faea',
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    marginBottom: 8,
    opacity: 0.9,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 250, 234, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(242, 250, 234, 0.1)',
    borderRadius: Platform.OS === 'ios' ? 12 : 10,
    paddingHorizontal: 16,
    height: 56,
  },
  inputContainerFocused: {
    borderColor: '#59cb01',
    backgroundColor: 'rgba(89, 203, 1, 0.05)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#f2faea',
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    paddingVertical: 0,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  forgotPasswordText: {
    fontSize: 15,
    color: '#59cb01',
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  loginButton: {
    backgroundColor: '#59cb01',
    paddingVertical: 16,
    borderRadius: Platform.OS === 'ios' ? 14 : 12,
    marginTop: 8,
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#59cb01',
    shadowOffset: {
      width: 0,
      height: Platform.OS === 'ios' ? 4 : 6,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0.4,
    shadowRadius: Platform.OS === 'ios' ? 12 : 16,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: Platform.OS === 'ios' ? '700' : 'bold',
    color: '#141f23',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(242, 250, 234, 0.1)',
  },
  dividerText: {
    fontSize: 14,
    color: '#8a9a9f',
    fontWeight: Platform.OS === 'ios' ? '500' : '600',
    marginHorizontal: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 40,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: Platform.OS === 'ios' ? 28 : 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(242, 250, 234, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(242, 250, 234, 0.1)',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  signupText: {
    fontSize: 16,
    color: '#8a9a9f',
    fontWeight: Platform.OS === 'ios' ? '400' : 'normal',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  signupLink: {
    fontSize: 16,
    color: '#59cb01',
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  },
});

export default LoginScreen;