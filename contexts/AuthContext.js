// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

// Demo users for development
const DEMO_USERS = {
  // Admin user (Shumba)
  'shumba': {
    email: 'admin@familyfitness.com',
    password: 'familyfitness26',
    full_name: 'Shumba Admin',
    phone_number: '+263771234567',
    role: 'manager',
    is_active: true,
    profile_image: null
  },
  // Staff user
  'staff@familyfitness.com': {
    email: 'staff@familyfitness.com',
    password: 'password123',
    full_name: 'Demo Staff',
    phone_number: '+263770000001',
    role: 'staff',
    is_active: true,
    profile_image: null
  },
  // Client user
  'client@familyfitness.com': {
    email: 'client@familyfitness.com',
    password: 'password123',
    full_name: 'Demo Client',
    phone_number: '+263770000002',
    role: 'client',
    is_active: true,
    profile_image: null
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStoredUser();
  }, []);

  const checkStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('familyfitness_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  const storeUser = async (userData) => {
    try {
      await AsyncStorage.setItem('familyfitness_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error storing user:', error);
    }
  };

  const removeStoredUser = async () => {
    try {
      await AsyncStorage.removeItem('familyfitness_user');
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  // Helper function to get or create user in database
  const getOrCreateUserInDB = async (authUser, role = 'client', addedBy = null) => {
    try {
      // First, check if user exists in database
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!fetchError && existingUser) {
        return existingUser;
      }

      // User doesn't exist, create new user in database
      const newUser = {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
        phone_number: authUser.user_metadata?.phone_number || '+26377XXXXXXX',
        role: role,
        profile_image: authUser.user_metadata?.avatar_url || null,
        is_active: true,
        added_by: addedBy,
        created_at: new Date().toISOString()
      };

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (createError) {
        console.error('Error creating user in database:', createError);
        // Return the user data we tried to create
        return newUser;
      }

      return createdUser;
    } catch (error) {
      console.error('Error in getOrCreateUserInDB:', error);
      return {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
        role: role,
        is_active: true
      };
    }
  };

  const login = async (emailOrUsername, password) => {
    try {
      setLoading(true);
      
      const input = emailOrUsername.toLowerCase().trim();
      
      // Check if it's a demo user
      let demoUser = null;
      if (input === 'shumba') {
        demoUser = DEMO_USERS['shumba'];
      } else if (input === 'staff@familyfitness.com') {
        demoUser = DEMO_USERS['staff@familyfitness.com'];
      } else if (input === 'client@familyfitness.com') {
        demoUser = DEMO_USERS['client@familyfitness.com'];
      }
      
      if (demoUser && password === demoUser.password) {
        // Demo user login
        const userObj = {
          id: `demo-${demoUser.role}-${Date.now()}`,
          email: demoUser.email,
          full_name: demoUser.full_name,
          phone_number: demoUser.phone_number,
          role: demoUser.role,
          is_active: demoUser.is_active,
          profile_image: demoUser.profile_image,
          is_demo: true
        };
        
        setUser(userObj);
        await storeUser(userObj);
        return { success: true };
      }

      // Regular Supabase login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.includes('@') ? input : `${input}@familyfitness.com`,
        password,
      });

      if (error) {
        // Check if user doesn't exist
        if (error.message.includes('Invalid login credentials')) {
          return { 
            success: false, 
            error: 'Invalid email or password. Please check your credentials.' 
          };
        }
        throw error;
      }

      // Successfully logged in, get or create user profile
      const userProfile = await getOrCreateUserInDB(data.user);
      
      setUser(userProfile);
      await storeUser(userProfile);
      
      return { success: true };
      
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email before logging in';
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData) => {
    try {
      setLoading(true);
      
      // Validate role - only managers can create staff/manager accounts
      if ((userData.role === 'staff' || userData.role === 'manager') && userData.role !== 'client') {
        return { 
          success: false, 
          error: 'Staff and manager accounts can only be created by existing managers.' 
        };
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            phone_number: userData.phone,
            avatar_url: null
          }
        }
      });

      if (authError) {
        if (authError.message.includes('User already registered')) {
          return { 
            success: false, 
            error: 'This email is already registered. Please use a different email or log in.' 
          };
        }
        throw authError;
      }

      // Create user in database
      const newUser = {
        id: authData.user.id,
        email: userData.email,
        full_name: userData.fullName,
        phone_number: userData.phone,
        role: 'client', // Always default to client for self-signup
        is_active: true,
        profile_image: null,
        added_by: null, // Self-signup
        created_at: new Date().toISOString()
      };

      const { error: dbError } = await supabase
        .from('users')
        .insert([newUser]);

      if (dbError) {
        console.error('Database insert error:', dbError);
        // Continue anyway, user was created in auth
      }

      // Auto-login after signup
      setUser(newUser);
      await storeUser(newUser);
      
      return { 
        success: true,
        message: 'Account created successfully! Please check your email for verification.'
      };
      
    } catch (error) {
      console.error('Signup error:', error);
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.message.includes('password')) {
        errorMessage = 'Password must be at least 6 characters';
      } else if (error.message.includes('email')) {
        errorMessage = 'Please enter a valid email address';
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // For managers to add staff members
  const addStaffMember = async (staffData, managerId) => {
    try {
      setLoading(true);
      
      // Create staff in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: staffData.email,
        password: staffData.password,
        options: {
          data: {
            full_name: staffData.fullName,
            phone_number: staffData.phone,
            avatar_url: null
          }
        }
      });

      if (authError) throw authError;

      // Create staff in database
      const newStaff = {
        id: authData.user.id,
        email: staffData.email,
        full_name: staffData.fullName,
        phone_number: staffData.phone,
        role: staffData.role,
        is_active: true,
        profile_image: null,
        added_by: managerId,
        created_at: new Date().toISOString()
      };

      const { error: dbError } = await supabase
        .from('users')
        .insert([newStaff]);

      if (dbError) throw dbError;

      return { 
        success: true, 
        message: `${staffData.role} account created successfully!` 
      };
      
    } catch (error) {
      console.error('Add staff error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to create staff account' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local storage
      await removeStoredUser();
      setUser(null);
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      // Update in Supabase database
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await storeUser(updatedUser);

      return { success: true };
      
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    signUp,
    logout,
    updateProfile,
    addStaffMember,
    getUserRole: () => user?.role || 'client',
    isAdmin: () => user?.email === 'admin@familyfitness.com' || user?.role === 'manager',
    isManager: () => user?.role === 'manager',
    isStaff: () => user?.role === 'staff',
    isClient: () => user?.role === 'client',
    canAddStaff: () => user?.role === 'manager',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);