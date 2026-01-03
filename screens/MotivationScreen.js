import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

const MotivationScreen = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    fetchMotivationData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchMotivationData = async () => {
    // Fetch workout logs
    const { data: workoutData } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(10);

    // Fetch achievements
    const { data: achievementData } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    // Calculate streak
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Simple streak calculation
    const recentWorkouts = workoutData?.filter(w => {
      const workoutDate = new Date(w.date);
      return workoutDate >= yesterday;
    }).length || 0;

    setWorkouts(workoutData || []);
    setAchievements(achievementData || []);
    setStreak(recentWorkouts);
    setXp((workoutData?.length || 0) * 10);
    setLevel(Math.floor(((workoutData?.length || 0) * 10) / 100) + 1);
  };

  const logWorkout = async () => {
    try {
      const { data } = await supabase
        .from('workout_logs')
        .insert([{
          user_id: user.id,
          workout_type: 'Gym Session',
          duration_minutes: 60,
          calories_burned: 400,
          notes: 'Great workout today!',
        }])
        .select()
        .single();

      setWorkouts([data, ...workouts]);
      setStreak(streak + 1);
      setXp(xp + 10);

      // Check for achievements
      checkAchievements(workouts.length + 1);
    } catch (error) {
      console.error('Error logging workout:', error);
    }
  };

  const checkAchievements = async (totalWorkouts) => {
    const newAchievements = [];
    
    if (totalWorkouts === 1) {
      newAchievements.push({
        title: 'First Step',
        description: 'Completed your first workout!',
        icon: '🏃',
      });
    }
    
    if (totalWorkouts === 10) {
      newAchievements.push({
        title: 'Dedicated Member',
        description: 'Completed 10 workouts!',
        icon: '💪',
      });
    }
    
    if (streak >= 7) {
      newAchievements.push({
        title: 'Week Warrior',
        description: '7-day workout streak!',
        icon: '🔥',
      });
    }

    // Save achievements
    for (const achievement of newAchievements) {
      await supabase.from('achievements').insert([{
        user_id: user.id,
        achievement_type: 'workout',
        ...achievement,
      }]);
    }

    if (newAchievements.length > 0) {
      setAchievements([...newAchievements.map(a => ({
        ...a,
        earned_at: new Date().toISOString(),
      })), ...achievements]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.headerTitle}>Your Fitness Journey</Text>
        <Text style={styles.headerSubtitle}>Join the Movement!</Text>
      </Animated.View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{level}</Text>
          <Text style={styles.statLabel}>Level</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{xp}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{workouts.length}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logWorkoutButton} onPress={logWorkout}>
        <Ionicons name="fitness" size={24} color="#fff" />
        <Text style={styles.logWorkoutText}>Log Today's Workout</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Workouts</Text>
        {workouts.map((workout, index) => (
          <View key={workout.id || index} style={styles.workoutCard}>
            <View style={styles.workoutIcon}>
              <Ionicons name="barbell-outline" size={24} color="#59cb01" />
            </View>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutType}>{workout.workout_type}</Text>
              <Text style={styles.workoutDetails}>
                {workout.duration_minutes} mins • {workout.calories_burned} cal
              </Text>
              <Text style={styles.workoutDate}>
                {new Date(workout.date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.workoutStats}>
              <Ionicons name="flame" size={20} color="#FF9800" />
              <Text style={styles.workoutCalories}>{workout.calories_burned}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement, index) => (
            <View key={achievement.id || index} style={styles.achievementCard}>
              <Text style={styles.achievementIcon}>{achievement.icon || '🏆'}</Text>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDesc}>{achievement.description}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.motivationSection}>
        <Text style={styles.quoteText}>
          "The only bad workout is the one that didn't happen."
        </Text>
        <Text style={styles.quoteAuthor}>- Unknown</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#141f23',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#59cb01',
    marginTop: 4,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#59cb01',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  logWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#59cb01',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  logWorkoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  workoutDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  workoutDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  workoutStats: {
    alignItems: 'center',
  },
  workoutCalories: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF9800',
    marginTop: 2,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  motivationSection: {
    backgroundColor: '#141f23',
    margin: 16,
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#59cb01',
  },
});

export default MotivationScreen;