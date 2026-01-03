import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../config/supabase"; // Ensure this matches your path

const { width } = Dimensions.get("window");

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState("month");
  const [transactions, setTransactions] = useState([]);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    newSubscriptions: 0,
    totalClients: 0,
  });

  const [revenueData, setRevenueData] = useState({
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ data: [0, 0, 0, 0, 0, 0] }],
  });

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Total Clients Count
      const { count: clientCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // 2. Fetch Active (Users with push tokens)
      const { count: activeCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .not('expo_push_token', 'is', null);

      // 3. Fetch Total Revenue from Payments
      const { data: revenueRows } = await supabase
        .from('payments')
        .select('amount');

      const totalRev = revenueRows?.reduce((sum, row) => sum + Number(row.amount), 0) || 0;

      // 4. Fetch Recent Transactions with User Email
      const { data: recentTx, error: txError } = await supabase
        .from('payments')
        .select(`
          amount,
          created_at,
          user_id
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      // 5. Simulated Trend Data for Chart based on real total
      // In a real production app, you'd use the 'monthly_revenue' view we discussed
      const chartValues = [totalRev * 0.4, totalRev * 0.6, totalRev * 0.7, totalRev * 0.85, totalRev * 0.9, totalRev];

      setStats({
        totalRevenue: totalRev,
        activeSubscriptions: activeCount || 0,
        newSubscriptions: Math.floor((activeCount || 0) / 4), // Placeholder for demo
        totalClients: clientCount || 0,
      });

      setTransactions(recentTx || []);
      
      setRevenueData({
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [{
          data: chartValues.map(v => v > 0 ? v : 0),
          color: (opacity = 1) => `rgba(89, 203, 1, ${opacity})`,
        }],
      });

    } catch (error) {
      console.error("Dashboard Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, icon, color, trend }) => (
    <View style={styles.statCardWrapper}>
      <View style={styles.statCard}>
        <View style={[styles.statIconCircle, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {trend && (
          <View style={styles.trendBox}>
            <Ionicons name="trending-up" size={12} color="#59cb01" />
            <Text style={styles.trendText}>{trend}%</Text>
          </View>
        )}
      </View>
    </View>
  );

  const chartConfig = {
    backgroundGradientFrom: "#1e2b2f",
    backgroundGradientTo: "#1e2b2f",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(89, 203, 1, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(138, 154, 159, ${opacity})`,
    propsForDots: { r: "4", strokeWidth: "2", stroke: "#59cb01" },
    style: { borderRadius: 16 },
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.safeArea, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color="#59cb01" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.topHeader}>
        <View>
          <Text style={styles.headerTitle}>Family Fitness</Text>
          <Text style={styles.headerSubtitle}>Analytics Overview</Text>
        </View>
        <View style={styles.selector}>
          {["week", "month", "year"].map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setTimeRange(r)}
              style={[styles.selBtn, timeRange === r && styles.selBtnActive]}
            >
              <Text style={[styles.selText, timeRange === r && styles.selTextActive]}>
                {r.charAt(0).toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollBody}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#59cb01" />}
      >
        <View style={styles.statsGrid}>
          <StatCard title="Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon="cash" color="#59cb01" trend="12" />
          <StatCard title="Active" value={stats.activeSubscriptions} icon="people" color="#36a1d6" trend="5" />
          <StatCard title="New" value={stats.newSubscriptions} icon="person-add" color="#ffd93d" />
          <StatCard title="Total" value={stats.totalClients} icon="id-card" color="#ff6b6b" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Revenue Trend</Text>
          <LineChart
            data={revenueData}
            width={width - 48}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Transactions</Text>
          {transactions.length > 0 ? (
            transactions.map((tx, i) => (
              <View key={i} style={styles.activityRow}>
                <View style={styles.activityIcon}>
                  <Ionicons name="receipt-outline" size={18} color="#59cb01" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actName}>EcoCash Payment</Text>
                  <Text style={styles.actDate}>{new Date(tx.created_at).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.actAmount}>+${tx.amount}</Text>
              </View>
            ))
          ) : (
            <Text style={{color: '#8a9a9f', textAlign: 'center', padding: 20}}>No payments found.</Text>
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#141f23" },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#141f23",
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#f2faea" },
  headerSubtitle: { fontSize: 13, color: "#8a9a9f" },
  selector: {
    flexDirection: "row",
    backgroundColor: "#1e2b2f",
    borderRadius: 12,
    padding: 4,
  },
  selBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  selBtnActive: { backgroundColor: "#59cb01" },
  selText: { color: "#8a9a9f", fontSize: 12, fontWeight: "700" },
  selTextActive: { color: "#141f23" },
  scrollBody: { paddingHorizontal: 16 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 10 },
  statCardWrapper: { width: "50%", padding: 8 },
  statCard: {
    backgroundColor: "#1e2b2f",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: { fontSize: 20, fontWeight: "bold", color: "#f2faea" },
  statTitle: { fontSize: 12, color: "#8a9a9f", marginTop: 2 },
  trendBox: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  trendText: {
    color: "#59cb01",
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#1e2b2f",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardTitle: {
    color: "#f2faea",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  chart: { marginLeft: -16, borderRadius: 16 },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.03)",
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(89, 203, 1, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actName: { color: "#f2faea", fontSize: 14, fontWeight: "600" },
  actDate: { color: "#8a9a9f", fontSize: 11 },
  actAmount: { color: "#59cb01", fontWeight: "bold", fontSize: 14 },
});

export default DashboardScreen;
