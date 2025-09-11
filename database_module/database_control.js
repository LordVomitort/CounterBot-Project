const { timerParameters } = require("../timer_module/timer");

var db;

function setDatabase(database) {
	if (database) db = database;
}

function getTimer(start, enabled) {
	// cargo el remaining y el timerEnabled
	// obtengo la fila de tiempo resante, si no existe creo una nueva con el start time
	let timerRow = db.prepare("SELECT * FROM timer WHERE timer_id = 1").get();
	if (!timerRow) {
		if (start != undefined && enabled != undefined) db.prepare("INSERT INTO timer (remaining_time, timer_id, enabled) VALUES (?, ?, ?)").run(start, 1, enabled ? 1 : 0);
		else db.prepare("INSERT INTO timer (remaining_time, timer_id, enabled) VALUES (?, ?, ?)").run(0, 1, 0);

		timerRow = db.prepare("SELECT * FROM timer WHERE timer_id = 1").get();
	}
	return timerRow;
}

function setTimerEnable(enable) {
	db.prepare("UPDATE timer SET enabled = ? WHERE timer_id = ?").run(enable ? 1 : 0, 1);
}

function updateTimer(time) {
	db.prepare("UPDATE timer SET remaining_time = ? WHERE timer_id = 1").run(time);
}
function setTimer(time) {
	db.prepare("UPDATE timer SET remaining_time = ? WHERE timer_id = 1").run(time);
}

function setTimerStart(time) {
	db.prepare("UPDATE timer_parameters SET start = ? WHERE id = ?").run(time, 1);
}

function setTimerParams(mode, params) {
	const MODES = {
		start: (prms) => {
			db.prepare("UPDATE timer_parameters SET start = ? WHERE id = ?").run(prms.time, 1);
		},
		follower: (prms) => {
			db.prepare("UPDATE timer_parameters SET tip = ? WHERE id = ?").run(prms.time, 1);
			db.prepare("UPDATE timer_events SET followers = ? WHERE timer_id = ?").run(prms.enabled ? 1 : 0, 1);
		},
		tip: (prms) => {
			db.prepare("UPDATE timer_parameters SET tip = ? WHERE id = ?").run(prms.time, 1);
			db.prepare("UPDATE timer_events SET tips = ? WHERE timer_id = ?").run(prms.enabled ? 1 : 0, 1);
		},
		subs: (prms) => {
			db.prepare("UPDATE timer_subs SET amount = ?, enabled = ? WHERE sub_id = ?").run(prms.time, prms.enabled ? 1 : 0, prms.id);
		},
		goals: (prms) => {
			db.prepare("UPDATE timer_goals SET amount = ?, enabled = ? WHERE goal_id = ?").run(prms.time, prms.enabled ? 1 : 0, prms.id);
		},
		counters: (prms) => {
			db.prepare("UPDATE timer_counters SET amount = ?, enabled = ? WHERE counter_id = ?").run(prms.time, prms.enabled ? 1 : 0, prms.id);
		},
		events: (prms) => {
			db.prepare("UPDATE timer_events SET subs = ?, goals = ?, counters = ?, subs_only_shared = ? WHERE timer_id = ?") //
				.run(prms.subs ? 1 : 0, prms.goals ? 1 : 0, prms.counters ? 1 : 0, prms.subsOnlyShared ? 1 : 0, 1);
		},
	};

	MODES[mode](params);
}
function getTimerBaseParams() {
	// cargo los parametros base (start, followers, tips)
	let baseTimeRow = db.prepare("SELECT * FROM timer_parameters WHERE id = ?").get(1);
	if (!baseTimeRow) {
		db.prepare("INSERT INTO timer_parameters (id) VALUES (?)").run(1);
		baseTimeRow = db.prepare("SELECT * FROM timer_parameters WHERE id = ?").get(1);
	}
	return baseTimeRow;
}
function getTimerEvents() {
	// cargo los events
	eventsRow = db.prepare("SELECT * FROM timer_events WHERE timer_id = ?").get(1);
	if (!eventsRow) {
		db.prepare("INSERT INTO timer_events (timer_id, followers, tips, subs, subs_only_shared, goals, counters) VALUES (?, ?, ?, ?, ?, ?, ?)").run(1, 1, 1, 1, 0, 1, 1);
		eventsRow = db.prepare("SELECT * FROM timer_events WHERE id = ?").get(1);
	}
	return eventsRow;
}

