const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

export async function subscribeToPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    console.log('Push subscription successful:', subscription);
    return subscription;
  } catch (error) {
    console.error('Push subscription failed:', error);
    throw error;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeToWebPushAPI() {
  try {
    // 1. Subscribe ke PushManager
    const subscription = await subscribeToPushNotifications();
    const { endpoint, keys } = subscription.toJSON();

    // 2. Ambil token user (pastikan sesuai implementasi Anda)
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Anda harus login untuk mengaktifkan notifikasi!');
      return;
    }

    // 3. Kirim ke API Dicoding
    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth
        }
      })
    });
    const result = await response.json();
    if (response.ok && !result.error) {
      alert('Berhasil subscribe notifikasi!');
    } else {
      alert('Gagal subscribe notifikasi: ' + (result.message || 'Unknown error'));
    }
  } catch (error) {
    alert('Gagal subscribe notifikasi: ' + error.message);
    console.error('Subscribe Web Push API error:', error);
  }
} 