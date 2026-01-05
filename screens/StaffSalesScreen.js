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

      {/* Revenue Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Sales Dashboard</Text>
          <Text style={styles.headerSubtitle}>Track and process sales</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchData}>
          <Ionicons name="sync" size={24} color="#59cb01" />
        </TouchableOpacity>
      </View>

      {/* Revenue Summary */}
      <View style={styles.revenueSection}>
        <Text style={styles.revenueLabel}>Total Revenue</Text>
        <Text style={styles.revenueValue}>${totalRevenue.toFixed(2)}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Recent Sales</Text>
        <FlatList
          data={sales}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.saleItem}>
              <View style={styles.saleInfo}>
                <Text style={styles.clientName}>
                  {item.client?.full_name || "Walk-in Guest"}
                </Text>
                <Text style={styles.saleDescription}>{item.product_name}</Text>
                <Text style={styles.saleMethod}>{item.payment_method}</Text>
              </View>
              <View style={styles.saleAmount}>
                <Text style={styles.salePrice}>${item.amount?.toFixed(2)}</Text>
                <Text style={styles.saleType}>{item.type}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="bar-chart" size={40} color="#8a9a9f" />
              <Text style={styles.emptyText}>No sales recorded yet</Text>
            </View>
          }
        />
      </View>

      {/* Add Sale Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowNewSaleModal(true)}
      >
        <Ionicons name="add" size={24} color="#141f23" />
        <Text style={styles.addButtonText}>New Sale</Text>
      </TouchableOpacity>

      {/* New Sale Modal */}
      <Modal
        visible={showNewSaleModal}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Sale</Text>
            <TouchableOpacity onPress={() => setShowNewSaleModal(false)}>
              <Ionicons name="close" size={24} color="#ff6b6b" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* Client Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Client</Text>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setIsManualClient(!isManualClient)}
              >
                <Text style={styles.toggleText}>
                  {isManualClient ? "Select Registered Client" : "Add Walk-in Client"}
                </Text>
              </TouchableOpacity>
              
              {isManualClient ? (
                <TextInput
                  style={styles.input}
                  placeholder="Client Name"
                  placeholderTextColor="#8a9a9f"
                  value={manualName}
                  onChangeText={setManualName}
                />
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.clientsContainer}>
                    {clients.map((client) => (
                      <TouchableOpacity
                        key={client.id}
                        style={[
                          styles.clientButton,
                          selectedClient?.id === client.id && styles.clientButtonActive
                        ]}
                        onPress={() => setSelectedClient(client)}
                      >
                        <Text style={[
                          styles.clientButtonText,
                          selectedClient?.id === client.id && styles.clientButtonTextActive
                        ]}>
                          {client.full_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>

            {/* Subscription Tiers */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Package</Text>
              <View style={styles.tierContainer}>
                {["daily", "monthly", "trainer"].map((tier) => (
                  <TouchableOpacity
                    key={tier}
                    style={styles.tierButton}
                    onPress={() => selectSubTier(tier)}
                  >
                    <Text style={styles.tierText}>{tier.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Payment Method</Text>
              <View style={styles.paymentContainer}>
                {["Cash", "EcoCash", "Swipe"].map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.paymentButton,
                      paymentMethod === method && styles.paymentButtonActive
                    ]}
                    onPress={() => setPaymentMethod(method)}
                  >
                    <Text style={[
                      styles.paymentText,
                      paymentMethod === method && styles.paymentTextActive
                    ]}>
                      {method}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.input}
                placeholder="Sale description"
                placeholderTextColor="#8a9a9f"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Price and Quantity */}
            <View style={styles.priceContainer}>
              <View style={styles.priceInput}>
                <Text style={styles.inputLabel}>Unit Price ($)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={unitPrice}
                  onChangeText={setUnitPrice}
                />
              </View>
              <View style={styles.priceInput}>
                <Text style={styles.inputLabel}>Quantity</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>
            </View>

            {/* Total Amount */}
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>${amountDue}</Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleProcessSale}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#141f23" />
              ) : (
                <>
                  <Ionicons name="print" size={20} color="#141f23" />
                  <Text style={styles.submitText}>Process & Print Receipt</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141f23',
  },
  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  refreshButton: {
    padding: 8,
  },
  // Revenue Section
  revenueSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  revenueLabel: {
    fontSize: 14,
    color: '#8a9a9f',
    fontWeight: '600',
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#59cb01',
  },
  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  // Sale Items
  saleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2b2f',
  },
  saleInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  saleDescription: {
    fontSize: 14,
    color: '#8a9a9f',
    marginBottom: 4,
  },
  saleMethod: {
    fontSize: 12,
    color: '#59cb01',
    fontWeight: '500',
  },
  saleAmount: {
    alignItems: 'flex-end',
  },
  salePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#59cb01',
    marginBottom: 4,
  },
  saleType: {
    fontSize: 12,
    color: '#8a9a9f',
    textTransform: 'capitalize',
  },
  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#59cb01',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#141f23',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8a9a9f',
    marginTop: 10,
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#141f23',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2b2f',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalContent: {
    padding: 20,
  },
  // Input Groups
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1e2b2f',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFF',
  },
  // Toggle Button
  toggleButton: {
    backgroundColor: 'rgba(89, 203, 1, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#59cb01',
  },
  // Clients Container
  clientsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  clientButton: {
    backgroundColor: '#1e2b2f',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clientButtonActive: {
    backgroundColor: '#59cb01',
  },
  clientButtonText: {
    fontSize: 14,
    color: '#8a9a9f',
    fontWeight: '600',
  },
  clientButtonTextActive: {
    color: '#141f23',
  },
  // Tier Container
  tierContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tierButton: {
    flex: 1,
    backgroundColor: '#1e2b2f',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  tierText: {
    fontSize: 12,
    color: '#59cb01',
    fontWeight: '600',
  },
  // Payment Container
  paymentContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentButton: {
    flex: 1,
    backgroundColor: '#1e2b2f',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  paymentButtonActive: {
    backgroundColor: '#59cb01',
  },
  paymentText: {
    fontSize: 14,
    color: '#8a9a9f',
    fontWeight: '600',
  },
  paymentTextActive: {
    color: '#141f23',
  },
  // Price Container
  priceContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInput: {
    flex: 1,
  },
  // Total Container
  totalContainer: {
    backgroundColor: 'rgba(89, 203, 1, 0.1)',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: '#59cb01',
    fontWeight: '600',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#59cb01',
  },
  // Submit Button
  submitButton: {
    backgroundColor: '#59cb01',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
  },
  submitText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#141f23',
  },
});

export default StaffSalesScreen;