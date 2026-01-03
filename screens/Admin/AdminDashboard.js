// screens/AdminDashboard.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BarChart, PieChart, LineChart } from "react-native-chart-kit";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../config/supabase";

const { width } = Dimensions.get("window");

const AdminDashboard = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  // 1. Chart Data matching your brand theme
  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [8500, 9200, 10500, 11200, 12850, 13500],
        color: (opacity = 1) => `rgba(89, 203, 1, ${opacity})`,
      },
    ],
  };

  const membershipData = [
    {
      name: "Monthly",
      population: 68,
      color: "#59cb01",
      legendFontColor: "#f2faea",
    },
    {
      name: "Quarterly",
      population: 22,
      color: "#36a1d6",
      legendFontColor: "#f2faea",
    },
    {
      name: "Annual",
      population: 10,
      color: "#ff6b6b",
      legendFontColor: "#f2faea",
    },
  ];

  // 2. Functional Actions for Testing
  const handleResetPassword = (email) => {
    Alert.alert("Security", `Send reset link to ${email}?`, [
      { text: "Cancel" },
      {
        text: "Send",
        onPress: () => Alert.alert("Sent", "Reset email triggered."),
      },
    ]);
  };

  const handleRenew = (name) => {
    Alert.alert("Subscription", `Renew subscription for ${name}?`, [
      { text: "Cancel" },
      {
        text: "Confirm",
        onPress: () => Alert.alert("Success", "Subscription updated."),
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#59cb01" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header - Dynamically shows your Admin Email */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Manager Portal</Text>
            <Text style={styles.date}>{user?.email || "Admin Account"}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color="#ff6b6b" />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            {
              label: "Active Members",
              value: "245",
              icon: "people",
              color: "#59cb01",
            },
            {
              label: "Monthly Rev",
              value: "$12.8k",
              icon: "cash",
              color: "#36a1d6",
            },
          ].map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: `${stat.color}20` },
                ]}
              >
                <Ionicons name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Manager Quick Actions - Linked to your schema roles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management Tools</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Admin")} // Matches your Tab name in App.js
            >
              <Ionicons name="person-add" size={24} color="#59cb01" />
              <Text style={styles.actionLabel}>Add Staff</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                Alert.alert("Coming Soon", "Client Management module.")
              }
            >
              <Ionicons name="people-circle" size={24} color="#36a1d6" />
              <Text style={styles.actionLabel}>Manage Clients</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Revenue Line Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Revenue Trend (USD)</Text>
          <LineChart
            data={revenueData}
            width={width - 40}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Member Renewals List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Renewals</Text>
          <View style={styles.list}>
            {[
              { name: "John Doe", plan: "Monthly", email: "john@gmail.com" },
              { name: "Sarah S.", plan: "Annual", email: "sarah@gmail.com" },
            ].map((item, index) => (
              <View key={index} style={styles.listItem}>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSub}>{item.plan}</Text>
                </View>
                <View style={styles.row}>
                  <TouchableOpacity
                    onPress={() => handleResetPassword(item.email)}
                    style={styles.iconBtn}
                  >
                    <Ionicons name="key-outline" size={18} color="#ffd93d" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRenew(item.name)}
                    style={styles.renewBtn}
                  >
                    <Text style={styles.renewText}>Renew</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Membership Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membership Split</Text>
          <PieChart
            data={membershipData}
            width={width - 40}
            height={150}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Chart Shared Config
const chartConfig = {
  backgroundGradientFrom: "#1e2b2f",
  backgroundGradientTo: "#1e2b2f",
  color: (opacity = 1) => `rgba(89, 203, 1, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(242, 250, 234, ${opacity})`,
  decimalPlaces: 0,
  propsForDots: { r: "4", strokeWidth: "2", stroke: "#59cb01" },
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#141f23" },
  container: { flex: 1, paddingHorizontal: 20 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#141f23",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },
  greeting: { fontSize: 24, fontWeight: "bold", color: "#f2faea" },
  date: { fontSize: 13, color: "#8a9a9f", marginTop: 4 },
  logoutBtn: {
    padding: 8,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 10,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#1e2b2f",
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: { fontSize: 20, fontWeight: "bold", color: "#f2faea" },
  statLabel: { fontSize: 12, color: "#8a9a9f" },
  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f2faea",
    marginBottom: 15,
  },
  actionsGrid: { flexDirection: "row", gap: 12 },
  actionButton: {
    flex: 1,
    backgroundColor: "#1e2b2f",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  actionLabel: {
    color: "#f2faea",
    fontSize: 12,
    marginTop: 8,
    fontWeight: "600",
  },
  chartCard: {
    backgroundColor: "#1e2b2f",
    padding: 15,
    borderRadius: 16,
    marginBottom: 25,
  },
  chart: { borderRadius: 16, marginLeft: -15 },
  list: { backgroundColor: "#1e2b2f", borderRadius: 12, overflow: "hidden" },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  itemName: { color: "#f2faea", fontSize: 15, fontWeight: "600" },
  itemSub: { color: "#8a9a9f", fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  iconBtn: {
    padding: 8,
    backgroundColor: "rgba(255, 217, 61, 0.1)",
    borderRadius: 8,
    marginRight: 8,
  },
  renewBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(89, 203, 1, 0.1)",
    borderRadius: 8,
  },
  renewText: { color: "#59cb01", fontSize: 12, fontWeight: "bold" },
});

export default AdminDashboard;
