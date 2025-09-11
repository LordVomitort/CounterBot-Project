const EventEmitter = require("events");
const timerEmitter = new EventEmitter();
const donothonEmitter = new EventEmitter();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Parametros de timer
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var timer,
	endTime = 0;
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
		// {id:"0",amount:0,enabled:false}
	],
	goals: [
		// {id:"0",amount:0,enabled:false}
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
		// { id: s.id, name: s.name, color: s.color, price: s.plans.find((p) => p.status == 1).price, amount: 0 }
	],
	counters: [
		// { id: 0, amount: 0 }
	],
	goals: 0,
	tips: 0,
};

function getTimer() {
	return timer;
}

function setRemaining(t) {
	timer = t;
	timerEmitter.emit("timerUpdate", timer);
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

// carga los valores base en parameters, esta funcion se va a ejecutar al iniciar el programa
function LoadBaseParameters(timerBase, baseTimes, events) {
	// base del timer y enable
	timer = timerBase.remaining_time;
	timerParameters.enabled = timerBase.enabled;
	// tiempos base
	timerParameters.start = baseTimes.start;
	timerParameters.followers = baseTimes.follower;
	timerParameters.tips = baseTimes.tip;
	// eventos
	timerParameters.event.followers = !!events.followers;
	timerParameters.event.tips = !!events.tips;
	timerParameters.event.subs = !!events.subs;
	timerParameters.event.subsOnlyShared = !!events.subs_only_shared;
	timerParameters.event.goals = !!events.goals;
	timerParameters.event.counters = !!events.counters;
}

function LoadBaseDonothonStats(baseParams, subs, counters) {
	// cargo los datos en memoria
	donothonStats.id = baseParams.id;
	donothonStats.followers = baseParams.followers;
	donothonStats.tips = baseParams.tips;
	donothonStats.goals = baseParams.goals;

	donothonStats.subs = subs;
	donothonStats.counters = counters;

	donothonEmitter.emit("donothonUpdated");
}

function LoadSubsParameters(subsList) {
	if (subsList && subsList.length > 0) {
		subsList.forEach((s) => {
			if (!timerParameters.subs.find((sub) => sub.id == s.id)) timerParameters.subs.push({ id: s.id, amount: 0, enabled: true });
		});
	} else {
		timerParameters.subs = [];
	}
}
function LoadCountersParameters(counterList) {
	timerParameters.counters = counterList;
	timerEmitter.emit("countersUpdated", timerParameters.counters);
}
function UpdateCounters(counterList, databaseDelete, databaseUpdate) {
	if (!counterList) return false;
	// creo un array de los ids en la base de datos y en timerParameters
	const countersIdMap = counterList.map((c) => c.counter_id);
	const objCountId = timerParameters.counters.map((c) => c.id);
	// creo un array de los ids a borrar de la database que no coincidan en timerParameters
	const toDelete = countersIdMap.filter((id) => !objCountId.includes(id));
	// realizo el borrado de la database
	toDelete.forEach((id) => {
		databaseDelete(id);
	});
	// relleno los valores en timerParameters
	timerParameters.counters.forEach((c) => {
		// llamo a databaseUpdate, obtiene la fila de la sub a partir de su id, si no existe la crea
		const count = databaseUpdate(c);
		// relleno los datos
		c.amount = count.amount;
		c.enabled = !!count.enabled;
	});
	timerEmitter.emit("countersUpdated", timerParameters.counters);
	return true;
}
function UpdateSubs(subsList, databaseDelete, databaseUpdate) {
	if (!subsList) return false;
	// creo un array de los ids en la base de datos y en timerParameters
	const subsIdMap = subsList.map((s) => s.sub_id);
	const objSubsId = timerParameters.subs.map((s) => s.id);
	// creo un array de los ids a borrar de la database que no coincidan en timerParameters
	const toDelete = subsIdMap.filter((id) => !objSubsId.includes(id));
	// realizo el borrado de la database
	toDelete.forEach((id) => {
		databaseDelete(id);
	});
	// relleno los valores en timerParameters
	timerParameters.subs.forEach((s) => {
		// llamo a databaseUpdate, obtiene la fila de la sub a partir de su id, si no existe la crea
		const sub = databaseUpdate(s);
		// relleno los datos
		s.amount = sub.amount;
		s.enabled = !!sub.enabled;
	});
	timerEmitter.emit("subsUpdated", timerParameters.subs);
	return true;
}

function LoadGoalsParameters(goalsList) {
	if (goalsList && goalsList.length > 0)
		goalsList.forEach((g) => {
			if (!timerParameters.goals.find((goal) => goal.id == g.id)) timerParameters.goals.push({ id: g.id, amount: 0, enabled: true });
		});
	else timerParameters.goals = [];
	timerEmitter.emit("goalsUpdated", timerParameters.goals);
}

function UpdateGoals(goalsList, databaseDelete, databeseUpdate) {
	if (!goalsList) return false;
	// creo un array de los ids en la base de datos y en timerParameters
	const goalsIdMap = goalsList.map((g) => g.goal_id);
	const objGoalsId = timerParameters.goals.map((g) => g.id);
	// creo un array de los ids a borrar de la database que no coincidan en timerParameters
	const toDelete = goalsIdMap.filter((id) => !objGoalsId.includes(id));
	// realizo el borrado de la database
	toDelete.forEach((id) => {
		databaseDelete(id);
	});
	// relleno los valores en timerParameters
	timerParameters.goals.forEach((g) => {
		// llamo a databaseUpdate, obtiene la fila del goal a partir de su id, si no existe la crea
		const goal = databeseUpdate(g);
		// relleno los datos
		g.amount = goal.amount;
		g.enabled = !!goal.enabled;
	});
	timerEmitter.emit("goalsUpdated", timerParameters.goals);
	return true;
}

const getDonothonId = () => {
	return donothonStats.id;
};

function LoadDonothonSubs(subs) {
	if (subs) {
		donothonStats.subs = subs;
		donothonEmitter.emit("subsUpdated", subs);
		return true;
	}
	donothonEmitter.emit("subsUpdateFailed");
	return false;
}

function setTimerParams(mode, params) {
	const MODES = {
		start: (prms) => {
			timerParameters.start = prms.time;
		},
		follower: (prms) => {
			setFollowersParams(prms.time, prms.enabled);
		},
		tip: (prms) => {
			setTipsParams(prms.time, prms.enabled);
		},
		subs: (prms) => {
			setSubParam(prms.id, prms.time, prms.enabled);
		},
		goals: (prms) => {
			setGoalParams(prms.id, prms.time, prms.enabled);
		},
		counters: (prms) => {
			setCounterParams(prms.id, prms.time, prms.enabled);
		},
		events: (prms) => {
			setEventsParams(prms.subs, prms.subsOnlyShared, prms.goals, prms.counters);
		},
	};
	MODES[mode](params);
}

function setFollowersParams(amount, enabled) {
	timerParameters.followers = amount;
	timerParameters.event.followers = enabled;
}
function setTipsParams(amount, enabled) {
	timerParameters.tips = amount;
	timerParameters.event.tips = enabled;
}
function setSubParam(id, amount, enabled) {
	const tS = timerParameters.subs.find((s) => s.id == id);
	if (tS) {
		tS.amount = amount;
		tS.enabled = enabled;
	}
}
function setGoalParams(id, amount, enabled) {
	const g = timerParameters.goals.find((go) => go.id == id);
	if (g) {
		g.amount = amount;
		g.enabled = enabled;
		timerEmitter.emit("goalUpdated");
	}
}
function setEventsParams(subs, subsOnlyShared, goals, count) {
	timerParameters.event.subs = subs;
	timerParameters.event.goals = goals;
	timerParameters.event.counters = count;
	timerParameters.event.subsOnlyShared = subsOnlyShared;
}
function setCounterParams(id, amount, enabled) {
	const tC = timerParameters.counters.find((c) => c.id == id);
	if (tC) {
		tC.amount = amount;
		tC.enabled = enabled;
		timerEmitter.emit("countersUpdated");
	}
}

function NewDonothonPage(donothonId, LoadDonothonCountersDatabase, LoadDonothonSubsDatabase) {
	donothonStats.id = donothonId;
	donothonStats.followers = 0;
	donothonStats.tips = 0;
	donothonStats.goals = 0;
	donothonStats.subs = [];
	donothonStats.counters = [];

	donothonStats.counters = LoadDonothonCountersDatabase(donothonId);
	donothonStats.subs = LoadDonothonSubsDatabase(donothonId);
}

function AddCounterToTimer(id, name, addCounterDatabase) {
	timerParameters.counters.push({ id: id, amount: 0, enabled: true });
	donothonStats.counters.push({ id: id, name: name, amount: 0 });
	addCounterDatabase(id, name, donothonStats.id);
	timerEmitter.emit("countersUpdated");
}
function DeleteCounterFromTimer(id, deleteDatabase) {
	donothonStats.counters = donothonStats.counters.filter((c) => c.id !== id);
	deleteDatabase(id, donothonStats.id);
	timerEmitter.emit("counterDeleted", id);
}

function ModifyCounter(id, name, updateDatabase) {
	const find = donothonStats.counters.find((c) => c.id == id);
	if (find) {
		find.name = name;
		updateDatabase(id, name, donothonStats.id);
	}
	timerEmitter.emit("countersUpdated");
}

function deleteTimerGoal(goalId, databaseDelete) {
	timerParameters.goals = timerParameters.goals.filter((fg) => fg.id !== goalId);
	databaseDelete(goalId);
	timerEmitter.emit("goalsUpdated");
}

// funcion llamada al dispararse un contador (no se llamaran si se usa !set)
// recibe el id del contador, la cantidad de unidades sumadas y un callback para actualizar la database
function TriggerCounter(id, amount, databaseUpdate) {
	if (!timerParameters.enabled || !timerParameters.event.counters) return;
	// obtengo la referencia al contador, si no existe o no esta habilidato salgo
	const c = timerParameters.counters.find((co) => co.id === id);
	if (!c || !c.enabled) return;
	// obtengo la cantidad de segundos y añado el tiempo
	const seconds = c.amount * amount;
	AddTime(seconds);
	// obtengo la referencia del contador en donothon
	const cD = donothonStats.counters.find((co) => co.id === id);
	if (cD) {
		cD.amount += amount;
		databaseUpdate(id, cD.amount, donothonStats.id);
	}
	timerEmitter.emit("countersUpdated");
}

function TriggerFollower(databaseUpdate) {
	if (!timerParameters.enabled || !timerParameters.event.followers) return;

	AddTime(timerParameters.followers ?? 0);

	donothonStats.followers += 1;
	databaseUpdate(donothonStats.followers, donothonStats.id);

	donothonEmitter.emit("followersTrigger");
}

function TriggerTip(tipAmount, databaseUpdate) {
	if (!timerParameters.enabled || !timerParameters.event.tips) return;
	const seconds = Math.floor((timerParameters.tips * tipAmount) / 1000);
	AddTime(seconds);

	donothonStats.tips += tipAmount;
	databaseUpdate(donothonStats.tips, donothonStats.id);

	donothonEmitter.emit("tipsTrigger");
}

function TriggerSubs(subId, databaseUpdate, shared) {
	if (!timerParameters.enabled || !timerParameters.event.subs || shared != timerParameters.event.subsOnlyShared) return;
	const sub = timerParameters.subs.find((s) => s.id == subId);
	if (!sub || !sub.enabled) return;
	AddTime(sub.amount);
	const dSub = donothonStats.subs.find((s) => s.id == subId);
	if (dSub) {
		dSub.amount += 1;
		databaseUpdate(subId, dSub.amount, donothonStats.id);
	}
	donothonEmitter.emit("subsTrigger");
}

function TriggerGoal(goalId, databaseUpdate) {
	if (!timerParameters.enabled || !timerParameters.event.goals) return;
	const goal = timerParameters.goals.find((g) => g.id, goalId);
	if (!goal || !goal.enabled) return;
	AddTime(goal.amount);
	donothonStats.goals += 1;
	databaseUpdate(donothonStats.goals, donothonStats.id);
	donothonEmitter.emit("goalsTrigger");
}
module.exports = {
	getTimer,
	timerParameters,
	donothonStats,
	LoadBaseParameters,
	LoadBaseDonothonStats,
	LoadSubsParameters,
	LoadCountersParameters,
	UpdateCounters,
	UpdateSubs,
	LoadGoalsParameters,
	UpdateGoals,
	AddCounterToTimer,
	DeleteCounterFromTimer,
	ModifyCounter,

	deleteTimerGoal,

	setTimerParams,
	setFollowersParams,
	setTipsParams,
	setSubParam,
	setGoalParams,
	setEventsParams,
	setCounterParams,
	Start,
	Stop,
	Enable,
	Reset,
	AddTime,
	ToggleTimer,
	setRemaining,

	getDonothonId,
	LoadDonothonSubs,

	timerEmitter,
	donothonEmitter,

	NewDonothonPage,

	TriggerCounter,
	TriggerFollower,
	TriggerTip,
	TriggerSubs,
	TriggerGoal,
};