function getTimerCounters() {
	// cargo los id de contadores desde la database
	return db.prepare("SELECT * FROM timer_counters WHERE timer_id = ?").all(1);
}
function deleteTimerCounter(id) {
	db.prepare("DELETE FROM timer_counters WHERE counter_id = ?").run(id);
}
function updateTimerCounter(counter) {
	let idRow = db.prepare("SELECT * FROM timer_counters WHERE counter_id = ?").get(counter.id);
	if (!idRow) {
		db.prepare("INSERT INTO timer_counters (timer_id, counter_id, amount, enabled) VALUES (?, ?, ?, ?)").run(1, counter.id, counter.amount, counter.enabled ? 1 : 0);
		idRow = db.prepare("SELECT * FROM timer_counters WHERE counter_id = ?").get(counter.id);
	}
	return idRow;
}

function getLastDonothonBaseStats() {
	// cargo la ultima fila de los stats, si no hay nada agrego una default
	let donothonRow = db.prepare("SELECT * FROM donothon_stats ORDER BY id DESC LIMIT 1").get();
	if (!donothonRow) {
		const row = db.prepare("INSERT INTO donothon_stats (followers, tips, goals) VALUES (?, ?, ?)").run(0, 0, 0);
		donothonRow = db.prepare("SELECT * FROM donothon_stats WHERE id = ?").get(row.lastInsertRowid);
	}
	return donothonRow;
}

function deleteTimerGoal(goalId) {
	b.prepare("DELETE FROM timer_goals WHERE goal_id = ?").run(goalId);
}
function updateTimerGoal(goal) {
	// obtengo la fila del goal a partir de su id, si no existe la creo
	let row = db.prepare("SELECT * FROM timer_goals WHERE goal_id = ?").get(goal.id);
	if (!row) {
		db.prepare("INSERT INTO timer_goals (timer_id, goal_id, amount, enabled) VALUES (?, ?, ?, ?)").run(1, goal.id, goal.amount, goal.enabled ? 1 : 0);
		row = db.prepare("SELECT * FROM timer_goals WHERE goal_id = ?").get(goal.id);
	}
	return row;
}
function insertTimerGoal(goalId) {
	db.prepare("INSERT INTO timer_goals (goal_id, amount, enabled, timer_id) VALUES (?, ?, ?, ?)").run(goalId, 0, 1, 1);
}
function deleteTimerGoal(goalId) {
	db.prepare("DELETE FROM timer_goals WHERE goal_id = ?").run(goalId);
}

function getDonothonSubs(donothonId) {
	return db.prepare("SELECT * FROM donothon_subs WHERE donothon_id = ?").all(donothonId);
}
function deleteTimerSubs(subId) {
	db.prepare("DELETE FROM timer_subs WHERE sub_id = ?").run(subId);
}
function updateTimerSub(sub) {
	let idRow = db.prepare("SELECT * FROM timer_subs WHERE sub_id = ?").get(sub.id);
	if (!idRow) {
		db.prepare("INSERT INTO timer_subs (timer_id, sub_id, amount, enabled) VALUES (?, ?, ?, ?)").run(1, sub.id, sub.amount, sub.enabled ? 1 : 0);
		idRow = db.prepare("SELECT * FROM timer_subs WHERE sub_id = ?").get(sub.id);
	}
	return idRow;
}
function getDonothonCounters(donothonId) {
	return db.prepare("SELECT * FROM donothon_counters WHERE donothon_id = ?").all(donothonId);
}
function insertTimerDonothonCounter(id, name, donothonId) {
	db.prepare("INSERT INTO timer_counters (timer_id, counter_id, amount, enabled) VALUES (?, ?, ?, ?)").run(1, id, 0, 1);
	db.prepare("INSERT INTO donothon_counters (donothon_id, counter_id, name, amount) VALUES (?, ?, ?, ?)").run(donothonId, id, name, 0);
}
function updateDonothonCounter(counterId, name, donothonId) {
	if (db.prepare("SELECT * FROM donothon_counters WHERE donothon_id = ? AND counter_id = ?").get(donothonId, counterId)) {
		db.prepare("UPDATE donothon_counters SET name = ? WHERE donothon_id = ? AND counter_id = ?").run(name, donothonId, counterId);
	}
}

