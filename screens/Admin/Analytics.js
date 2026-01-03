// screens/Analytics.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart, LineChart, PieChart, ProgressChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const Analytics = ({ navigation }) => {
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year'
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // Revenue Data
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      data: [8500, 9200, 10500, 11200, 12850, 13500, 14200, 13800, 14500, 15200, 16500, 17200],
      color: (opacity = 1) => `rgba(89, 203, 1, ${opacity})`,
      strokeWidth: 2
    }]
  };

  // Membership Growth
  const membershipData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      data: [180, 205, 230, 245],
      color: (opacity = 1) => `rgba(54, 161, 214, ${opacity})`,
    }],
  };

  // Class Attendance Distribution
  const classAttendanceData = [
    { name: 'Yoga', population: 28, color: '#59cb01', legendFontColor: '#f2faea' },
    { name: 'HIIT', population: 22, color: '#36a1d6', legendFontColor: '#f2faea' },
    { name: 'Spin', population: 18, color: '#ff6b6b', legendFontColor: '#f2faea' },
    { name: 'Zumba', population: 15, color: '#ffd93d', legendFontColor: '#f2faea' },
    { name: 'Pilates', population: 12, color: '#9d4edd', legendFontColor: '#f2faea' },
  ];

  // Performance Metrics
  const performanceData = {
    labels: ['Occupancy', 'Retention', 'Satisfaction', 'Revenue'],
    data: [0.85, 0.78, 0.92, 0.88]
  };

  // Key Metrics
  const keyMetrics = [
    { label: 'Total Revenue', value: '$165,800', change: '+12.5%', color: '#59cb01', icon: 'cash' },
    { label: 'Active Members', value: '245', change: '+8.2%', color: '#36a1d6', icon: 'people' },
    { label: 'Avg. Occupancy', value: '85%', change: '+5.3%', color: '#ff6b6b', icon: 'stats-chart' },
    { label: 'Retention Rate', value: '78%', change: '+3.1%', color: '#ffd93d', icon: 'trending-up' },
  ];

  // Top Performing Classes
  const topClasses = [
    { name: 'Morning Yoga', attendance: '95%', revenue: '$4,200', trend: 'up' },
    { name: 'HIIT Workout', attendance: '92%', revenue: '$3,800', trend: 'up' },
    { name: 'Spin Class', attendance: '88%', revenue: '$3,500', trend: 'stable' },
    { name: 'Evening Yoga', attendance: '85%', revenue: '$3,200', trend: 'up' },
    { name: 'Zumba', attendance: '82%', revenue: '$2,900', trend: 'down' },
  ];

  // Time Range Buttons
  const timeRanges = [
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Quarter', value: 'quarter' },
    { label: 'Year', value: 'year' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Analytics Dashboard</Text>
            <Text style={styles.subtitle}>Performance insights and trends</Text>
          </View>
          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="download" size={24} color="#59cb01" />
          </TouchableOpacity>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeSelector}>
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range.value}
              style={[
                styles.timeRangeButton,
                timeRange === range.value && styles.timeRangeButtonActive
              ]}
              onPress={() => setTimeRange(range.value)}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === range.value && styles.timeRangeTextActive
              ]}>
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          {keyMetrics.map((metric, index) => (
            <View key={index} style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: `${metric.color}20` }]}>
                <Ionicons name={metric.icon} size={20} color={metric.color} />
              </View>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <View style={styles.metricChange}>
                <Ionicons 
                  name={metric.change.includes('+') ? 'trending-up' : 'trending-down'} 
                  size={12} 
                  color={metric.color} 
                />
                <Text style={[styles.changeText, { color: metric.color }]}>
                  {metric.change}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Revenue Chart */}
        <View style={styles.chartSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Revenue Trend</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View Details</Text>
            </TouchableOpacity>
          </View>
          <LineChart
            data={revenueData}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#1e2b2f',
              backgroundGradientFrom: '#1e2b2f',
              backgroundGradientTo: '#1e2b2f',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(89, 203, 1, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(242, 250, 234, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: '6', strokeWidth: '2', stroke: '#59cb01' }
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Performance Metrics */}
        <View style={styles.chartSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Performance Metrics</Text>
          </View>
          <ProgressChart
            data={performanceData}
            width={width - 40}
            height={220}
            strokeWidth={16}
            radius={32}
            chartConfig={{
              backgroundColor: '#1e2b2f',
              backgroundGradientFrom: '#1e2b2f',
              backgroundGradientTo: '#1e2b2f',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(89, 203, 1, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(242, 250, 234, ${opacity})`,
              style: { borderRadius: 16 },
            }}
            hideLegend={false}
          />
        </View>

        {/* Class Attendance Distribution */}
        <View style={styles.chartSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Class Attendance</Text>
          </View>
          <PieChart
            data={classAttendanceData}
            width={width - 40}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(242, 250, 234, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>

        {/* Top Performing Classes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Performing Classes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.classesList}>
            {topClasses.map((cls, index) => (
              <View key={index} style={styles.classItem}>
                <View style={styles.classInfo}>
                  <Text style={styles.className}>{cls.name}</Text>
                  <View style={styles.classStats}>
                    <View style={styles.stat}>
                      <Ionicons name="people" size={12} color="#8a9a9f" />
                      <Text style={styles.statText}>{cls.attendance}</Text>
                    </View>
                    <View style={styles.stat}>
                      <Ionicons name="cash" size={12} color="#8a9a9f" />
                      <Text style={styles.statText}>{cls.revenue}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.trendIndicator}>
                  <Ionicons 
                    name={cls.trend === 'up' ? 'trending-up' : cls.trend === 'down' ? 'trending-down' : 'remove'} 
                    size={20} 
                    color={cls.trend === 'up' ? '#59cb01' : cls.trend === 'down' ? '#ff6b6b' : '#8a9a9f'} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Membership Growth */}
        <View style={styles.chartSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Membership Growth</Text>
          </View>
          <BarChart
            data={membershipData}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#1e2b2f',
              backgroundGradientFrom: '#1e2b2f',
              backgroundGradientTo: '#1e2b2f',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(54, 161, 214, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(242, 250, 234, ${opacity})`,
              style: { borderRadius: 16 }
            }}
            style={styles.chart}
          />
        </View>

        {/* Insights Section */}
        <View style={styles.insightsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Key Insights</Text>
            <TouchableOpacity>
              <Ionicons name="bulb" size={20} color="#ffd93d" />
            </TouchableOpacity>
          </View>
          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <Ionicons name="checkmark-circle" size={16} color="#59cb01" style={styles.insightIcon} />
              <Text style={styles.insightText}>
                Morning Yoga classes have highest occupancy (95%)
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="trending-up" size={16} color="#59cb01" style={styles.insightIcon} />
              <Text style={styles.insightText}>
                Revenue increased by 12.5% compared to last month
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="alert-circle" size={16} color="#ff6b6b" style={styles.insightIcon} />
              <Text style={styles.insightText}>
                Zumba attendance declined by 8% - consider promotional offers
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="star" size={16} color="#ffd93d" style={styles.insightIcon} />
              <Text style={styles.insightText}>
                Member satisfaction score at 92% - all-time high
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  exportButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(242, 250, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#1e2b2f',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: '#59cb01',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8a9a9f',
  },
  timeRangeTextActive: {
    color: '#f2faea',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#1e2b2f',
    padding: 16,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(242, 250, 234, 0.1)',
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f2faea',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#8a9a9f',
    marginBottom: 8,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  chartSection: {
    marginBottom: 25,
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
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  classesList: {
    backgroundColor: '#1e2b2f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(242, 250, 234, 0.1)',
  },
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(242, 250, 234, 0.1)',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f2faea',
    marginBottom: 8,
  },
  classStats: {
    flexDirection: 'row',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#8a9a9f',
    marginLeft: 4,
  },
  trendIndicator: {
    width: 32,
    alignItems: 'center',
  },
  insightsSection: {
    marginBottom: 30,
  },
  insightsList: {
    backgroundColor: '#1e2b2f',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(242, 250, 234, 0.1)',
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  insightIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#f2faea',
    lineHeight: 20,
  },
});

export default Analytics;