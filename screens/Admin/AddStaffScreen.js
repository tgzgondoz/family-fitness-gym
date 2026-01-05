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
  SafeAreaView,
  StatusBar
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
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Add Staff Member</Text>
              <Text style={styles.headerSubtitle}>Create a new staff account</Text>
            </View>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput 
                style={styles.input}
                placeholder="Enter full name"
                placeholderTextColor="#8a9a9f"
                value={form.fullName}
                onChangeText={(text) => setForm({...form, fullName: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput 
                style={styles.input}
                placeholder="staff@example.com"
                placeholderTextColor="#8a9a9f"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(text) => setForm({...form, email: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Temporary Password</Text>
              <TextInput 
                style={styles.input}
                placeholder="Create a strong password"
                placeholderTextColor="#8a9a9f"
                secureTextEntry
                value={form.password}
                onChangeText={(text) => setForm({...form, password: text})}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>System Role</Text>
              <View style={styles.roleContainer}>
                {['staff', 'manager'].map((role) => (
                  <TouchableOpacity 
                    key={role}
                    style={[styles.roleButton, form.role === role && styles.roleButtonActive]}
                    onPress={() => setForm({...form, role: role})}
                  >
                    <Ionicons 
                      name={role === 'manager' ? 'shield' : 'person'} 
                      size={18} 
                      color={form.role === role ? '#141f23' : '#59cb01'} 
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
  safeArea: { 
    flex: 1, 
    backgroundColor: '#141f23' 
  },
  scrollContent: { 
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 15,
    marginBottom: 20,
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
  form: { 
    gap: 24 
  },
  inputGroup: { 
    gap: 8 
  },
  label: { 
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  input: { 
    backgroundColor: '#1e2b2f', 
    borderRadius: 12, 
    padding: 16, 
    color: '#f2faea',
    fontSize: 16,
  },
  roleContainer: { 
    flexDirection: 'row', 
    gap: 12 
  },
  roleButton: { 
    flex: 1, 
    flexDirection: 'row',
    padding: 14, 
    borderRadius: 12, 
    backgroundColor: '#1e2b2f', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleButtonActive: { 
    backgroundColor: '#59cb01' 
  },
  roleText: { 
    fontSize: 14,
    fontWeight: '600',
    color: '#59cb01' 
  },
  roleTextActive: { 
    color: '#141f23' 
  },
  submitButton: { 
    backgroundColor: '#59cb01', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: { 
    fontSize: 16,
    fontWeight: 'bold',
    color: '#141f23' 
  }
});

export default AddStaffScreen;