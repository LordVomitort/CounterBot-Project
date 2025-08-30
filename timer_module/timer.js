const EventEmitter = require("events");
const timerEmitter = new EventEmitter();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Parametros de timer
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var timer, endTime;
var timerStarted = false;

var timerHandler;

var timerParameters = {
	enabled: false,
	start: 0,
	followers: 60,
	tips: 100,
	event: {
		followers: true,
		tips: true,
		subs: true,
		subsOnlyShared: false,
		goals: true,
		counters: true,
	},
	subs: [
		// {subId:"0",amount:0,enabled:false}
	],
	goals: [
		// {goalId:"0",amount:0,enabled:false}
	],
	counters: [
		// {counterId: 1,amount: 600,endabled: true},
	],
};

// Parametros del donothon

var donothonStats = {
	id: "",
	followers: 0,
	subs: [
		// { subscriptionTier: {}, amount: 0 }
	],
	counters: [
		// { id: 0, amount: 0 }
	],
	goals: 0,
	tips: 0,
};
const getParameters = () => {
	return timerParameters;
};

function setRemaining(t) {
	timer = t;
}
// funcion que calcula el propio timer
function _runTimer() {
	if (timerStarted) {
		// calulo la cantidad de segundos restantes hasta el tiempo final en base a los milisegundos transcurridos
		timer = Math.floor((endTime - Date.now()) / 1000);
		// si llegó a 0 evito que sea negativo y detengo el timer
		if (timer <= 0) {
			timer = 0;
			StopTimer();
		}
		// emito el update
		timerEmitter.emit("timerUpdate", timer);
	}
}

// arranca el timer desde el guardado en la base de datos
function ToggleTimer(t) {
	if (!timerStarted && timerParameters.enabled) {
		_startTimer(t);
	} else _stopTimer();
}
function _startTimer(t) {
	// igualo timer al remaining y calculo el nuevo tiempo final
	timer = t;
	endTime = Date.now() + timer * 1000;
	// arranco el timer
	timerHandler = setInterval(_runTimer, 1000);
	timerStarted = true;

	timerEmitter.emit("started");
}

// detiene el timer y envia al los clientes
function _stopTimer() {
	clearInterval(timerHandler);

	timerStarted = false;
	timerEmitter.emit("stopped", timer);
}
function Start(t) {
	if (!timerStarted && timerParameters.enabled) {
		_startTimer(t);
	}
}
function Stop() {
	if (timerStarted) _stopTimer();
}

function Enable(e) {
	timerParameters.enabled = e;
	timerEmitter.emit("enable", e);
	if (!e) {
		_stopTimer();
	}
}
// llamada al resetear el timer
function Reset() {
	// igualo el timer al Start time y actualizo la base de datos
	timer = timerParameters.start;

	// calculo el nuevo tiempo final en milisegundos
	endTime = Date.now() + timer * 1000;
	// detengo el timer y envio el reset al preview
	clearInterval(timerHandler);
	timerStarted = false;

	timerEmitter.emit("reset", timer);
	return timer;
}
// agrega tiempo al timer, recibe la cantidad ed segundos a sumar
function AddTime(seconds) {
	timer = timer + seconds;
	// calculo el nuevo tiempo final en milisegundos
	endTime = endTime + seconds * 1000;
	if (timer <= 0) {
		timer = 0;
	}
	// emito el update
	timerEmitter.emit("timerUpdate", timer);
	timerEmitter.emit("addedTime", seconds);
}
module.exports = { Start, Stop, Enable, Reset, AddTime, ToggleTimer, timerEmitter, getParameters, setRemaining };

// // arranca el timer desde el guardado en la base de datos
// function StartTimer() {
// 	if (!timerStarted && timerParameters.enabled) {
// 		// obtengo la fila de tiempo resante, si no existe creo una nueva con el start time
// 		let timerRow = db.prepare("SELECT * FROM timer WHERE timer_id = ?").get(1);
// 		if (!timerRow) {
// 			db.prepare("INSERT INTO timer (timer_id, remaining_time) VALUES (?, ?)").run(1, timerParameters.start);
// 			timerRow = db.prepare("SELECT * FROM timer WHERE timer_id = ?").get(1);
// 		}
// 		// igualo timer al remaining y calculo el nuevo tiempo final
// 		timer = timerRow.remaining_time;
// 		endTime = Date.now() + timer * 1000;
// 		// arranco el timer
// 		timerHandler = setInterval(RunTimer, 1000);
// 		timerStarted = true;
// 		SendMessageToChat("Timer started");
// 	}
// }
// // detiene el timer y envia al los clientes
// function StopTimer() {
//     clearInterval(timerHandler);
//     SendTimerStoppedToPreview();
//     TimerToWs("timerStopped", timer);
//     timerStarted = false;
//     SendMessageToChat("Timer stopped");
// }
// function EnableTimer(en) {
// 	timerParameters.enabled = en;
// 	if (timerPreviewClients && timerPreviewClients.length > 0) {
// 		timerPreviewClients.forEach((res) => res.write(`data: ${JSON.stringify({ type: "set", data: en })}\n\n`));
// 	}
// 	if (!en) {
// 		StopTimer();
// 	}
// 	db.prepare("UPDATE timer SET enabled = ? WHERE timer_id = ?").run(en ? 1 : 0, 1);
// }
// // llamada al resetear el timer
// function ResetTimer() {
// 	// igualo el timer al Start time y actualizo la base de datos
// 	timer = timerParameters.start;
// 	db.prepare("UPDATE timer SET remaining_time = ? WHERE timer_id = 1").run(timer);

// 	// calculo el nuevo tiempo final en milisegundos
// 	endTime = Date.now() + timer * 1000;
// 	// detengo el timer y envio el reset al preview
// 	clearInterval(timerHandler);
// 	timerStarted = false;
// 	SendTimerToPreview();
// 	SendTimerResetToPreview();
// 	SendTimerToWsClients();
// 	TimerToWs("timerReset", timer);
// 	SendMessageToChat("Timer reset");
// }
// // agrega tiempo al timer, recibe la cantidad ed segundos a sumar
// function AddTime(seconds) {
// 	timer = timer + seconds;
// 	// calculo el nuevo tiempo final en milisegundos
// 	endTime = endTime + seconds * 1000;
// 	if (timer <= 0) {
// 		timer = 0;
// 	}
// 	// actualizo la base de datos
// 	db.prepare("UPDATE timer SET remaining_time = ? WHERE timer_id = 1").run(timer);
// 	// lo envio al preview y al WebSocket
// 	SendTimerToPreview();
// 	SendTimerToWsClients();

// 	if (clientes.timerOverlay && clientes.timerOverlay.length > 0) {
// 		clientes.timerOverlay.forEach((c) => c.ws.send(JSON.stringify({ type: "addedTime", data: seconds })));
// 	}
// }
