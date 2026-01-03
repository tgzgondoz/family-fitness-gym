import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../config/supabase";
import { useAuth } from "../contexts/AuthContext";

const NotificationsScreen = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();

    // REALTIME SUBSCRIPTION
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT", // Only care about new notifications
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`, // Only listen for THIS user
        },
        (payload) => {
          console.log("New Notification:", payload.new);
          // Add the new notification to the top of the list
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setNotifications(data || []);
  };

  const markAsRead = async (id) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Alerts</Text>
        <Ionicons name="notifications-outline" size={28} color="#59cb01" />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.is_read && styles.unreadCard]}
            onPress={() => markAsRead(item.id)}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name={item.type === "payment" ? "cash" : "fitness"}
                size={24}
                color={item.is_read ? "#8a9a9f" : "#59cb01"}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifBody}>{item.message}</Text>
              <Text style={styles.notifTime}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#141f23" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },
  title: { color: "#fff", fontSize: 32, fontWeight: "900" },
  card: {
    backgroundColor: "#1e2b2f",
    padding: 15,
    borderRadius: 15,
    flexDirection: "row",
    marginBottom: 12,
  },
  unreadCard: { borderLeftWidth: 4, borderLeftColor: "#59cb01" },
  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "#141f23",
    justifyContent: "center",
    alignItems: "center",
  },
  notifTitle: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  notifBody: { color: "#8a9a9f", fontSize: 13, marginTop: 3 },
  notifTime: { color: "#4d5d62", fontSize: 10, marginTop: 8 },
});

export default NotificationsScreen;
