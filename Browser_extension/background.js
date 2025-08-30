// const { response } = require("express");

var fanslyJson = {};

var serverStatus = false;

// chrome.runtime.onInstalled.addListener(() => {
// 	chrome.alarms.create("keepAlive", { periodInMinutes: 0.1 });
// });

// chrome.alarms.onAlarm.addListener((alarm) => {
// 	if (alarm.name === "keepAlive") {
// 		console.log("Manteniendo activo el Service Worker");
// 	}
// });

chrome.runtime.onConnect.addListener((port) => {
	if (port.name !== "popup-port") return;

	port.onMessage.addListener((msg) => {
		if (msg.type === "popupOpened") {
			// fetch al backend
			fetch("http://localhost:3000/extension/notify")
				.then((data) => data.json())
				.then((data) => {
					if (data) {
						port.postMessage({ type: "backgroundResponse", payload: data });
						serverStatus = true;
					}
				})
				.catch(() => {
					port.postMessage({ type: "backgroundResponse", payload: false });
					serverStatus = false;
					return;
				});
		} else if (msg.type === "buttonCounter") {
			fetch("http://localhost:3000/extension/count", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: msg.id }) })
				.then((data) => data.json())
				.then((data) => {
					if (data) {
						port.postMessage({ type: "sessionResponse", data: data });
					}
				});
		} else if (msg.type === "sessionButtons") {
			fetch("http://localhost:3000/extension/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: msg.id }) })
				.then((data) => data.json())
				.then((data) => {
					if (data) {
						port.postMessage({ type: "sessionResponse", data: data });
					}
				});
		}
	});
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	console.log(message.type);
	if (message.type === "fansly-headers-captured") {
		fanslyJson.token = message.token;
		fanslyJson.chatRoomId = message.chatRoomId;
		fanslyJson.subscriptionTiers = message.subscriptionTiers;
		SendFanslyJsonToBackend(fanslyJson);
	}
	if (message.type === "fansly-chatRoomGoals") {
		SendFanslyGoalsToBackend(message.goals);
	}
});

function SendFanslyJsonToBackend(payload) {
	fetch("http://localhost:3000/FanslyAccess", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	})
		.then(() => (fanslyJson = {}))
		.catch((error) => {
			console.error("Error al enviar JSON", error);
		});
}

function SendFanslyGoalsToBackend(payload) {
	fetch("http://localhost:3000/FanslyGoals", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	}).catch((error) => {
		console.error("Error al enviar JSON", error);
	});
}
