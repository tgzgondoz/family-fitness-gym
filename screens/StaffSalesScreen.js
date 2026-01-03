import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../config/supabase";

const { width } = Dimensions.get("window");

const StaffSalesScreen = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);

  // Form State
  const [isManualClient, setIsManualClient] = useState(false);
  const [manualName, setManualName] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [saleCategory, setSaleCategory] = useState("subscription");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState("0");
  const [quantity, setQuantity] = useState("1");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: salesData } = await supabase
        .from("sales")
        .select(`*, client:users!sales_client_id_fkey(full_name)`)
        .order("created_at", { ascending: false })
        .limit(20);
      setSales(salesData || []);

      const { data: clientsData } = await supabase
        .from("users")
        .select("id, full_name")
        .eq("role", "client");
      setClients(clientsData || []);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = useMemo(() => {
    return sales.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  }, [sales]);

  const amountDue = (
    parseFloat(unitPrice || 0) * parseInt(quantity || 1)
  ).toFixed(2);

  const selectSubTier = (tier) => {
    let price = 0;
    let label = "";
    if (tier === "daily") {
      price = 2.5;
      label = "Daily Training Pass";
    } else if (tier === "monthly") {
      price = 30.0;
      label = "Monthly Subscription";
    } else if (tier === "trainer") {
      price = 50.0;
      label = "Monthly + Personal Trainer";
    }
    setDescription(label);
    setUnitPrice(price.toString());
    setQuantity("1");
  };

  const handleProcessSale = async () => {
    const finalName = isManualClient ? manualName : selectedClient?.full_name;
    const staffName =
      user?.user_metadata?.full_name || user?.email || "Authorized Staff";

    if (!finalName || !description || parseFloat(amountDue) <= 0) {
      return Alert.alert(
        "Missing Info",
        "Please check client name and pricing."
      );
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("sales").insert([
        {
          staff_id: user.id,
          client_id: isManualClient ? null : selectedClient.id,
          product_name: `${description} (x${quantity})`,
          amount: parseFloat(amountDue),
          type: saleCategory,
          payment_method: paymentMethod,
        },
      ]);

      if (error) throw error;

      const html = `
        <html>
          <body style="font-family: 'Helvetica'; padding: 20px; color: #000; line-height: 1.1; font-size: 12px;">
            <div style="border-bottom: 3px solid #000; padding-bottom: 8px; margin-bottom: 15px;">
              <h1 style="font-size: 28px; margin: 0; text-transform: uppercase;">FAMILY FITNESS GYM</h1>
              <p style="font-style: italic; font-size: 14px; margin: 2px 0;">Join the Movement</p>
              <p style="margin: 0;">Cnr Chinhoyi & Albion, 2nd Floor, Banhay Art Hse</p>
              <p style="margin: 0; font-weight: bold;">0772965774 / 0784739341</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
              <div style="background: #eee; padding: 10px; width: 50%; border-left: 4px solid #000;">
                <b style="font-size: 10px; color: #555;">CLIENT</b><br/>
                <span style="font-size: 18px;">${finalName.toUpperCase()}</span>
              </div>
              <div style="text-align: right;">
                <b>RECEIPT</b><br/>
                Date: ${new Date().toLocaleDateString("en-GB")}<br/>
                Method: ${paymentMethod}
              </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
              <tr style="background: #000; color: #fff; font-size: 10px;">
                <th style="padding: 8px; text-align: left;">DESCRIPTION</th>
                <th style="padding: 8px; text-align: center;">QTY</th>
                <th style="padding: 8px; text-align: right;">TOTAL</th>
              </tr>
              <tr>
                <td style="padding: 12px 8px; border-bottom: 1px solid #ddd;">${description}</td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #ddd; text-align: center;">${quantity}</td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">$${amountDue}</td>
              </tr>
            </table>

            <div style="text-align: right; margin-bottom: 20px;">
              <div style="background: #000; color: #fff; padding: 10px 20px; display: inline-block;">
                <span style="font-size: 22px; font-weight: bold;">PAID: $${amountDue}</span>
              </div>
            </div>

            <div style="font-size: 10px; color: #444; border-top: 1px dashed #ccc; padding-top: 10px; text-align: center;">
              <p>Issued By: ${staffName} | Powered by RecruitAI</p>
              <p style="margin-top: 5px;"><i>No refunds on gym services. Stay fit!</i></p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
      setShowNewSaleModal(false);
      resetForm();
      fetchData();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsManualClient(false);
    setManualName("");
    setSelectedClient(null);
    setDescription("");
    setUnitPrice("0");
    setQuantity("1");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* GLOSSY HEADER DASHBOARD */}
      <View style={styles.dashboardCard}>
        <View>
          <Text style={styles.dashLabel}>REVENUE SUMMARY</Text>
          <Text style={styles.dashValue}>${totalRevenue.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchData}>
          <Ionicons name="sync-outline" size={24} color="#FFD700" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Live Activity Feed</Text>
        <FlatList
          data={sales}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.saleTile}>
              <View
                style={[
                  styles.indicator,
                  {
                    backgroundColor:
                      item.type === "subscription" ? "#FFD700" : "#4CD964",
                  },
                ]}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.clientName}>
                  {item.client?.full_name || "Walk-in Guest"}
                </Text>
                <Text style={styles.saleDesc}>{item.product_name}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.salePrice}>${item.amount?.toFixed(2)}</Text>
                <Text style={styles.saleMethod}>{item.payment_method}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart-outline" size={40} color="#1e2b2f" />
              <Text style={styles.emptyText}>No sales recorded yet.</Text>
            </View>
          }
        />
      </View>

      {/* FLOATING ACTION BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowNewSaleModal(true)}
      >
        <Ionicons name="add" size={32} color="#000" />
        <Text style={styles.fabText}>SALE</Text>
      </TouchableOpacity>

      {/* ENHANCED TRANSACTION MODAL */}
      <Modal
        visible={showNewSaleModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.fullModal}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Transaction</Text>
              <TouchableOpacity onPress={() => setShowNewSaleModal(false)}>
                <Ionicons name="close-circle" size={36} color="#ff4444" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
              {/* STEP 1: CLIENT SELECT */}
              <View style={styles.stepHeader}>
                <Text style={styles.stepNum}>1</Text>
                <Text style={styles.stepLabel}>Who is paying?</Text>
                <TouchableOpacity
                  onPress={() => setIsManualClient(!isManualClient)}
                >
                  <Text style={styles.linkText}>
                    {isManualClient ? "Registered" : "Walk-in"}
                  </Text>
                </TouchableOpacity>
              </View>

              {isManualClient ? (
                <TextInput
                  style={styles.darkInput}
                  placeholder="Enter Full Name"
                  placeholderTextColor="#555"
                  value={manualName}
                  onChangeText={setManualName}
                />
              ) : (
                <View style={styles.chipGrid}>
                  {clients.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[
                        styles.userChip,
                        selectedClient?.id === c.id && styles.userChipActive,
                      ]}
                      onPress={() => setSelectedClient(c)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedClient?.id === c.id && { color: "#000" },
                        ]}
                      >
                        {c.full_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* STEP 2: DETAILS */}
              <View style={[styles.stepHeader, { marginTop: 30 }]}>
                <Text style={styles.stepNum}>2</Text>
                <Text style={styles.stepLabel}>Package & Method</Text>
              </View>

              <View style={styles.optionsRow}>
                {["daily", "monthly", "trainer"].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={styles.packageBtn}
                    onPress={() => selectSubTier(t)}
                  >
                    <Text style={styles.packageText}>{t.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.methodRow}>
                {["Cash", "EcoCash", "Swipe"].map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.methodBtn,
                      paymentMethod === m && styles.methodBtnActive,
                    ]}
                    onPress={() => setPaymentMethod(m)}
                  >
                    <Text
                      style={[
                        styles.methodText,
                        paymentMethod === m && { color: "#000" },
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={[styles.darkInput, { marginTop: 15 }]}
                placeholder="Description"
                placeholderTextColor="#555"
                value={description}
                onChangeText={setDescription}
              />

              <View style={styles.priceRow}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.miniLabel}>UNIT PRICE ($)</Text>
                  <TextInput
                    style={styles.darkInput}
                    keyboardType="numeric"
                    value={unitPrice}
                    onChangeText={setUnitPrice}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniLabel}>QTY</Text>
                  <TextInput
                    style={styles.darkInput}
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                </View>
              </View>

              {/* FOOTER ACTION */}
              <View style={styles.summaryCard}>
                <Text style={styles.sumLabel}>Total Amount Due</Text>
                <Text style={styles.sumValue}>${amountDue}</Text>
              </View>

              <TouchableOpacity
                style={styles.mainSubmitBtn}
                onPress={handleProcessSale}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <Ionicons
                      name="print-outline"
                      size={24}
                      color="#000"
                      style={{ marginRight: 10 }}
                    />
                    <Text style={styles.submitText}>FINALIZE & PRINT</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#090c0d" },
  dashboardCard: {
    margin: 20,
    backgroundColor: "#141f23",
    padding: 25,
    borderRadius: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "#FFD700",
  },
  dashLabel: {
    color: "#8a9a9f",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  dashValue: { color: "#FFD700", fontSize: 44, fontWeight: "900" },
  refreshBtn: { backgroundColor: "#1e2b2f", padding: 12, borderRadius: 15 },

  content: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    opacity: 0.8,
  },
  saleTile: {
    backgroundColor: "#141f23",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  indicator: { width: 4, height: 35, borderRadius: 2, marginRight: 15 },
  clientName: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  saleDesc: { color: "#5a6a6f", fontSize: 12, marginTop: 2 },
  salePrice: { color: "#FFD700", fontWeight: "bold", fontSize: 18 },
  saleMethod: { color: "#4a5a5f", fontSize: 10, fontWeight: "bold" },

  fab: {
    position: "absolute",
    bottom: 30,
    right: 25,
    backgroundColor: "#FFD700",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#FFD700",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  fabText: { fontWeight: "900", marginLeft: 8, fontSize: 16, letterSpacing: 1 },

  fullModal: { flex: 1, backgroundColor: "#090c0d" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#141f23",
  },
  modalTitle: { color: "#FFD700", fontSize: 24, fontWeight: "900" },
  stepHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  stepNum: {
    backgroundColor: "#FFD700",
    color: "#000",
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    fontWeight: "bold",
    marginRight: 10,
    lineHeight: 24,
  },
  stepLabel: { color: "#fff", fontSize: 16, fontWeight: "bold", flex: 1 },
  linkText: { color: "#FFD700", fontWeight: "bold" },

  darkInput: {
    backgroundColor: "#141f23",
    padding: 18,
    borderRadius: 15,
    color: "#fff",
    fontSize: 16,
    marginTop: 5,
  },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  userChip: {
    backgroundColor: "#141f23",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1e2b2f",
  },
  userChipActive: { backgroundColor: "#FFD700", borderColor: "#FFD700" },
  chipText: { color: "#8a9a9f", fontWeight: "bold" },

  optionsRow: { flexDirection: "row", gap: 10, marginBottom: 15 },
  packageBtn: {
    flex: 1,
    borderWeight: 1,
    borderColor: "#FFD700",
    borderStyle: "dashed",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  packageText: { color: "#FFD700", fontSize: 10, fontWeight: "bold" },

  methodRow: { flexDirection: "row", gap: 10 },
  methodBtn: {
    flex: 1,
    backgroundColor: "#141f23",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  methodBtnActive: { backgroundColor: "#FFD700" },
  methodText: { color: "#8a9a9f", fontWeight: "bold" },

  priceRow: { flexDirection: "row", gap: 15, marginTop: 20 },
  miniLabel: {
    color: "#4a5a5f",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },

  summaryCard: {
    backgroundColor: "#FFD70010",
    padding: 25,
    borderRadius: 25,
    marginTop: 30,
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#FFD70050",
  },
  sumLabel: { color: "#FFD700", fontSize: 12, fontWeight: "bold" },
  sumValue: { color: "#FFD700", fontSize: 40, fontWeight: "900" },

  mainSubmitBtn: {
    backgroundColor: "#FFD700",
    padding: 22,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "center",
  },
  submitText: { fontWeight: "900", fontSize: 18, letterSpacing: 1 },
  emptyState: { alignItems: "center", marginTop: 100, opacity: 0.3 },
  emptyText: { color: "#fff", marginTop: 10 },
});

export default StaffSalesScreen;
