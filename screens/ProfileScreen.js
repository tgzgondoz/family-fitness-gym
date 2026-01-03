// screens/ProfileScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone_number: user?.phone_number || '',
    email: user?.email || '',
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.full_name.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }

    if (!formData.phone_number.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    setLoading(true);
    const result = await updateProfile({
      full_name: formData.full_name,
      phone_number: formData.phone_number,
    });

    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } else {
      Alert.alert('Error', result.error || 'Failed to update profile');
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'manager':
        return 'shield-outline';
      case 'staff':
        return 'people-outline';
      default:
        return 'person-outline';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#f2faea" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons
              name={isEditing ? 'close-outline' : 'create-outline'}
              size={24}
              color="#59cb01"
            />
          </TouchableOpacity>
        </View>

        {/* Profile Image */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            {user?.profile_image ? (
              <Image source={{ uri: user.profile_image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.cameraButton}>
              <Ionicons name="camera-outline" size={20} color="#141f23" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Role Badge */}
        <View style={styles.roleContainer}>
          <Ionicons name={getRoleIcon()} size={20} color="#59cb01" />
          <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'CLIENT'}</Text>
        </View>

        {/* Profile Form */}
        <View style={styles.formContainer}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.full_name}
                onChangeText={(text) =>
                  setFormData({ ...formData, full_name: text })
                }
                placeholder="Enter your full name"
                placeholderTextColor="#8a9a9f"
              />
            ) : (
              <Text style={styles.value}>{user?.full_name || 'Not set'}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email || 'Not set'}</Text>
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={formData.phone_number}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone_number: text })
                }
                placeholder="Enter your phone number"
                placeholderTextColor="#8a9a9f"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.value}>{user?.phone_number || 'Not set'}</Text>
            )}
          </View>

          {/* Account Status */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Status</Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: user?.is_active ? '#59cb01' : '#ff6b6b' },
                ]}
              />
              <Text style={styles.statusText}>
                {user?.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>

          {/* Membership Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Membership Type</Text>
            <Text style={styles.value}>Monthly Plan</Text>
          </View>

          {/* Save Button */}
          {isEditing && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#141f23" />
              ) : (
                <>
                  <Ionicons name="checkmark-outline" size={20} color="#141f23" />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Coming Soon', 'Change password feature coming soon!')}
          >
            <Ionicons name="lock-closed-outline" size={24} color="#59cb01" />
            <Text style={styles.actionButtonText}>Change Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#007AFF" />
            <Text style={styles.actionButtonText}>Notification Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Coming Soon', 'Privacy settings coming soon!')}
          >
            <Ionicons name="shield-outline" size={24} color="#5856D6" />
            <Text style={styles.actionButtonText}>Privacy & Security</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Alert.alert('Coming Soon', 'Help & support coming soon!')}
          >
            <Ionicons name="help-circle-outline" size={24} color="#FF9500" />
            <Text style={styles.actionButtonText}>Help & Support</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ff6b6b" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(242, 250, 234, 0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f2faea',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(89, 203, 1, 0.1)',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#59cb01',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#141f23',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#59cb01',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#141f23',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(89, 203, 1, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 30,
    gap: 8,
  },
  roleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#59cb01',
  },
  formContainer: {
    backgroundColor: 'rgba(242, 250, 234, 0.05)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(242, 250, 234, 0.1)',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#8a9a9f',
    marginBottom: 8,
    fontWeight: '600',
  },
  value: {
    fontSize: 18,
    color: '#f2faea',
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(20, 31, 35, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(242, 250, 234, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    color: '#f2faea',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 18,
    color: '#f2faea',
    fontWeight: '500',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#59cb01',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#141f23',
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(242, 250, 234, 0.05)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(242, 250, 234, 0.1)',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f2faea',
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingVertical: 18,
    borderRadius: 14,
    gap: 12,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
});

export default ProfileScreen;