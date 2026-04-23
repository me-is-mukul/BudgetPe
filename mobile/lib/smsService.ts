import { DeviceEventEmitter, NativeModules } from 'react-native';

// SmsReceiver is a custom native module — only available in a dev build, not Expo Go.
const { SmsReceiver } = NativeModules;

let subscription: ReturnType<typeof DeviceEventEmitter.addListener> | null = null;

export function startSmsListener(): boolean {
  if (!SmsReceiver) {
    console.warn('[SMS] Native SmsReceiver module not available — run expo prebuild + expo run:android');
    return false;
  }
  if (subscription) return true;

  SmsReceiver.startListening();
  subscription = DeviceEventEmitter.addListener('onSmsReceived', (message: { sender: string; body: string }) => {
    console.log('[SMS received]', {
      sender: message.sender,
      body: message.body,
    });
  });
  return true;
}

export function stopSmsListener() {
  subscription?.remove();
  subscription = null;
  SmsReceiver?.stopListening?.();
}
