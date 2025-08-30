// content-script.js
const script = document.createElement('script');
script.src = chrome.runtime.getURL('inject.js');
document.documentElement.appendChild(script);

// Escuchar mensajes del script inyectado
window.addEventListener('message', (event) => {
  if (event.source !== window || !event.data.type === 'FROM_INJECTED_SCRIPT') return;
  
  chrome.runtime.sendMessage({
    type: 'FANSLY_HEADERS',
    data: event.data.payload
  });
});