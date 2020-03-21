console.log('Service Worker Loaded...');

self.addEventListener('push', e => {
  const data = e.data.json();
  console.log('Push Received...');
  self.registration.showNotification(data.title, {
    body: 'Notified by Vitor Barroso',
    icon: 'https://imagens.canaltech.com.br/empresas/690.400.jpg'
  });
});
