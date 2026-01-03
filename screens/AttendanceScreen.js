import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  TextInput, Alert, ActivityIndicator, SafeAreaView,
  Dimensions, RefreshControl, Animated, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

const AttendanceScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState([]);
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const [todayDate, setTodayDate] = useState('');

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    fetchData();
    setTodayDate(new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all clients for the search list
      const { data: userData } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('role', 'client');
      setClients(userData || []);

      // Fetch today's check-ins
      const today = new Date().toISOString().split('T')[0];
      const { data: checkInData } = await supabase
        .from('check_ins')
        .select(`*, user:users(full_name)`)
        .gte('check_in_time', today)
        .order('check_in_time', { ascending: false });
      setRecentCheckIns(checkInData || []);
      setTodayCount(checkInData?.length || 0);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch attendance data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCheckIn = async (client) => {
    try {
      const { error } = await supabase
        .from('check_ins')
        .insert([{ user_id: client.id, staff_id: user.id }]);

      if (error) throw error;

      Alert.alert(
        "Check-in Successful",
        `${client.full_name} has been checked in!`,
        [{ text: 'OK', onPress: () => fetchData() }]
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleQuickCheckIn = async () => {
    Alert.prompt(
      "Quick Check-in",
      "Enter member name:",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Check In', onPress: async (name) => {
          if (name && name.trim()) {
            try {
              const { data: existingClient } = await supabase
                .from('users')
                .select('id, full_name')
                .eq('full_name', name.trim())
                .eq('role', 'client')
                .single();

              if (existingClient) {
                await handleCheckIn(existingClient);
              } else {
                Alert.alert(
                  "Member Not Found",
                  "Would you like to check in as a walk-in?",
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Check In', 
                      onPress: async () => {
                        const { error } = await supabase
                          .from('check_ins')
                          .insert([{ 
                            user_id: null, 
                            staff_id: user.id,
                            walk_in_name: name.trim()
                          }]);

                        if (error) throw error;
                        
                        Alert.alert("Success", "Walk-in check-in recorded!");
                        fetchData();
                      }
                    }
                  ]
                );
              }
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          }
        }}
      ],
      'plain-text'
    );
  };

  const filteredClients = clients.filter(c => 
    c.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const checkInTime = new Date(dateString);
    const diffMs = now - checkInTime;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 2) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading attendance data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View>
          <Text style={styles.title}>Attendance</Text>
          <Text style={styles.subtitle}>{todayDate}</Text>
        </View>
        <View style={styles.todayStats}>
          <View style={styles.statBadge}>
            <Ionicons name="people" size={16} color="#FFD700" />
            <Text style={styles.statText}>{todayCount}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Quick Actions Bar */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.quickCheckInButton}
          onPress={handleQuickCheckIn}
        >
          <Ionicons name="add-circle" size={20} color="#000" />
          <Text style={styles.quickCheckInText}>Quick Check-in</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchData}
        >
          <Ionicons name="refresh" size={20} color="#FFD700" />
        </TouchableOpacity>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8a9a9f" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search member name..."
            placeholderTextColor="#8a9a9f"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#8a9a9f" />
            </TouchableOpacity>
          )}
        </View>
        
        {search.length > 0 && (
          <View style={styles.searchResultsHeader}>
            <Text style={styles.resultsTitle}>
              {filteredClients.length} member{filteredClients.length !== 1 ? 's' : ''} found
            </Text>
            <Text style={styles.resultsHint}>Tap to check in</Text>
          </View>
        )}
      </View>

      {/* Search Results */}
      {search.length > 0 && filteredClients.length > 0 ? (
        <Animated.View 
          style={[
            styles.resultsContainer,
            { opacity: fadeAnim }
          ]}
        >
          <FlatList
            data={filteredClients}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.clientCard}
                onPress={() => handleCheckIn(item)}
                activeOpacity={0.7}
              >
                <View style={styles.clientAvatar}>
                  <Text style={styles.clientInitials}>
                    {getInitials(item.full_name)}
                  </Text>
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName} numberOfLines={1}>
                    {item.full_name}
                  </Text>
                  <Text style={styles.clientEmail} numberOfLines={1}>
                    {item.email}
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.checkInButton}
                  onPress={() => handleCheckIn(item)}
                >
                  <Ionicons name="log-in-outline" size={20} color="#FFD700" />
                  <Text style={styles.checkInButtonText}>Check In</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.resultsList}
            style={styles.resultsListContainer}
          />
        </Animated.View>
      ) : search.length > 0 ? (
        <View style={styles.noResultsContainer}>
          <Ionicons name="search-outline" size={60} color="#2c3e50" />
          <Text style={styles.noResultsText}>No members found</Text>
          <Text style={styles.noResultsSubtext}>
            Try a different search term or use quick check-in
          </Text>
        </View>
      ) : null}

      {/* Today's Check-ins Section */}
      <View style={styles.todaySection}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Today's Check-ins</Text>
            <Text style={styles.sectionSubtitle}>
              {recentCheckIns.length} member{recentCheckIns.length !== 1 ? 's' : ''} checked in today
            </Text>
          </View>
          <View style={styles.checkInCount}>
            <Text style={styles.checkInCountText}>{todayCount}</Text>
          </View>
        </View>

        <FlatList
          data={recentCheckIns}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={onRefresh}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FFD700']}
              tintColor="#FFD700"
            />
          }
          contentContainerStyle={styles.checkInList}
          ListEmptyComponent={
            <View style={styles.emptyCheckIns}>
              <Ionicons name="calendar-outline" size={60} color="#2c3e50" />
              <Text style={styles.emptyCheckInsText}>No check-ins yet today</Text>
              <Text style={styles.emptyCheckInsSubtext}>
                Start checking in members or use quick check-in
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <Animated.View 
              style={[
                styles.checkInCard,
                {
                  opacity: fadeAnim,
                  transform: [{
                    translateX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0]
                    })
                  }]
                }
              ]}
            >
              <View style={styles.checkInAvatar}>
                <Text style={styles.checkInInitials}>
                  {item.user?.full_name ? getInitials(item.user.full_name) : 'WI'}
                </Text>
              </View>
              <View style={styles.checkInDetails}>
                <Text style={styles.checkInName}>
                  {item.user?.full_name || item.walk_in_name || 'Walk-in Member'}
                </Text>
                <View style={styles.checkInMeta}>
                  <View style={styles.timeTag}>
                    <Ionicons name="time-outline" size={12} color="#8a9a9f" />
                    <Text style={styles.checkInTime}>
                      {formatTime(item.check_in_time)}
                    </Text>
                  </View>
                  <Text style={styles.checkInAgo}>
                    {getTimeAgo(item.check_in_time)}
                  </Text>
                </View>
              </View>
              <View style={styles.checkInStatus}>
                <Ionicons name="checkmark-circle" size={24} color="#59cb01" />
              </View>
            </Animated.View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c1519',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0c1519',
  },
  loadingText: {
    color: '#8a9a9f',
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#8a9a9f',
    fontSize: 14,
    marginTop: 4,
  },
  todayStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2b2f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  quickCheckInButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  quickCheckInText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    width: 50,
    height: 50,
    backgroundColor: '#1e2b2f',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2b2f',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
    marginRight: 12,
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsHint: {
    color: '#8a9a9f',
    fontSize: 12,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  resultsListContainer: {
    backgroundColor: '#1e2b2f',
    borderRadius: 16,
    padding: 4,
  },
  resultsList: {
    paddingVertical: 8,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141f23',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  clientInitials: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clientInfo: {
    flex: 1,
    marginRight: 12,
  },
  clientName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  clientEmail: {
    color: '#8a9a9f',
    fontSize: 12,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  checkInButtonText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noResultsText: {
    color: '#8a9a9f',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  noResultsSubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  todaySection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    color: '#8a9a9f',
    fontSize: 12,
    marginTop: 4,
  },
  checkInCount: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkInCountText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkInList: {
    paddingBottom: 30,
  },
  emptyCheckIns: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyCheckInsText: {
    color: '#8a9a9f',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyCheckInsSubtext: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  checkInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2b2f',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  checkInAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFD70020',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFD70040',
  },
  checkInInitials: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkInDetails: {
    flex: 1,
    marginRight: 12,
  },
  checkInName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  checkInMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141f23',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  checkInTime: {
    color: '#8a9a9f',
    fontSize: 12,
    fontWeight: '600',
  },
  checkInAgo: {
    color: '#8a9a9f',
    fontSize: 12,
  },
  checkInStatus: {
    padding: 4,
  },
});

export default AttendanceScreen;