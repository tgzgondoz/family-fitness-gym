import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../config/supabase";
import { useFocusEffect } from "@react-navigation/native";

const MainScreen = ({ navigation }) => {
  const { user, isManager, isStaff } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    workouts: 0,
    hours: 0,
    calories: 0,
    achievements: 0,
    expiryDate: "N/A",
    planName: "No Active Plan",
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const { count: workoutCount } = await supabase
        .from("check_ins")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { data: latestSale } = await supabase
        .from("sales")
        .select("created_at, product_name")
        .eq("client_id", user.id)
        .eq("type", "subscription")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      let expiryStr = "Expired/None";
      if (latestSale) {
        const date = new Date(latestSale.created_at);
        date.setDate(date.getDate() + 30);
        expiryStr = date.toLocaleDateString("en-GB");
      }

      setStats({
        workouts: workoutCount || 0,
        hours: Math.round((workoutCount || 0) * 1.5),
        calories: (workoutCount || 0) * 500,
        achievements: Math.floor((workoutCount || 0) / 5),
        expiryDate: expiryStr,
        planName: latestSale?.product_name || "No Active Plan",
      });
    } catch (error) {
      console.log("Stats fetch error:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#59cb01"
          />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.full_name}</Text>
            <View style={styles.roleContainer}>
              <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <View style={styles.avatarContainer}>
              {user?.profile_image ? (
                <Image
                  source={{ uri: user.profile_image }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {user?.full_name?.charAt(0)}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Membership Card - SIMPLIFIED */}
        <View style={styles.membershipCard}>
          <View style={styles.membershipHeader}>
            <View>
              <Text style={styles.membershipTitle}>ACTIVE MEMBERSHIP</Text>
              <Text style={styles.planName}>{stats.planName}</Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: stats.expiryDate.includes("/") ? "#59cb01" : "#FF4444" }
            ]}>
              <Text style={styles.statusText}>
                {stats.expiryDate.includes("/") ? "ACTIVE" : "EXPIRED"}
              </Text>
            </View>
          </View>
          
          <View style={styles.membershipDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={18} color="#8a9a9f" />
              <Text style={styles.detailLabel}>Expires</Text>
              <Text style={styles.detailValue}>{stats.expiryDate}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={18} color="#8a9a9f" />
              <Text style={styles.detailLabel}>Check-ins</Text>
              <Text style={styles.detailValue}>{stats.workouts} sessions</Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate("Subscription")}
            >
              <Ionicons name="card" size={20} color="#141f23" />
              <Text style={styles.primaryButtonText}>Manage Plan</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate("EcoCashPayment")}
            >
              <Ionicons name="phone-portrait" size={20} color="#59cb01" />
              <Text style={styles.secondaryButtonText}>EcoCash Pay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        <Text style={styles.sectionTitle}>Fitness Progress</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(89, 203, 1, 0.1)' }]}>
              <Ionicons name="barbell" size={24} color="#59cb01" />
            </View>
            <Text style={styles.statNumber}>{stats.workouts}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(0, 122, 255, 0.1)' }]}>
              <Ionicons name="time" size={24} color="#007AFF" />
            </View>
            <Text style={styles.statNumber}>{stats.hours}h</Text>
            <Text style={styles.statLabel}>Hours</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255, 68, 68, 0.1)' }]}>
              <Ionicons name="flame" size={24} color="#FF4444" />
            </View>
            <Text style={styles.statNumber}>
              {(stats.calories / 1000).toFixed(1)}k
            </Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
            </View>
            <Text style={styles.statNumber}>{stats.achievements}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>

        {/* Management Actions - SIMPLIFIED */}
        {(isStaff() || isManager()) && (
          <View style={styles.managementSection}>
            <Text style={styles.sectionTitle}>Management Tools</Text>
            <View style={styles.managementGrid}>
              <TouchableOpacity 
                style={styles.managementItem}
                onPress={() => navigation.navigate("Attendance")}
              >
                <Ionicons name="people" size={28} color="#FFD700" />
                <Text style={styles.managementText}>Check-ins</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.managementItem}
                onPress={() => navigation.navigate("Sales")}
              >
                <Ionicons name="cart" size={28} color="#59cb01" />
                <Text style={styles.managementText}>Sales</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
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
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    marginTop: 10,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#8a9a9f',
    fontWeight: '500',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  roleContainer: {
    backgroundColor: 'rgba(89, 203, 1, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: '#59cb01',
    fontSize: 12,
    fontWeight: '600',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1e2b2f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#59cb01',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  // Membership Card - SIMPLIFIED
  membershipCard: {
    backgroundColor: '#1e2b2f',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  membershipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  membershipTitle: {
    fontSize: 12,
    color: '#8a9a9f',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#141f23',
    fontSize: 12,
    fontWeight: 'bold',
  },
  membershipDetails: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#8a9a9f',
    marginLeft: 10,
    marginRight: 8,
    width: 80,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#59cb01',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#141f23',
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(89, 203, 1, 0.1)',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#59cb01',
    fontWeight: '600',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#1e2b2f',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#8a9a9f',
    fontWeight: '500',
  },
  managementSection: {
    marginBottom: 30,
  },
  managementGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  // Management Items - SIMPLIFIED
  managementItem: {
    flex: 1,
    backgroundColor: '#1e2b2f',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  managementText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 8,
  },
});

export default MainScreen;