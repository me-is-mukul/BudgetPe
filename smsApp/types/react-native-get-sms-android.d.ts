declare module 'react-native-get-sms-android' {
  interface SmsFilter {
    box?: 'inbox' | 'sent' | 'draft' | 'outbox' | 'failed' | 'queued';
    read?: 0 | 1;
    _id?: number;
    thread_id?: number;
    address?: string;
    body?: string;
    bodyRegex?: string;
    indexFrom?: number;
    maxCount?: number;
    minDate?: number;
    maxDate?: number;
    sortOrder?: string;
    selection?: string;
  }

  const SmsAndroid: {
    list(
      filter: string,
      errorCallback: (error: string) => void,
      successCallback: (count: number, smsList: string) => void
    ): void;
    send(
      addresses: string,
      text: string,
      errorCallback: (error: string) => void,
      successCallback: (result: string) => void
    ): void;
    delete(
      id: number,
      errorCallback: (error: string) => void,
      successCallback: (result: string) => void
    ): void;
  };

  export default SmsAndroid;
}
