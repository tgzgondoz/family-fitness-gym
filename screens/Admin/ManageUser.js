import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
  FlatList,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ManageUser = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    membership: 'all',
    sortBy: 'newest'
  });

  // Sample user data
  const [users, setUsers] = useState([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 234 567 8900',
      membership: 'Premium Monthly',
      status: 'active',
      joinDate: '2024-11-15',
      lastVisit: '2024-12-16',
      avatarColor: '#59cb01'
    },
    {
      id: '2',
      name: 'Sarah Smith',
      email: 'sarah@example.com',
      phone: '+1 234 567 8901',
      membership: 'Annual Gold',
      status: 'active',
      joinDate: '2024-10-20',
      lastVisit: '2024-12-15',
      avatarColor: '#36a1d6'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+1 234 567 8902',
      membership: 'Basic Quarterly',
      status: 'inactive',
      joinDate: '2024-09-05',
      lastVisit: '2024-11-30',
      avatarColor: '#ff6b6b'
    },
    {
      id: '4',
      name: 'Emily Wilson',
      email: 'emily@example.com',
      phone: '+1 234 567 8903',
      membership: 'Premium Monthly',
      status: 'active',
      joinDate: '2024-12-01',
      lastVisit: '2024-12-16',
      avatarColor: '#ffd93d'
    },
    {
      id: '5',
      name: 'Robert Brown',
      email: 'robert@example.com',
      phone: '+1 234 567 8904',
      membership: 'Annual Platinum',
      status: 'pending',
      joinDate: '2024-12-17',
      lastVisit: null,
      avatarColor: '#9d4edd'
    },
    {
      id: '6',
      name: 'Lisa Taylor',
      email: 'lisa@example.com',
      phone: '+1 234 567 8905',
      membership: 'Monthly Basic',
      status: 'active',
      joinDate: '2024-11-28',
      lastVisit: '2024-12-15',
      avatarColor: '#00bbf9'
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#59cb01';
      case 'inactive': return '#ff6b6b';
      case 'pending': return '#ffd93d';
      default: return '#8a9a9f';
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleDeleteUser = (userId) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setUsers(users.filter(user => user.id !== userId));
            setSelectedUsers(prev => prev.filter(id => id !== userId));
          }
        }
      ]
    );
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) {
      Alert.alert('No Selection', 'Please select users first');
      return;
    }

    if (action === 'delete') {
      Alert.alert(
        'Delete Users',
        `Delete ${selectedUsers.length} selected users?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              setUsers(users.filter(user => !selectedUsers.includes(user.id)));
              setSelectedUsers([]);
            }
          }
        ]
      );
    } else if (action === 'activate') {
      Alert.alert('Success', `${selectedUsers.length} users activated`);
      setSelectedUsers([]);
    }
  };

  const renderUserCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.userCard,
        selectedUsers.includes(item.id) && styles.selectedCard
      ]}
      onPress={() => handleSelectUser(item.id)}
      onLongPress={() => handleSelectUser(item.id)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
          <Text style={styles.avatarText}>
            {item.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => Alert.alert(
            'User Actions',
            'Choose an action',
            [
              { text: 'View Details', onPress: () => navigation.navigate('UserDetails', { userId: item.id }) },
              { text: 'Edit User', onPress: () => navigation.navigate('EditUser', { userId: item.id }) },
              { text: 'Send Message', onPress: () => {} },
              { text: 'Delete', style: 'destructive', onPress: () => handleDeleteUser(item.id) },
              { text: 'Cancel', style: 'cancel' }
            ]
          )}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#8a9a9f" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="call" size={16} color="#8a9a9f" />
          <Text style={styles.detailText}>{item.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="card" size={16} color="#8a9a9f" />
          <Text style={styles.detailText}>{item.membership}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#8a9a9f" />
          <Text style={styles.detailText}>Joined: {item.joinDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Manage Members</Text>
            <Text style={styles.headerSubtitle}>{users.length} total members</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddMember')}
          >
            <Ionicons name="add" size={24} color="#141f23" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#8a9a9f" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search members..."
            placeholderTextColor="#8a9a9f"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="filter" size={20} color="#59cb01" />
          </TouchableOpacity>
        </View>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <View style={styles.bulkContainer}>
            <Text style={styles.selectedCount}>
              {selectedUsers.length} selected
            </Text>
            <View style={styles.bulkButtons}>
              <TouchableOpacity
                style={styles.bulkButton}
                onPress={() => handleBulkAction('activate')}
              >
                <Ionicons name="checkmark-circle" size={16} color="#59cb01" />
                <Text style={styles.bulkButtonText}>Activate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bulkButton}
                onPress={() => handleBulkAction('delete')}
              >
                <Ionicons name="trash" size={16} color="#ff6b6b" />
                <Text style={styles.bulkButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bulkButton}
                onPress={() => setSelectedUsers([])}
              >
                <Text style={styles.bulkButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Users List */}
        <View style={styles.usersContainer}>
          <FlatList
            data={users}
            renderItem={renderUserCard}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(89, 203, 1, 0.1)' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#59cb01" />
            </View>
            <View>
              <Text style={styles.statValue}>
                {users.filter(u => u.status === 'active').length}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 107, 107, 0.1)' }]}>
              <Ionicons name="close-circle" size={20} color="#ff6b6b" />
            </View>
            <View>
              <Text style={styles.statValue}>
                {users.filter(u => u.status === 'inactive').length}
              </Text>
              <Text style={styles.statLabel}>Inactive</Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
              <Ionicons name="time" size={20} color="#ffd93d" />
            </View>
            <View>
              <Text style={styles.statValue}>
                {users.filter(u => u.status === 'pending').length}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Members</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#ff6b6b" />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.filterOptions}>
                {['all', 'active', 'inactive', 'pending'].map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterOption,
                      filters.status === status && styles.filterOptionActive
                    ]}
                    onPress={() => setFilters({ ...filters, status })}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.status === status && styles.filterOptionTextActive
                    ]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Membership Type</Text>
              <View style={styles.filterOptions}>
                {['all', 'monthly', 'quarterly', 'annual'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterOption,
                      filters.membership === type && styles.filterOptionActive
                    ]}
                    onPress={() => setFilters({ ...filters, membership: type })}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.membership === type && styles.filterOptionTextActive
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Sort By</Text>
              <View style={styles.filterOptions}>
                {['newest', 'oldest', 'name'].map(sort => (
                  <TouchableOpacity
                    key={sort}
                    style={[
                      styles.filterOption,
                      filters.sortBy === sort && styles.filterOptionActive
                    ]}
                    onPress={() => setFilters({ ...filters, sortBy: sort })}
                  >
                    <Text style={[
                      styles.filterOptionText,
                      filters.sortBy === sort && styles.filterOptionTextActive
                    ]}>
                      {sort.charAt(0).toUpperCase() + sort.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => setFilters({ status: 'all', membership: 'all', sortBy: 'newest' })}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  // Header
  header: {
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#59cb01',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2b2f',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#FFF',
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
  },
  // Bulk Actions
  bulkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e2b2f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  selectedCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#59cb01',
  },
  bulkButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 4,
  },
  bulkButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  // Users
  usersContainer: {
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: '#1e2b2f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedCard: {
    backgroundColor: 'rgba(89, 203, 1, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#8a9a9f',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  menuButton: {
    padding: 4,
  },
  cardDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#FFF',
    marginLeft: 8,
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e2b2f',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#8a9a9f',
    textTransform: 'uppercase',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e2b2f',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  filterSection: {
    marginBottom: 25,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterOptionActive: {
    backgroundColor: '#59cb01',
  },
  filterOptionText: {
    fontSize: 12,
    color: '#8a9a9f',
    fontWeight: '500',
  },
  filterOptionTextActive: {
    color: '#141f23',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#59cb01',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8a9a9f',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#141f23',
  },
});

export default ManageUser;