// // Injecta el script en el contexto de la página
// const injectScript = () => {
//     const script = document.createElement('script');
//     script.src = chrome.runtime.getURL('inject.js');
//     script.onload = function() {
//       this.remove();
//     };
//     (document.head || document.documentElement).appendChild(script);
//   };
  
  // Escucha mensajes del script inyectado
window.addEventListener('message', async (event) => {
    if (event.source !== window || !event.data.type === 'XHR_DATA') return;
    
    // Envía los datos al background (opcional)
    chrome.runtime.sendMessage({
        type: 'XHR_INTERCEPTED_DATA',
        data: event.data.payload
    });
    
    // También puedes mostrarlos directamente aquí
    console.log('Intercepted XHR:', event.data.payload);
});
  
//   injectScript();