function deleteDonothonCounter(counterId, donothonId) {
	db.prepare("DELETE FROM donothon_counters WHERE donothon_id = ? AND counter_id = ?").run(donothonId, counterId);
}

function LoadDonothonCounters(counterList, donothonId) {
	// cargo la fila de los stats de contadores
	let donothonCounterRow = db.prepare("SELECT * FROM donothon_counters WHERE donothon_id = ?").all(donothonId);
	// si entro acá es porque la base de datos estaba vacia, por ende la voy a rellenar con datos nuevos, no necesito seguir procesando nada mas
	if (!donothonCounterRow || donothonCounterRow.length < 1) {
		let counters = [];
		// si la tabla está vacia inserto una nueva fila con la informacion de cada contador y vuevo a llamar a si misma para que se vuelva a leer
		counterList.forEach((c) => {
			db.prepare("INSERT INTO donothon_counters (donothon_id, counter_id, name, amount) VALUES (?, ?, ?, ?)").run(donothonId, c.id, c.name, 0);
			counters.push({ id: c.counter_id, name: c.name, amount: c.amount });
		});
		// retorno con la lista ed los contadores de donothon
		return counters;
	}
	// en caso de que no esté vacia, paso a comprovar si falta algun contador los añado a la cola para añadirlo a la database
	let missing = [];
	let update = [];
	let counters = [];
	counterList.forEach((c) => {
		const find = donothonCounterRow.find((c) => c.counter_id == c.id);
		if (!find) {
			missing.push({ id: c.id, name: c.name, amount: 0 });
			counters.push({ id: c.id, name: c.name, amount: 0 });
		} else {
			update.push({ id: c.id, name: c.name, amount: find.amount });
			counters.push({ id: c.id, name: c.name, amount: find.amount });
		}
	});
	// actualizo lo que haya para actualizar en la database
	if (update && update.length > 0) {
		update.forEach((u) => {
			db.prepare("UPDATE donothon_counters SET name = ? WHERE donothon_id = ? AND  counter_id = ?") //
				.run(u.name, donothonId, u.id);
		});
		// return db.prepare("SELECT * FROM donothon_counters WHERE donothon_id = ?").all(donothonId);
	}

	// si hay algun faltante los agrego a la database
	if (missing && missing.length > 0) {
		missing.forEach((m) => db.prepare("INSERT INTO donothon_counters (donothon_id, counter_id, name, amount) VALUES (?, ?, ?, ?)").run(donothonId, m.id, m.name, 0));
	}
	// retorno con la lista
	return counters;
}

