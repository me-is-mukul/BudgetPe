import { useEffect, useRef, useState } from 'react';
import { View, Text, PermissionsAndroid, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SmsAndroid from 'react-native-get-sms-android';
import { useAuth } from '@/context/AuthContext';

type SmsMessage = {
  _id: number;
  address: string;
  body: string;
  date: number;
};

const POLL_INTERVAL_MS = 3000;

function fetchLatest(): Promise<SmsMessage | null> {
  return new Promise((resolve) => {
    SmsAndroid.list(
      JSON.stringify({ box: 'inbox', maxCount: 50, sortOrder: 'date DESC' }),
      (err: string) => {
        console.log('[SMS] list error:', err);
        resolve(null);
      },
      (_count: number, smsList: string) => {
        const messages: SmsMessage[] = JSON.parse(smsList);
        if (messages.length === 0) { resolve(null); return; }
        messages.sort((a, b) => b.date - a.date);
        resolve(messages[0]);
      }
    );
  });
}

export default function Index() {
  const { userName, token, logout } = useAuth();
  const [latest, setLatest] = useState<SmsMessage | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const lastIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!token) return;

    let intervalId: ReturnType<typeof setInterval>;

    async function init() {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: 'SMS Permission',
          message: 'This app needs access to your SMS messages.',
          buttonPositive: 'Allow',
        }
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setPermissionDenied(true);
        return;
      }

      async function poll() {
        console.log('[SMS] polling...');
        const msg = await fetchLatest();
        console.log('[SMS] latest:', msg?._id, msg?.address, msg?.date);
        if (msg && msg._id !== lastIdRef.current) {
          console.log(`[SMS] new message — user: ${userName} | from: ${msg.address} | body: ${msg.body}`);
          // const response = await fetch('http://localhost:5001/model/classify', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({
          //     msg : `${msg.body}`
          //   })
          // });
          // const data = await response.json();
          // console.log('[SMS] classification result:', data);
          lastIdRef.current = msg._id;
          setLatest(msg);
        }
      }

      await poll();
      intervalId = setInterval(poll, POLL_INTERVAL_MS);
    }

    init();
    return () => clearInterval(intervalId);
  }, [token]);

  if (permissionDenied) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>SMS permission denied.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userName} 👋</Text>
          <Text style={styles.subtext}>Listening for new messages...</Text>
        </View>
        <Pressable onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        {!latest ? (
          <Text style={styles.waiting}>Waiting for messages...</Text>
        ) : (
          <>
            <Text style={styles.label}>Latest SMS</Text>
            <View style={styles.card}>
              <Text style={styles.sender}>{latest.address}</Text>
              <Text style={styles.msgBody}>{latest.body}</Text>
              <Text style={styles.time}>{new Date(latest.date).toLocaleString()}</Text>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f8ff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8f0fe',
  },
  greeting: { fontSize: 18, fontWeight: '700', color: '#11181C' },
  subtext: { fontSize: 12, color: '#888', marginTop: 2 },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  logoutText: { fontSize: 13, color: '#c62828', fontWeight: '600' },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#888',
    marginBottom: 12,
  },
  card: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sender: { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  msgBody: { fontSize: 15, color: '#333', lineHeight: 22 },
  time: { fontSize: 12, color: '#999', marginTop: 4 },
  waiting: { fontSize: 15, color: '#888' },
  error: { fontSize: 15, color: '#c0392b' },
});
