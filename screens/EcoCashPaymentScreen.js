import React, { useState } from 'react';
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header - Hidden as requested */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>EcoCash Payment</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => setShowInstructions(true)}
        >
          <Ionicons name="information-circle-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Amount Display */}
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>${amount || '50'}</Text>
          <Text style={styles.plan}>{subscriptionType || 'monthly'} plan</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#8a9a9f"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              maxLength={10}
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="EcoCash Number"
              placeholderTextColor="#8a9a9f"
              keyboardType="phone-pad"
              value={ecocashNumber}
              onChangeText={setEcocashNumber}
              maxLength={10}
            />
          </View>

          <View style={styles.inputGroup}>
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

        {/* Nothing after the button - all text removed as requested */}
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
              <Text style={styles.modalTitle}>How to Pay</Text>
              <TouchableOpacity onPress={() => setShowInstructions(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>Dial *151# on EcoCash line</Text>
              </View>
              
              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>Select "Send Money"</Text>
              </View>
              
              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>Merchant: 0773 456 789</Text>
              </View>
              
              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={styles.stepText}>Amount: ${amount || '50'}</Text>
              </View>
              
              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>5</Text>
                </View>
                <Text style={styles.stepText}>Reference: FAMILYFITNESS</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowInstructions(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2faea',
  },
  header: {
    backgroundColor: '#141f23',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  infoButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  amount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#141f23',
    marginBottom: 8,
  },
  plan: {
    fontSize: 16,
    color: '#8a9a9f',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: '#141f23',
    borderWidth: 1,
    borderColor: '#e5e7eb',
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