function LoadDonothonSubs(subscriptionTiers, donothonId) {
	let donothonSubRow = db.prepare("SELECT * FROM donothon_subs WHERE donothon_id = ?").all(donothonId);
	if (!donothonSubRow || donothonSubRow.length < 1) {
		let subs = [];
		subscriptionTiers.forEach((s) => {
			db.prepare("INSERT INTO donothon_subs (donothon_id, sub_id, name, color, price, amount) VALUES (?, ?, ?, ?, ?, ?)") //
				.run(id, s.id, s.name, s.color, s.plans.find((p) => p.status == 1).price, 0);
			subs.push({ id: s.id, name: s.name, color: s.color, price: s.plans.find((p) => p.status == 1).price, amount: 0 });
		});
		return subs;
	}
	let missing = [];
	let update = [];
	let subs = [];
	subscriptionTiers.forEach((s) => {
		const find = donothonSubRow.find((r) => r.sub_id == s.id);
		if (!find) {
			subs.push({ id: s.id, name: s.name, color: s.color, price: s.plans.find((p) => p.status == 1).price, amount: 0 });
			missing.push({ id: s.id, name: s.name, color: s.color, price: s.plans.find((p) => p.status == 1).price, amount: 0 });
		} else {
			subs.push({ id: s.id, name: s.name, color: s.color, price: s.plans.find((p) => p.status == 1).price, amount: find.amount });
			update.push({ id: s.id, name: s.name, color: s.color, price: s.plans.find((p) => p.status == 1).price, amount: find.amount });
		}
	});
	if (update && update.lenght > 0) {
		update.forEach((u) => {
			db.prepare("UPDATE donothon_subs SET name = ?, color = ?, price = ? WHERE donothon_id = ? AND sub_id = ?") //
				.run(u.name, u.color, u.price, id, u.id);
		});
	}
	if (missing && missing.length > 0) {
		missing.forEach((m) => {
			db.prepare("INSERT INTO donothon_subs (donothon_id, sub_id, name, color, price, amount) VALUES (?, ?, ?, ?, ?, ?)") //
				.run(id, m.id, m.name, m.color, m.plans && m.plans.length > 0 ? m.plans.find((p) => p.status == 1).price : m.price, m.amount);
		});
	}
	return subs;
}

// funcion disparada al recibir un nuevo follower
function TriggerTimerFollower(followersAmount, donothonId) {
	db.prepare("UPDATE donothon_stats SET followers = ? WHERE id = ?").run(followersAmount, donothonId);
}
// funcion disparada al recibir un tip, recibe la cantidad en milesimas de dolar
function TriggerTimerTip(tipAmount, donothonId) {
	db.prepare("UPDATE donothon_stats SET tips = ? WHERE id = ?").run(tipAmount, donothonId);
}
// lo mismo que la funcion anterior pero aplica a los goals
function TriggerTimerGoal(goalAmount, donothonId) {
	db.prepare("UPDATE donothon_stats SET goals = ? WHERE id = ?").run(goalAmount, donothonId);
}
// funcion llamada al dispararse una Sub, recibe la id de la sub para obtener su objeto asociado
function TriggerTimerSub(subId, subAmount, donothonId) {
	db.prepare("UPDATE donothon_subs SET amount = ? WHERE donothon_id = ? AND sub_id = ?").run(subAmount, donothonId, subId);
}
// funcion llamada al dispararse un contador (no se llamaran se se usa !set)
// recibe el id del contador y la cantidad de unidades sumadas
function TriggerTimerCounter(counterId, amount, donothonId) {
	db.prepare("UPDATE donothon_counters SET amount = ? WHERE donothon_id = ? AND counter_id = ?").run(amount, donothonId, counterId);
}

function insertDonothonPage() {
	return db.prepare("INSERT INTO donothon_stats (followers, tips, goals) VALUES (?, ?, ?)").run(0, 0, 0).lastInsertRowid;
}

module.exports = {
	setDatabase,

	getTimer,
	getTimerBaseParams,
	getTimerEvents,

	updateTimer,
	setTimer,
	setTimerEnable,
	setTimerStart,

	setTimerParams,

	getTimerCounters,
	deleteTimerCounter,
	updateTimerCounter,

	getLastDonothonBaseStats,

	deleteTimerGoal,
	updateTimerGoal,
	insertTimerGoal,

	getDonothonSubs,
	deleteTimerSubs,
	updateTimerSub,

	LoadDonothonCounters,
	getDonothonCounters,
	insertTimerDonothonCounter,
	updateDonothonCounter,
	deleteDonothonCounter,

	LoadDonothonSubs,

	TriggerTimerFollower,
	TriggerTimerTip,
	TriggerTimerGoal,
	TriggerTimerSub,
	TriggerTimerCounter,

	insertDonothonPage,
};
