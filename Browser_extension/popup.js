// abrir un port nombrado para que el background lo identifique
const port = chrome.runtime.connect({ name: "popup-port" });

const statusEl = document.getElementById("server-status");
const fanslyEl = document.getElementById("fansly-status");
const versionEl = document.getElementById("version");

const countersContainer = document.getElementById("counters-container");
const listTemplate = document.getElementById("counter-element");
const sessionDiv = document.getElementById("session-buttons");

const statusCheck = document.getElementById("status");
const statusWrap = document.getElementById("status-wrap");
const buttonSetting = document.getElementById("settings-button");

var started = false;

versionEl.textContent = "v0.1 (test)";
// notificar que se abrió
port.postMessage({ type: "popupOpened", time: Date.now() });

port.onMessage.addListener((msg) => {
	if (msg.type === "backgroundResponse") {
		if (msg.payload.server) {
			statusEl.textContent = `Server status: online`;
			fanslyEl.textContent = `Fansly status: ${msg.payload.server.fansly ? "connected" : "disconnected"}`;
		} else {
			statusEl.textContent = `Server status: disconnected`;
			fanslyEl.textContent = `Fansly status: disconnected`;
		}
		started = msg.payload.started;
		msg.payload.server ? ShowOnline() : ShowDisconnected();
		if (msg.payload.counterList) {
			RenderCounterList(msg.payload.counterList);
		}
	} else if (msg.type === "sessionResponse") {
		started = msg.data.started;
		RenderCounterList(msg.data.counterList);
		document.getElementById("session-status").textContent = started ? "Session started" : "Session not started";
		if (started) document.getElementById("continue-button").classList.add("btn-disable");
	}
});

buttonSetting.addEventListener("click", () => {
	if (!buttonSetting.disable) chrome.tabs.create({ url: "http://localhost:3000/" });
});
window.addEventListener("unload", () => port.disconnect());

ShowLoading();
function ShowLoading() {
	statusWrap.classList.remove("hidden");
	statusWrap.setAttribute("aria-hidden", "false");
	buttonSetting.disable = true;
	buttonSetting.classList.add("hidden");
}

function ShowDisconnected() {
	statusWrap.classList.add("hidden");
	statusWrap.setAttribute("aria-hidden", "true");
	buttonSetting.disable = true;
	buttonSetting.classList.add("hidden");
	const tag = document.getElementById("closed-tag");
	tag.classList.remove("hidden");
	tag.classList.add("col");
}

function ShowOnline() {
	statusWrap.classList.add("hidden");
	statusWrap.setAttribute("aria-hidden", "true");
	buttonSetting.disable = false;
	buttonSetting.classList.remove("hidden");
	const countMain = document.getElementById("counters-main");
	countMain.classList.remove("hidden");
	countMain.classList.add("col");
	document.getElementById("session-status").textContent = started ? "Session started" : "Session not started";
	if (started) document.getElementById("continue-button").classList.add("btn-disable");
}

function RenderCounterList(list) {
	countersContainer.innerHTML = "";
	const frag = document.createDocumentFragment();

	list.forEach((l) => {
		const node = listTemplate.content.cloneNode(true);
		node.querySelector(".counter-name").textContent = l.name;
		node.querySelector(".counter-value").textContent = l.value;
		node.querySelector(".count-btn").index = l.id;

		frag.appendChild(node);
	});
	countersContainer.appendChild(frag);
}

countersContainer.addEventListener("click", (e) => {
	if (e.target.closest(".count-btn")) {
		port.postMessage({ type: "buttonCounter", id: e.target.index });
	}
});

sessionDiv.addEventListener("click", (e) => {
	if (e.target.closest(".sess-btn")) {
		console.log(e);
		if (!started && e.target.dataset.index === "2") {
			port.postMessage({ type: "sessionButtons", id: "2" });
		} else if (e.target.dataset.index === "1") {
			port.postMessage({ type: "sessionButtons", id: "1" });
		}
	}
});
