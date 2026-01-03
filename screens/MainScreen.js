import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../config/supabase";
import { useFocusEffect } from "@react-navigation/native";

const MainScreen = ({ navigation }) => {
  const { user, logout, isManager, isStaff } = useAuth();
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

      // 1. Get Real Workout Count from check_ins table
      const { count: workoutCount, error: countError } = await supabase
        .from("check_ins")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // 2. Get Latest Subscription for Expiry and Plan name
      const { data: latestSale } = await supabase
        .from("sales")
        .select("created_at, product_name")
        .eq("client_id", user.id)
        .eq("type", "subscription")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Logic for Expiry (30 days from purchase)
      let expiryStr = "Expired/None";
      if (latestSale) {
        const date = new Date(latestSale.created_at);
        date.setDate(date.getDate() + 30);
        expiryStr = date.toLocaleDateString("en-GB");
      }

      setStats({
        workouts: workoutCount || 0,
        hours: Math.round((workoutCount || 0) * 1.5), // Assume 1.5h per session
        calories: (workoutCount || 0) * 500, // Assume 500 kcal per session
        achievements: Math.floor((workoutCount || 0) / 5), // 1 trophy every 5 visits
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

  // Auto-refresh when screen comes into focus
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
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <View style={styles.avatarContainer}>
              {user?.profile_image ? (
                <Image
                  source={{ uri: user.profile_image }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {user?.full_name?.charAt(0)}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{user?.full_name}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Ionicons name="log-out-outline" size={24} color="#ff6b6b" />
          </TouchableOpacity>
        </View>

        {/* Membership Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Gym Access</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: stats.expiryDate.includes("/")
                    ? "#59cb01"
                    : "#ff4444",
                },
              ]}
            >
              <Text style={styles.statusText}>
                {stats.expiryDate.includes("/") ? "ACTIVE" : "INACTIVE"}
              </Text>
            </View>
          </View>

          <View style={styles.statusDetails}>
            <View style={styles.statusItem}>
              <Ionicons name="calendar-outline" size={20} color="#8a9a9f" />
              <Text style={styles.statusLabel}>Expires:</Text>
              <Text style={styles.statusValue}>{stats.expiryDate}</Text>
            </View>
            <View style={styles.statusItem}>
              <Ionicons name="fitness-outline" size={20} color="#8a9a9f" />
              <Text style={styles.statusLabel}>Plan:</Text>
              <Text style={styles.statusValue}>{stats.planName}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.renewButton}
            onPress={() => navigation.navigate("Subscription")}
          >
            <Text style={styles.renewButtonText}>Manage Subscription</Text>
            <Ionicons name="arrow-forward" size={18} color="#141f23" />
          </TouchableOpacity>
        </View>

        {/* Progress Section */}
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="walk" size={28} color="#59cb01" />
            <Text style={styles.statNumber}>{stats.workouts}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={28} color="#007AFF" />
            <Text style={styles.statNumber}>{stats.hours}h</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={28} color="#FF3B30" />
            <Text style={styles.statNumber}>
              {stats.calories.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Kcal Burned</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={28} color="#FFD700" />
            <Text style={styles.statNumber}>{stats.achievements}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>

        {/* Staff/Manager Quick Actions */}
        {(isStaff() || isManager()) && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Management</Text>
            <View style={styles.buttonGrid}>
              <TouchableOpacity
                style={[styles.gridButton, { backgroundColor: "#FFD700" }]}
                onPress={() => navigation.navigate("Attendance")}
              >
                <Ionicons name="people" size={30} color="#141f23" />
                <Text style={[styles.gridButtonText, { color: "#141f23" }]}>
                  Check-In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.gridButton,
                  {
                    backgroundColor: "#1e2b2f",
                    borderWidth: 1,
                    borderColor: "#59cb01",
                  },
                ]}
                onPress={() => navigation.navigate("Sales")}
              >
                <Ionicons name="cart" size={30} color="#59cb01" />
                <Text style={[styles.gridButtonText, { color: "#59cb01" }]}>
                  Record Sale
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Member Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <View style={styles.buttonGrid}>
            <TouchableOpacity
              style={[styles.gridButton, { backgroundColor: "#007AFF" }]}
              onPress={() => navigation.navigate("EcoCashPayment")}
            >
              <Ionicons name="phone-portrait" size={28} color="#fff" />
              <Text style={styles.gridButtonText}>EcoCash Pay</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.gridButton, { backgroundColor: "#5856D6" }]}
              onPress={() => navigation.navigate("Notifications")}
            >
              <Ionicons name="notifications" size={28} color="#fff" />
              <Text style={styles.gridButtonText}>Alerts</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#141f23" },
  container: { flex: 1, paddingHorizontal: 20 },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 25,
  },
  profileButton: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatarPlaceholder: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#59cb01",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 22, fontWeight: "bold", color: "#141f23" },
  profileInfo: { marginLeft: 15 },
  greeting: { color: "#8a9a9f", fontSize: 12 },
  userName: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  roleBadge: {
    backgroundColor: "rgba(89, 203, 1, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    marginTop: 4,
  },
  roleText: { color: "#59cb01", fontSize: 10, fontWeight: "bold" },
  logoutButton: { padding: 10 },
  statusCard: {
    backgroundColor: "#1e2b2f",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  cardTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: "#141f23", fontWeight: "bold", fontSize: 10 },
  statusDetails: { marginBottom: 15 },
  statusItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  statusLabel: { color: "#8a9a9f", marginLeft: 10, width: 70 },
  statusValue: { color: "#fff", fontWeight: "600" },
  renewButton: {
    backgroundColor: "#59cb01",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  renewButtonText: { fontWeight: "bold", color: "#141f23" },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#1e2b2f",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 12,
  },
  statNumber: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 5,
  },
  statLabel: { color: "#8a9a9f", fontSize: 12 },
  sectionContainer: { marginBottom: 20 },
  buttonGrid: { flexDirection: "row", justifyContent: "space-between" },
  gridButton: {
    width: "48%",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    gap: 10,
  },
  gridButtonText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
});

export default MainScreen;
