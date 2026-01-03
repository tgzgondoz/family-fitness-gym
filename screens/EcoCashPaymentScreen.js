import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

const EcoCashPaymentScreen = ({ route, navigation }) => {
  const { user } = useAuth();
  const { amount, subscriptionType } = route.params || {};
  const [phoneNumber, setPhoneNumber] = useState('');
  const [ecocashNumber, setEcocashNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState('');

  const handlePayment = async () => {
    if (!phoneNumber || !ecocashNumber || !pin) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (pin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }

    setLoading(true);

    try {
      // Simulate EcoCash payment (in real app, integrate with EcoCash API)
      // For demo purposes, we'll simulate a successful payment
      
      // Generate payment reference
      const paymentReference = `ECOCASH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create payment record
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert([{
          user_id: user.id,
          amount: amount || 50, // Default to monthly if not specified
          payment_method: 'ecocash',
          payment_reference: paymentReference,
          status: 'completed',
          phone_number: phoneNumber,
          ecocash_number: ecocashNumber,
        }])
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Update user subscription
      const endDate = new Date();
      if (subscriptionType === 'daily') {
        endDate.setDate(endDate.getDate() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      const { data: subscriptionData, error: subError } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: user.id,
          subscription_type: subscriptionType || 'monthly',
          amount: amount || 50,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          status: 'active',
          payment_method: 'ecocash',
          payment_reference: paymentReference,
        }])
        .select()
        .single();

      if (subError) throw subError;

      // Update user record
      const { error: userError } = await supabase
        .from('users')
        .update({
          subscription_type: subscriptionType || 'monthly',
          subscription_end_date: endDate.toISOString(),
        })
        .eq('id', user.id);

      if (userError) throw userError;

      Alert.alert(
        'Payment Successful!',
        `Your payment of $${amount || 50} has been processed. Reference: ${paymentReference}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Subscription'),
          },
        ]
      );

    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Payment Failed', 'Please try again or contact support');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Ionicons name="phone-portrait-outline" size={64} color="#59cb01" />
          <Text style={styles.headerTitle}>EcoCash Payment</Text>
          <Text style={styles.headerSubtitle}>
            Pay ${amount || '50'} for {subscriptionType || 'monthly'} subscription
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="0772 123 456"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={10}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EcoCash Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="wallet-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="0778 987 654"
                keyboardType="phone-pad"
                value={ecocashNumber}
                onChangeText={setEcocashNumber}
                maxLength={10}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EcoCash PIN</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter 4-digit PIN"
                keyboardType="number-pad"
                secureTextEntry
                value={pin}
                onChangeText={setPin}
                maxLength={4}
              />
            </View>
            <Text style={styles.hintText}>Enter your EcoCash mobile money PIN</Text>
          </View>

          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Amount to Pay</Text>
            <Text style={styles.amountValue}>${amount || '50.00'}</Text>
          </View>

          <TouchableOpacity
            style={styles.payButton}
            onPress={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.payButtonText}>Processing...</Text>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.payButtonText}>Confirm Payment</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
            <Text style={styles.securityText}>
              Your payment is secure. We never store your PIN.
            </Text>
          </View>

          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>Payment Steps:</Text>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>Dial *151# on your EcoCash line</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>Select "Send Money"</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>Enter our merchant number: 0773 456 789</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>4</Text>
              <Text style={styles.stepText}>Enter amount: ${amount || '50'}</Text>
            </View>
            <View style={styles.step}>
              <Text style={styles.stepNumber}>5</Text>
              <Text style={styles.stepText}>Enter reference: FAMILYFITNESS</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#141f23',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 8,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },
  amountCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#59cb01',
    marginVertical: 20,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#59cb01',
  },
  payButton: {
    backgroundColor: '#59cb01',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  securityText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  stepsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#59cb01',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
});

export default EcoCashPaymentScreen;