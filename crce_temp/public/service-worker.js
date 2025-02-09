// filepath: /Users/venishakalola/Desktop/spit/Hackhounds/crce_temp/public/service-worker.js
self.addEventListener('install', (event) => {
    console.log('Service worker installed');
  });
  
  self.addEventListener('activate', (event) => {
    console.log('Service worker activated');
  });
  
  self.addEventListener('fetch', (event) => {
    console.log('Fetch intercepted for:', event.request.url);
  });