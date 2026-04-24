import { useEffect, useRef, useState } from 'react';
import { View, Text, PermissionsAndroid, Platform, StyleSheet, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SmsAndroid from 'react-native-get-sms-android';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '@/context/AuthContext';
import { classifyMessage, postMessage } from '@/lib/api';

type SmsMessage = {
  _id: number;
  address: string;
  body: string;
  date: number;
};

type PermissionStatus = 'pending' | 'granted' | 'denied' | 'never_ask_again';

const POLL_INTERVAL_MS = 3000;
const LAST_PROCESSED_SMS_DATE_KEY = 'lastProcessedSmsDate';

function fetchRecentMessages(): Promise<SmsMessage[]> {
  return new Promise((resolve) => {
    SmsAndroid.list(
      JSON.stringify({ box: 'inbox', maxCount: 30 }),
      (err) => {
        console.error('[SMS] read error:', err);
        resolve([]);
      },
      (_count, smsList) => {
        try {
          const messages: SmsMessage[] = JSON.parse(smsList);
          messages.sort((a, b) => b.date - a.date);
          resolve(messages);
        } catch {
          resolve([]);
        }
      }
    );
  });
}

export default function Index() {
  const { userName, token, logout } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('pending');
  const processedIdsRef = useRef<Set<number>>(new Set());
  const lastProcessedDateRef = useRef<number>(0);

  useEffect(() => {
    if (!token) {
      console.log('[SMS] No token, skipping initialization');
      return;
    }

    if (Platform.OS !== 'android') {
      console.log('[SMS] SMS reading is only supported on Android');
      setPermissionStatus('denied');
      return;
    }

    if (!SmsAndroid || typeof SmsAndroid.list !== 'function') {
      console.log('[SMS] Native SMS module unavailable. Use a development build, not Expo Go.');
      setPermissionStatus('denied');
      return;
    }

    console.log('[SMS] Initializing SMS polling for user:', userName);

    let intervalId: ReturnType<typeof setInterval>;

    async function init() {
      const savedDate = await SecureStore.getItemAsync(LAST_PROCESSED_SMS_DATE_KEY);
      lastProcessedDateRef.current = Number(savedDate) || 0;

      const alreadyGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_SMS
      );

      if (!alreadyGranted) {
        console.log('[SMS] Permission not granted, requesting...');
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          {
            title: 'SMS Permission',
            message: 'BudgetPe needs to read your bank SMS messages to track expenses.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );

        if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          console.log('[SMS] Permission permanently denied by user');
          setPermissionStatus('never_ask_again');
          return;
        }
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('[SMS] Permission denied by user');
          setPermissionStatus('denied');
          return;
        }
      }

      console.log('[SMS] ✅ Permission granted, starting polling...');
      setPermissionStatus('granted');

      async function poll() {
        try {
          const messages = await fetchRecentMessages();

          if (messages.length === 0) {
            console.log('[SMS] No messages in inbox');
            return;
          }

          const newMessages = messages
            .filter(
              (msg) =>
                msg.date > lastProcessedDateRef.current &&
                !processedIdsRef.current.has(msg._id)
            )
            .sort((a, b) => a.date - b.date);

          if (newMessages.length === 0) {
            const latestId = messages[0]?._id;
            if (latestId != null) {
              console.log('[SMS] Skipping duplicate (already processed):', latestId);
            }
            return;
          }

          console.log('[SMS] Found new messages:', newMessages.length);

          for (const msg of newMessages) {
            console.log('[SMS] New message detected:', {
              id: msg._id,
              from: msg.address,
              body: msg.body.substring(0, 100) + '...',
              date: new Date(msg.date).toISOString(),
            });

            try {
              console.log('[SMS] Sending to ML Model for classification...');
              const result = await classifyMessage(msg.body);

              if (!result) {
                console.warn('[SMS] ML Model rejected: Not a valid bank debit message');
                console.log('[SMS] Message text:', msg.body);
                processedIdsRef.current.add(msg._id);
                lastProcessedDateRef.current = Math.max(lastProcessedDateRef.current, msg.date);
                await SecureStore.setItemAsync(
                  LAST_PROCESSED_SMS_DATE_KEY,
                  String(lastProcessedDateRef.current)
                );
                continue;
              }

              console.log('[SMS] Classification result:', result);
              console.log('[SMS] Sending to Backend...');

              await postMessage(token!, {
                ...result,
                originalText: msg.body,
                receiver: msg.address,
              });

              processedIdsRef.current.add(msg._id);
              lastProcessedDateRef.current = Math.max(lastProcessedDateRef.current, msg.date);
              await SecureStore.setItemAsync(
                LAST_PROCESSED_SMS_DATE_KEY,
                String(lastProcessedDateRef.current)
              );
              console.log('[SMS] ✅ Successfully saved to backend!');
            } catch (err) {
              console.error('[SMS] Classification/Backend error:', {
                error: err instanceof Error ? err.message : String(err),
                stack: err instanceof Error ? err.stack : undefined,
              });
            }
          }
        } catch (err) {
          console.error('[SMS] Poll error:', err);
        }
      }

      console.log('[SMS] Running initial poll...');
      await poll();
      console.log('[SMS] Starting interval polling (every 3 seconds)...');
      intervalId = setInterval(poll, POLL_INTERVAL_MS);
    }

    init();
    return () => {
      console.log('[SMS] Cleaning up polling interval');
      clearInterval(intervalId);
    };
  }, [token, userName]);

  if (permissionStatus === 'never_ask_again') {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>SMS permission permanently denied.</Text>
        <Text style={styles.hint}>
          Go to Settings → Apps → BudgetPe → Permissions → SMS and enable it.
        </Text>
        <Pressable onPress={() => Linking.openSettings()} style={styles.settingsBtn}>
          <Text style={styles.settingsBtnText}>Open Settings</Text>
        </Pressable>
      </View>
    );
  }

  if (permissionStatus === 'denied') {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>SMS access unavailable.</Text>
        <Text style={styles.hint}>
          Ensure READ_SMS is allowed and run this app as an Android development build.
          Expo Go may not support the native SMS module.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {userName}</Text>
          <Text style={styles.subtext}>Listening for bank messages...</Text>
        </View>
        <Pressable onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f8ff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
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
  error: { fontSize: 15, color: '#c0392b', fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  hint: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  settingsBtn: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  settingsBtnText: { color: '#fff', fontWeight: '600' },
});
