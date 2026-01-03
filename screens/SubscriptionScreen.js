import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../config/supabase";

const { width } = Dimensions.get("window");

const SubscriptionScreen = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Define Plans strictly as requested
  const plans = [
    {
      id: "daily",
      name: "Daily Pass",
      price: 2.5,
      duration: "24 Hours",
      color: "#36a1d6",
      features: ["Full Gym Access", "Locker Room", "Valid 24h"],
    },
    {
      id: "monthly",
      name: "Monthly Basic",
      price: 30.0,
      duration: "30 Days",
      color: "#59cb01",
      features: ["Unlimited Access", "Free WiFi", "Locker"],
    },
    {
      id: "trainer",
      name: "Monthly + Trainer",
      price: 50.0,
      duration: "30 Days",
      color: "#ffd93d",
      features: ["Personal Trainer", "Diet Plan", "All Equipment"],
      isPopular: true,
    },
  ];

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setSubscription(data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSubscription();
    setRefreshing(false);
  };

  const handlePaymentPortal = (plan) => {
    // This is where you will trigger EcoCash/Paynow API
    Alert.alert(
      "Payment Method",
      `Pay $${plan.price.toFixed(2)} for ${plan.name}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Notify Staff",
          onPress: () => processSubscription(plan),
        },
      ]
    );
  };

  const processSubscription = async (plan) => {
    setLoading(true);
    try {
      const startDate = new Date();
      const endDate = new Date();

      if (plan.id === "daily") {
        endDate.setDate(endDate.getDate() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      // 1. Insert Subscription (Becomes active immediately)
      const { data: subData, error: subError } = await supabase
        .from("subscriptions")
        .insert([
          {
            user_id: user.id,
            subscription_type: plan.id,
            amount: plan.price,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            status: "active",
          },
        ])
        .select()
        .single();

      if (subError) throw subError;

      // 2. Create Sale Record (Manager/Receptionist see this on their dashboard)
      await supabase.from("sales").insert([
        {
          client_id: user.id,
          sale_type: "subscription",
          amount: plan.price,
          product_name: plan.name,
          payment_status: "completed",
          subscription_id: subData.id,
        },
      ]);

      setSubscription(subData);
      Alert.alert(
        "Success",
        `Payment processed! Your ${plan.name} is now active.`
      );
    } catch (error) {
      Alert.alert("Error", "Payment failed to sync with database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#59cb01"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Membership</Text>
          <Text style={styles.headerSubtitle}>
            Upgrade your fitness journey
          </Text>
        </View>

        {/* ACTIVE SUBSCRIPTION STATUS */}
        <View style={styles.statusSection}>
          <View style={styles.statusCard}>
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>YOUR STATUS</Text>
              <Text
                style={[
                  styles.statusValue,
                  { color: subscription ? "#59cb01" : "#ff6b6b" },
                ]}
              >
                {subscription ? "Active Member" : "No Active Plan"}
              </Text>
            </View>
            <View
              style={[
                styles.statusIcon,
                {
                  backgroundColor: subscription
                    ? "rgba(89, 203, 1, 0.1)"
                    : "rgba(255, 107, 107, 0.1)",
                },
              ]}
            >
              <Ionicons
                name={subscription ? "shield-checkmark" : "close-circle"}
                size={28}
                color={subscription ? "#59cb01" : "#ff6b6b"}
              />
            </View>
          </View>
        </View>

        {/* PLANS SECTION */}
        <View style={styles.plansContainer}>
          <Text style={styles.sectionTitle}>Available Plans</Text>

          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={styles.premiumCard}
              onPress={() => handlePaymentPortal(plan)}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View>
                    <View style={styles.row}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      {plan.isPopular && (
                        <View style={styles.popularBadge}>
                          <Text style={styles.popularText}>BEST VALUE</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.planDuration}>{plan.duration}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.currency}>$</Text>
                    <Text style={styles.priceText}>
                      {plan.price.toFixed(2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.featuresWrapper}>
                  {plan.features.map((f, i) => (
                    <View key={i} style={styles.featurePill}>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color={plan.color}
                      />
                      <Text style={styles.featurePillText}>{f}</Text>
                    </View>
                  ))}
                </View>

                <View
                  style={[styles.actionButton, { backgroundColor: plan.color }]}
                >
                  <Text style={styles.actionButtonText}>SELECT PLAN</Text>
                  <Ionicons name="chevron-forward" size={18} color="#141f23" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#141f23" },
  header: { padding: 24, paddingTop: 20 },
  headerTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "#f2faea",
    letterSpacing: -1,
  },
  headerSubtitle: { fontSize: 14, color: "#8a9a9f", fontWeight: "500" },

  statusSection: { paddingHorizontal: 24, marginBottom: 30 },
  statusCard: {
    backgroundColor: "#1e2b2f",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  statusInfo: { flex: 1 },
  statusLabel: {
    color: "#8a9a9f",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  statusValue: { fontSize: 20, fontWeight: "bold", marginTop: 4 },
  statusIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  plansContainer: { paddingHorizontal: 20 },
  sectionTitle: {
    color: "#f2faea",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 20,
    marginLeft: 4,
  },

  premiumCard: {
    backgroundColor: "#1e2b2f",
    borderRadius: 28,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  cardContent: { padding: 20 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  row: { flexDirection: "row", alignItems: "center" },
  planName: { color: "#f2faea", fontSize: 22, fontWeight: "900" },
  popularBadge: {
    backgroundColor: "#ffd93d",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 10,
  },
  popularText: { color: "#141f23", fontSize: 9, fontWeight: "900" },
  planDuration: { color: "#8a9a9f", fontSize: 13, marginTop: 4 },
  priceContainer: { flexDirection: "row", alignItems: "flex-start" },
  currency: {
    color: "#59cb01",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
    marginRight: 2,
  },
  priceText: { color: "#f2faea", fontSize: 32, fontWeight: "900" },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginVertical: 18,
  },

  featuresWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  featurePillText: {
    color: "#f2faea",
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 6,
  },

  actionButton: {
    height: 56,
    borderRadius: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionButtonText: {
    color: "#141f23",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});

export default SubscriptionScreen;
