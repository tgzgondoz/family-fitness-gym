import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.title}>FAMILY FITNESS</Text>
        <Text style={styles.subtitle}>GYM</Text>
      </View>
      <ActivityIndicator size="large" color="#FF6B6B" />
      <Text style={styles.motto}>Join the Movement</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B6B',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
    letterSpacing: 1,
  },
  motto: {
    fontSize: 16,
    color: '#fff',
    marginTop: 30,
    fontStyle: 'italic',
  },
});