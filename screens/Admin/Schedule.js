// screens/Schedule.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
  FlatList,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const Schedule = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState('day'); // 'day', 'week', 'month'
  const [selectedClass, setSelectedClass] = useState(null);

  const classes = [
    {
      id: '1',
      title: 'Morning Yoga',
      instructor: 'Emma Wilson',
      time: '07:00 - 08:00',
      date: '2024-12-17',
      duration: '1 hour',
      capacity: '15/20',
      room: 'Yoga Studio A',
      color: '#59cb01'
    },
    {
      id: '2',
      title: 'HIIT Workout',
      instructor: 'John Smith',
      time: '09:00 - 10:00',
      date: '2024-12-17',
      duration: '1 hour',
      capacity: '18/25',
      room: 'Main Gym',
      color: '#36a1d6'
    },
    {
      id: '3',
      title: 'Spin Class',
      instructor: 'Sarah Lee',
      time: '12:00 - 13:00',
      date: '2024-12-17',
      duration: '1 hour',
      capacity: '12/15',
      room: 'Spin Studio',
      color: '#ff6b6b'
    },
    {
      id: '4',
      title: 'Zumba',
      instructor: 'Mike Johnson',
      time: '17:00 - 18:00',
      date: '2024-12-17',
      duration: '1 hour',
      capacity: '22/30',
      room: 'Dance Studio',
      color: '#ffd93d'
    },
    {
      id: '5',
      title: 'Evening Yoga',
      instructor: 'Emma Wilson',
      time: '19:00 - 20:00',
      date: '2024-12-17',
      duration: '1 hour',
      capacity: '14/20',
      room: 'Yoga Studio B',
      color: '#9d4edd'
    },
  ];

  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  // Get days of week for calendar
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date) => {
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const renderClassCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.classCard, { borderLeftColor: item.color }]}
      onPress={() => setSelectedClass(item)}
    >
      <View style={styles.classHeader}>
        <Text style={styles.classTitle}>{item.title}</Text>
        <View style={styles.classBadge}>
          <Text style={styles.classBadgeText}>{item.capacity}</Text>
        </View>
      </View>
      <View style={styles.classDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={14} color="#8a9a9f" />
          <Text style={styles.detailText}>{item.instructor}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color="#8a9a9f" />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="business-outline" size={14} color="#8a9a9f" />
          <Text style={styles.detailText}>{item.room}</Text>
        </View>
      </View>
      <View style={styles.classActions}>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={16} color="#36a1d6" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={16} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Custom Calendar Component
  const CalendarView = () => {
    const weekDates = getWeekDates();
    
    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity>
            <Ionicons name="chevron-back" size={24} color="#59cb01" />
          </TouchableOpacity>
          <Text style={styles.calendarMonth}>December 2024</Text>
          <TouchableOpacity>
            <Ionicons name="chevron-forward" size={24} color="#59cb01" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.daysOfWeek}>
          {daysOfWeek.map((day, index) => (
            <View key={day} style={styles.dayHeader}>
              <Text style={styles.dayHeaderText}>{day}</Text>
              <TouchableOpacity
                style={[
                  styles.dayButton,
                  index === new Date().getDay() && styles.dayButtonToday
                ]}
                onPress={() => setSelectedDate(weekDates[index])}
              >
                <Text style={[
                  styles.dayNumber,
                  index === new Date().getDay() && styles.dayNumberToday,
                  weekDates[index].getDate() === selectedDate.getDate() && styles.dayNumberSelected
                ]}>
                  {weekDates[index].getDate()}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Schedule Management</Text>
            <Text style={styles.subtitle}>Manage classes and appointments</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="#f2faea" />
          </TouchableOpacity>
        </View>

        {/* Custom Calendar View */}
        <CalendarView />

        {/* View Mode Toggle */}
        <View style={styles.viewToggle}>
          {['day', 'week', 'month'].map(mode => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.viewToggleButton,
                viewMode === mode && styles.viewToggleButtonActive
              ]}
              onPress={() => setViewMode(mode)}
            >
              <Text style={[
                styles.viewToggleText,
                viewMode === mode && styles.viewToggleTextActive
              ]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Day Schedule */}
        <View style={styles.scheduleSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Schedule for {formatDate(selectedDate)}
            </Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Print Schedule</Text>
            </TouchableOpacity>
          </View>

          {/* Timeline View */}
          <View style={styles.timeline}>
            {timeSlots.map((time) => {
              const classForTime = classes.find(cls => cls.time.startsWith(time));
              
              return (
                <View key={time} style={styles.timeSlot}>
                  <Text style={styles.timeText}>{time}</Text>
                  {classForTime ? (
                    <TouchableOpacity
                      style={[
                        styles.classTimeBlock,
                        { backgroundColor: `${classForTime.color}30`, borderLeftColor: classForTime.color }
                      ]}
                    >
                      <Text style={styles.classTimeTitle}>{classForTime.title}</Text>
                      <Text style={styles.classTimeInstructor}>{classForTime.instructor}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.emptyTimeBlock} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Upcoming Classes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Classes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={classes}
            renderItem={renderClassCard}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.upcomingList}
          />
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#59cb0120' }]}>
              <Ionicons name="calendar" size={24} color="#59cb01" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>28</Text>
              <Text style={styles.statLabel}>Classes This Week</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#36a1d620' }]}>
              <Ionicons name="people" size={24} color="#36a1d6" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>Average Occupancy</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Navigation Bar */}
      <View style={styles.navBar}>
        {[
          { icon: 'home', label: 'Dashboard', screen: 'AdminDashboard' },
          { icon: 'people', label: 'Members', screen: 'ManageUser' },
          { icon: 'calendar', label: 'Schedule', screen: 'Schedule' },
          { icon: 'stats-chart', label: 'Analytics', screen: 'Analytics' },
          { icon: 'settings', label: 'Settings', screen: 'AdminProfile' },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.navItem, item.label === 'Schedule' && styles.navItemActive]}
            onPress={() => {
              if (item.screen !== 'Schedule') {
                navigation.navigate(item.screen);
              }
            }}
          >
            <Ionicons 
              name={item.icon} 
              size={24} 
              color={item.label === 'Schedule' ? '#59cb01' : '#8a9a9f'} 
            />
            <Text style={[
              styles.navLabel, 
              { color: item.label === 'Schedule' ? '#59cb01' : '#8a9a9f' }
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add Class Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Class</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#f2faea" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Class Title</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter class name"
                  placeholderTextColor="#8a9a9f"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Instructor</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Select instructor"
                  placeholderTextColor="#8a9a9f"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <Text style={styles.inputLabel}>Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#8a9a9f"
                    value={formatDate(selectedDate)}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Time</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="HH:MM"
                    placeholderTextColor="#8a9a9f"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1 hour"
                  placeholderTextColor="#8a9a9f"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Room</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Select room"
                  placeholderTextColor="#8a9a9f"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Capacity</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Maximum participants"
                  placeholderTextColor="#8a9a9f"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.saveButtonText}>Save Class</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#141f23',
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f2faea',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8a9a9f',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#59cb01',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Calendar Styles
  calendarContainer: {
    backgroundColor: '#1e2b2f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f2faea',
  },
  daysOfWeek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayHeader: {
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 12,
    color: '#8a9a9f',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonToday: {
    backgroundColor: 'rgba(89, 203, 1, 0.1)',
  },
  dayNumber: {
    fontSize: 16,
    color: '#f2faea',
  },
  dayNumberToday: {
    color: '#59cb01',
    fontWeight: 'bold',
  },
  dayNumberSelected: {
    backgroundColor: '#59cb01',
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: 'center',
    lineHeight: 32,
    color: '#f2faea',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#1e2b2f',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  viewToggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  viewToggleButtonActive: {
    backgroundColor: '#59cb01',
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8a9a9f',
  },
  viewToggleTextActive: {
    color: '#f2faea',
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f2faea',
  },
  seeAll: {
    fontSize: 14,
    color: '#59cb01',
    fontWeight: '600',
  },
  scheduleSection: {
    marginBottom: 25,
  },
  timeline: {
    backgroundColor: '#1e2b2f',
    borderRadius: 12,
    padding: 16,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 50,
  },
  timeText: {
    width: 60,
    fontSize: 12,
    color: '#8a9a9f',
  },
  emptyTimeBlock: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(242, 250, 234, 0.05)',
    borderRadius: 6,
    marginLeft: 10,
  },
  classTimeBlock: {
    flex: 1,
    height: 50,
    borderRadius: 6,
    padding: 8,
    marginLeft: 10,
    borderLeftWidth: 3,
    justifyContent: 'center',
  },
  classTimeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f2faea',
  },
  classTimeInstructor: {
    fontSize: 10,
    color: '#8a9a9f',
    marginTop: 2,
  },
  classCard: {
    width: 280,
    backgroundColor: '#1e2b2f',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#59cb01',
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  classTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f2faea',
    flex: 1,
  },
  classBadge: {
    backgroundColor: 'rgba(89, 203, 1, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  classBadgeText: {
    fontSize: 11,
    color: '#59cb01',
    fontWeight: '600',
  },
  classDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#f2faea',
    marginLeft: 6,
  },
  classActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    padding: 6,
    marginRight: 8,
  },
  deleteButton: {
    padding: 6,
  },
  upcomingList: {
    paddingRight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e2b2f',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f2faea',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#8a9a9f',
    textTransform: 'uppercase',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e2b2f',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
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
    color: '#f2faea',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f2faea',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#141f23',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#f2faea',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(242, 250, 234, 0.1)',
  },
  row: {
    flexDirection: 'row',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(242, 250, 234, 0.1)',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#59cb01',
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8a9a9f',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f2faea',
  },
  // Navigation Bar Styles
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#1e2b2f',
    borderTopWidth: 1,
    borderTopColor: 'rgba(242, 250, 234, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    backgroundColor: 'rgba(89, 203, 1, 0.1)',
    borderRadius: 8,
  },
  navLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default Schedule;