import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import * as SecureStore from 'expo-secure-store';

export const BACKGROUND_SMS_TASK = 'background-sms-sync';

// Must be defined at module top-level so TaskManager can pick it up on startup
TaskManager.defineTask(BACKGROUND_SMS_TASK, async () => {
  const token = await SecureStore.getItemAsync('token');
  if (!token) return;
  // placeholder — background processing logic goes here
});

export async function registerBackgroundSync() {
  const status = await BackgroundTask.getStatusAsync();
  if (
    status === BackgroundTask.BackgroundTaskStatus.Restricted ||
    status === BackgroundTask.BackgroundTaskStatus.Denied
  ) return;

  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SMS_TASK);
  if (!isRegistered) {
    await BackgroundTask.registerTaskAsync(BACKGROUND_SMS_TASK, {
      minimumInterval: 15 * 60,
    });
  }
}
