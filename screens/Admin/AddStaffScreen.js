// screens/Admin/AddStaffScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const AddStaffScreen = ({ navigation }) => {
  const { addStaffMember, user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'staff' 
  });

  const handleAddStaff = async () => {
    if (!form.fullName || !form.email || !form.password) {
      Alert.alert("Required Fields", "Please fill in all fields to create the account.");
      return;
    }

    try {
      setLoading(true);
      const result = await addStaffMember(form, user.id);
      
      if (result.success) {
        Alert.alert("Success", "Account created successfully!", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      Alert.alert("Error", "Check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button & Title */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#f2faea" />
            </TouchableOpacity>
            <Text style={styles.title}>New Staff</Text>
            <Text style={styles.subtitle}>Fill in details to grant access</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput 
                style={styles.input}
                placeholder="e.g. Tendai Moyo"
                placeholderTextColor="#5a6a6f"
                value={form.fullName}
                onChangeText={(text) => setForm({...form, fullName: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput 
                style={styles.input}
                placeholder="staff@recruitai.com"
                placeholderTextColor="#5a6a6f"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(text) => setForm({...form, email: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>TEMPORARY PASSWORD</Text>
              <TextInput 
                style={styles.input}
                placeholder="Create a strong password"
                placeholderTextColor="#5a6a6f"
                secureTextEntry
                value={form.password}
                onChangeText={(text) => setForm({...form, password: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>SELECT SYSTEM ROLE</Text>
              <View style={styles.roleContainer}>
                {['staff', 'manager'].map((role) => (
                  <TouchableOpacity 
                    key={role}
                    style={[styles.roleOption, form.role === role && styles.roleActive]}
                    onPress={() => setForm({...form, role: role})}
                  >
                    <Ionicons 
                      name={role === 'manager' ? 'shield-checkmark' : 'person'} 
                      size={18} 
                      color={form.role === role ? '#141f23' : '#8a9a9f'} 
                      style={{marginRight: 8}}
                    />
                    <Text style={[styles.roleText, form.role === role && styles.roleTextActive]}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, loading && { opacity: 0.7 }]} 
              onPress={handleAddStaff}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#141f23" />
              ) : (
                <Text style={styles.submitText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#141f23' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  header: { marginBottom: 32 },
  backBtn: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#f2faea', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#8a9a9f', marginTop: 4 },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { color: '#59cb01', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  input: { 
    backgroundColor: '#1e2b2f', 
    borderRadius: 12, 
    padding: 16, 
    color: '#f2faea',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  roleContainer: { flexDirection: 'row', gap: 12 },
  roleOption: { 
    flex: 1, 
    flexDirection: 'row',
    padding: 14, 
    borderRadius: 12, 
    backgroundColor: '#1e2b2f', 
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  roleActive: { backgroundColor: '#59cb01', borderColor: '#59cb01' },
  roleText: { color: '#8a9a9f', fontWeight: 'bold', fontSize: 14 },
  roleTextActive: { color: '#141f23' },
  submitButton: { 
    backgroundColor: '#59cb01', 
    padding: 18, 
    borderRadius: 14, 
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#59cb01',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5
  },
  submitText: { color: '#141f23', fontWeight: 'bold', fontSize: 17 }
});

export default AddStaffScreen;