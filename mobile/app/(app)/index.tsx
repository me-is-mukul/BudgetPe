import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { startSmsListener, stopSmsListener } from '@/lib/smsService';
import { registerBackgroundSync } from '@/lib/backgroundSync';

export default function HomeScreen() {
  const { logout } = useAuth();
  const [smsActive, setSmsActive] = useState(false);

  useEffect(() => {
    setSmsActive(startSmsListener());
    registerBackgroundSync().catch(() => {});
    return () => stopSmsListener();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.logo}>BudgetPe</Text>

        <View style={styles.card}>
          <Text style={styles.checkmark}>✓</Text>
          <Text style={styles.cardTitle}>You're logged in</Text>
          <Text style={styles.cardDesc}>
            Use the web dashboard to view and analyze your transactions.
          </Text>
          <Text style={styles.url}>localhost:5173</Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.dot, smsActive ? styles.dotActive : styles.dotInactive]}>●</Text>
          <Text style={styles.cardTitle}>
            {smsActive ? 'SMS Listener active' : 'SMS Listener unavailable'}
          </Text>
          <Text style={styles.cardDesc}>
            {smsActive
              ? 'Incoming SMS messages are being logged to the terminal.'
              : 'Requires a dev build — run expo run:android.'}
          </Text>
        </View>

        <Pressable style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f8ff' },
  inner: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
  logo: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0a7ea4',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  checkmark: { fontSize: 36, marginBottom: 10 },
  dot: { fontSize: 20, marginBottom: 10 },
  dotActive: { color: '#2e7d32' },
  dotInactive: { color: '#aaa' },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#11181C', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#687076', textAlign: 'center', lineHeight: 20 },
  url: {
    marginTop: 8,
    fontSize: 13,
    color: '#0a7ea4',
    fontFamily: 'monospace',
  },
  logoutButton: {
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  logoutText: { color: '#c62828', fontSize: 15, fontWeight: '600' },
});
