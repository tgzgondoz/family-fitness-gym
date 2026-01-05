import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../config/supabase";
import { useAuth } from "../contexts/AuthContext";

const NotificationsScreen = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();

    // REALTIME SUBSCRIPTION
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("New Notification:", payload.new);
          setNotifications((prev) => [payload.new, ...prev]);
          // Update unread count
          if (!payload.new.is_read) {
            setUnreadCount(prev => prev + 1);
          }
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
    
    // Calculate unread count
    const unread = (data || []).filter(n => !n.is_read).length;
    setUnreadCount(unread);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (id) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(
      notifications.map((n) => {
        if (n.id === id) {
          if (!n.is_read) {
            setUnreadCount(prev => prev - 1);
          }
          return { ...n, is_read: true };
        }
        return n;
      })
    );
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds);
    
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (id) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications(notifications.filter(n => n.id !== id));
    // Update unread count if needed
    const deletedNotif = notifications.find(n => n.id === id);
    if (deletedNotif && !deletedNotif.is_read) {
      setUnreadCount(prev => prev - 1);
    }
  };

  const getFilteredNotifications = () => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "unread") return notifications.filter(n => !n.is_read);
    return notifications.filter(n => n.type === activeFilter);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "payment":
        return { name: "card-outline", color: "#4CAF50" };
      case "workout":
        return { name: "barbell-outline", color: "#FF9800" };
      case "achievement":
        return { name: "trophy-outline", color: "#FFD700" };
      case "reminder":
        return { name: "alarm-outline", color: "#2196F3" };
      case "system":
        return { name: "cog-outline", color: "#9C27B0" };
      default:
        return { name: "notifications-outline", color: "#59cb01" };
    }
  };

  const formatTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="notifications-off-outline" size={60} color="#4d5d62" />
      </View>
      <Text style={styles.emptyTitle}>No notifications yet</Text>
      <Text style={styles.emptyText}>
        When you get notifications, they'll appear here
      </Text>
    </View>
  );

  const renderNotification = ({ item }) => {
    const icon = getNotificationIcon(item.type);
    
    return (
      <TouchableOpacity
        style={[
          styles.card,
          !item.is_read && styles.unreadCard,
          { opacity: item.is_read ? 0.8 : 1 }
        ]}
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
            <Ionicons name={icon.name} size={22} color={icon.color} />
          </View>
          
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={[styles.notifTitle, !item.is_read && styles.unreadTitle]}>
                {item.title}
              </Text>
              {!item.is_read && <View style={styles.unreadDot} />}
            </View>
            
            <Text style={styles.notifBody} numberOfLines={2}>
              {item.message}
            </Text>
            
            <View style={styles.footerRow}>
              <Text style={styles.notifTime}>
                {formatTime(item.created_at)}
              </Text>
              <Text style={styles.notifType}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteNotification(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-outline" size={20} color="#8a9a9f" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            {unreadCount > 0 
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={markAllAsRead}
            >
              <Ionicons name="checkmark-done-outline" size={20} color="#59cb01" />
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {["all", "unread", "payment", "workout"].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              activeFilter === filter && styles.activeFilterTab,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.activeFilterText,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
            {filter === "unread" && unreadCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications List */}
      <FlatList
        data={getFilteredNotifications()}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          getFilteredNotifications().length === 0 && styles.emptyListContent
        ]}
        renderItem={renderNotification}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#59cb01"
            colors={["#59cb01"]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c1519",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1e2b2f",
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#8a9a9f",
    fontSize: 14,
    marginTop: 4,
    fontWeight: "500",
  },
  headerActions: {
    position: "absolute",
    right: 20,
    top: 30,
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e2b2f",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  markAllText: {
    color: "#59cb01",
    fontSize: 13,
    fontWeight: "600",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1e2b2f",
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1e2b2f",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activeFilterTab: {
    backgroundColor: "#59cb01",
  },
  filterText: {
    color: "#8a9a9f",
    fontSize: 14,
    fontWeight: "600",
  },
  activeFilterText: {
    color: "#141f23",
  },
  filterBadge: {
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "700",
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#1e2b2f",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#59cb01",
  },
  cardContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  notifTitle: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: "700",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#59cb01",
    marginLeft: 8,
  },
  notifBody: {
    color: "#b0b8bb",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notifTime: {
    color: "#4d5d62",
    fontSize: 12,
    fontWeight: "500",
  },
  notifType: {
    color: "#8a9a9f",
    fontSize: 11,
    fontWeight: "600",
    backgroundColor: "#141f23",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1e2b2f",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyText: {
    color: "#8a9a9f",
    fontSize: 14,
    textAlign: "center",
    maxWidth: 250,
    lineHeight: 20,
  },
});

export default NotificationsScreen;