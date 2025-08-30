var s = document.createElement("script");
// must be listed in web_accessible_resources in manifest.json
s.src = chrome.runtime.getURL("injected.js");
s.onload = function () {
	this.remove();
};
(document.head || document.documentElement).appendChild(s);

// escucha los mensajes del injected
window.addEventListener("message", function (event) {
	// Asegúrate de que el mensaje venga del mismo contexto
	if (event.source !== window) return;
	if (event.data && event.data.type && (event.data.type === "fansly-headers-captured" || event.data.type === "fansly-chatRoomGoals")) {
		// Envía el mensaje al background
		chrome.runtime.sendMessage(event.data);
	}
});
