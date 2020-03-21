const publicVapidKey =
  'BObq8X1-SPUeRd5BjXGib0Uue6JQZMSg-kqUclmlXGcsaEsyPYfZM14Ua5ZH1hmLRBTYKe6gdFRWrTLWljQ8VNQ';

//Check for service worker in api for the browser
if ('serviceWorker' in navigator) {
  checkPermissionsAndSupport();
  send().catch(err => console.error(err));
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

//Register SW, Regiter Push, Send Push (notification)
async function send() {
  //Register Service Worker
  console.log('Registering service worker...');
  const register = await navigator.serviceWorker.register('/worker.js', {
    scope: '/'
  });
  console.log('Service Worker Registered...');

  //Register Push
  console.log('Registering Push...');
  const subscription = await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
  });
  console.log('Push Registered...');

  //Send push notification
  console.log('Sending Push...');
  await fetch('/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'content-type': 'application/json'
    }
  });
  console.log('Push Sent...');
}

function checkPermissionsAndSupport() {
  if (!('Notification' in window)) {
    alert('Este browser não suporta notificações');
    document.getElementById('notificationsPermissionStatus').innerHTML =
      'Este browser não suporta notificações';
  } else if (Notification.permission === 'granted') {
    document.getElementById('notificationsPermissionStatus').innerHTML =
      'Notificações serão enviadas';
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function(permission) {
      if (permission === 'granted') {
        document.getElementById('notificationsPermissionStatus').innerHTML =
          'Notificações serão enviadas';
      } else {
        document.getElementById('notificationsPermissionStatus').innerHTML =
          'Necessita de garantir permissões para receber notificações';
      }
    });
  }
}
