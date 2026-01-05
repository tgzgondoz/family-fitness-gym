import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  SafeAreaView,
  StatusBar,
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
  const [showInstructions, setShowInstructions] = useState(false);

  // Hide the default header
  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);

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
      const paymentReference = `ECOCASH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert([{
          user_id: user.id,
          amount: amount || 50,
          payment_method: 'ecocash',
          payment_reference: paymentReference,
          status: 'completed',
          phone_number: phoneNumber,
          ecocash_number: ecocashNumber,
        }])
        .select()
        .single();

      if (paymentError) throw paymentError;

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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Professional Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>EcoCash Payment</Text>
            <Text style={styles.headerSubtitle}>
              Complete your payment securely
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => setShowInstructions(true)}
            >
              <Ionicons name="information-circle" size={24} color="#59cb01" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Amount Display with Icon */}
          <View style={styles.amountContainer}>
            <View style={styles.amountIconContainer}>
              <Ionicons name="cash" size={40} color="#59cb01" />
            </View>
            <Text style={styles.amount}>${amount || '50'}</Text>
            <View style={styles.planBadge}>
              <Text style={styles.plan}>{subscriptionType || 'monthly'} plan</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#8a9a9f"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  maxLength={10}
                />
                {phoneNumber ? (
                  <TouchableOpacity onPress={() => setPhoneNumber('')} style={styles.clearIcon}>
                    <Ionicons name="close-circle" size={20} color="#8a9a9f" />
                  </TouchableOpacity>
                ) : (
                  <Ionicons name="call" size={20} color="#8a9a9f" style={styles.inputRightIcon} />
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.input}
                  placeholder="EcoCash Number"
                  placeholderTextColor="#8a9a9f"
                  keyboardType="phone-pad"
                  value={ecocashNumber}
                  onChangeText={setEcocashNumber}
                  maxLength={10}
                />
                {ecocashNumber ? (
                  <TouchableOpacity onPress={() => setEcocashNumber('')} style={styles.clearIcon}>
                    <Ionicons name="close-circle" size={20} color="#8a9a9f" />
                  </TouchableOpacity>
                ) : (
                  <Ionicons name="card" size={20} color="#8a9a9f" style={styles.inputRightIcon} />
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={styles.input}
                  placeholder="PIN"
                  placeholderTextColor="#8a9a9f"
                  keyboardType="number-pad"
                  secureTextEntry
                  value={pin}
                  onChangeText={setPin}
                  maxLength={4}
                />
                {pin ? (
                  <TouchableOpacity onPress={() => setPin('')} style={styles.clearIcon}>
                    <Ionicons name="close-circle" size={20} color="#8a9a9f" />
                  </TouchableOpacity>
                ) : (
                  <Ionicons name="lock-closed" size={20} color="#8a9a9f" style={styles.inputRightIcon} />
                )}
              </View>
            </View>

            {/* Confirm Payment Button */}
            <TouchableOpacity
              style={[styles.payButton, loading && styles.payButtonDisabled]}
              onPress={handlePayment}
              disabled={loading}
            >
              <Text style={styles.payButtonText}>
                {loading ? 'Processing...' : 'Confirm Payment'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Instructions Modal */}
        <Modal
          visible={showInstructions}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowInstructions(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>How to Pay with EcoCash</Text>
                <TouchableOpacity onPress={() => setShowInstructions(false)}>
                  <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>Dial *151# on your EcoCash registered line</Text>
                </View>
                
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>Choose "Send Money" from the menu options</Text>
                </View>
                
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>Enter merchant number: 0773 456 789</Text>
                </View>
                
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <Text style={styles.stepText}>Enter amount: ${amount || '50'}</Text>
                </View>
                
                <View style={styles.instructionStep}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>5</Text>
                  </View>
                  <Text style={styles.stepText}>Enter reference: FAMILYFITNESS</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowInstructions(false)}
              >
                <Text style={styles.modalCloseText}>Got It</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0c1519",
  },
  container: {
    flex: 1,
    backgroundColor: '#141f23',
  },
  // Professional Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#141f23',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: "#8a9a9f",
    fontSize: 14,
    marginTop: 4,
    fontWeight: "500",
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  amountIconContainer: {
    backgroundColor: 'rgba(89, 203, 1, 0.1)',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  amount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  planBadge: {
    backgroundColor: '#59cb01',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  plan: {
    fontSize: 14,
    color: '#141f23',
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#1e2b2f',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: '#FFF',
  },
  inputRightIcon: {
    position: 'absolute',
    right: 20,
  },
  clearIcon: {
    position: 'absolute',
    right: 20,
  },
  payButton: {
    backgroundColor: '#59cb01',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#141f23',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e2b2f',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2d3a3f',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalBody: {
    padding: 20,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#59cb01',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#141f23',
  },
  stepText: {
    fontSize: 16,
    color: '#FFF',
    flex: 1,
  },
  modalCloseButton: {
    backgroundColor: '#59cb01',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#141f23',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default EcoCashPaymentScreen;