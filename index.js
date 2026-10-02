const { path, join } = require("path");
const fs = require("fs");
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const axios = require("axios");
const cors = require("cors");

const timer = require("./timer_module/timer");
const database = require("./database_module/database_control");

// const { type } = require("express/lib/response");
// const { time } = require("console");
// const { deserialize } = require("v8");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const carpeta = join(__dirname, "/db");
fs.mkdirSync(carpeta, { recursive: true });

const db = require("./db/database");

database.setDatabase(db);

const CONFIG_PATH = "config.json";
var OVERLAYSTYLE_PATH = "overlayConfig.json";

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Parametros de Fansly
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var fanslyChatWs;
var fanslyWs;
var FanslyAccess = {
	token: null,
	chatRoomId: null,
	id: null,
};

var subscriptionTiers = [];
var fanslyGoalsReady = false;
var fanslyGoals = [];
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Parametros de comandos
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const HEARTBEAT_INTERVAL = 20000; // cada 2 s enviamos “p”
const HEARTBEAT_TIMEOUT = 4000; // si no hay respuesta en 4 s, asumimos desconexión

var fanslyWsHeartbeat;
var fanslyChatWsHeartbeat;
var disconnectTimer;

var FanslyAllowedNames = [];
var FanslyChatCommandMode = "all";
var FanslyBlacklist = [];

var FanslyCommands = [
	// { command: "!c", type: "counter" },
	// { command: "!set", type: "config" },
	// { command: "!continue", type: "config" },
	// { command: "!new session", type: "config" },
	// { command: "!counter list", type: "info" },
];

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Parametros de contadores
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// lista de contadores, almacena nombre, id, valor, fecha mejor global y mensual, y nombre y valor de variables asociadas
var counterList = [
	{
		name: "counter",
		shortcut: "c",
		id: 1,
		active: true,
		value: 0,
		bestDate: "",
		monthBestDate: "",
		varList: [
			{ name: "counterBest", value: 0 },
			{ name: "counterActualBest", value: 0 },
			{ name: "counterTotal", value: 0 },
			{ name: "counterMonthBest", value: 0 },
			{ name: "counterMonthActualBest", value: 0 },
			{ name: "counterMonthTotal", value: 0 },
		],
	},
];

// id de la sesion, id del mes y fecha de la sesion actual
var currentSessionId;
var currentMonthId;
var currentSessionDate;

// flag para indicar que la sesion se inició
var sessionStarted = false;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	Conexiones y clientes
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// webSockets
var clientes = {
	overlay: [],
	controllPanel: null,
	timerOverlay: [],
};

const TIMERPING_INTERVAL = 40000;
const TIMERDISCONNECT_INTERVAL = 4000;

var overlayPreviewClients = [];
var counterStatsClients = [];

var timerPreviewClients = [];
var timerAddingsClients = [];
var donothonClients = [];

var configOverlay = {
	width: 500,
	height: 500,
	backgroundColor: "rgba(0, 0, 0, 0.7)",
	border: 0,
	borderRadius: 15,
	background: true,
	labels: [],
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Fuentes
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// lista de fuentes de Google
// usada para ser cargada solo una vez en memoria asi ahorrar llamadas a la API
var fontList = [];

/*
--------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------

	ACÁ INICIA EL PROGRAMA

--------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------
*/

process.on("uncaughtException", (err) => {
	const msg = `[${new Date().toISOString()}] Uncaught Exception:\n${err.stack}\n\n`;
	fs.appendFileSync("crash.log", msg);
	console.error(msg);
});

process.on("unhandledRejection", (reason, promise) => {
	const msg = `[${new Date().toISOString()}] Unhandled Rejection:\n${reason}\n\n`;
	fs.appendFileSync("crash.log", msg);
	console.error(msg);
});

app.use(express.static(join(__dirname, "/dist")));

server.listen(3000, () => {
	console.log("\n\nServer running at http://localhost:3000\n\n");
});

app.use(express.json());
app.use(express.static("public"));
app.use("/media", express.static("media"));
app.use(cors());

// cargo las fuentes en memoria
LoadFonts();

// si no existe el archivo de configuracion creo uno nuevo con new config
if (!fs.existsSync(CONFIG_PATH)) {
	NewConfig();
	console.log("New config file created");
}
if (!fs.existsSync(OVERLAYSTYLE_PATH)) {
	fs.writeFileSync(OVERLAYSTYLE_PATH, JSON.stringify(configOverlay, null, 4));
	console.log("New Overlay Config created");
}

CheckAccessMode();
LoadCommandsList();

LoadCounterList();
CheckGlobalTable();
CheckMonthlyTable();

if (fs.existsSync(OVERLAYSTYLE_PATH)) {
	(async () => {
		await loadOverlayConfig();
	})();
}

LoadTimerDatabase();

LoadDonothonDatabase();

function deepParse(obj) {
	if (typeof obj === "string") {
		try {
			const parsed = JSON.parse(obj);
			if (typeof parsed === "number") {
				return obj;
			}
			return deepParse(parsed); // seguir parseando por si es JSON dentro de JSON
		} catch {
			return obj; // no es un JSON válido → dejar como string
		}
	} else if (Array.isArray(obj)) {
		return obj.map(deepParse);
	} else if (typeof obj === "object" && obj !== null) {
		const result = {};
		for (const [key, value] of Object.entries(obj)) {
			result[key] = deepParse(value);
		}
		return result;
	}
	return obj;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------------------------------------
//
// WebSocket del panel de control y del overlay
//
//---------------------------------------------------------------------------------------------------------

wss.on("connection", (ws) => {
	ws.on("message", (message) => {
		const _data = JSON.parse(message);
		//guardamos el cliente en la lista segun su tipo
		if (_data.tipo === "overlay") {
			clientes.overlay.push = ws;
			if (configOverlay.height && configOverlay.width) {
				ws.send(
					JSON.stringify({
						type: "sizeConfig",
						data: {
							width: configOverlay.width,
							height: configOverlay.height,
						},
					})
				);
			}
			console.log("Overlay connected");
			enviarInfo();
		} else if (_data.type === "timerOverlay") {
			HandleWSTimer(ws, _data, clientes.timerOverlay);
			SendTimerToWsClients();
		}
	});

	ws.on("close", () => {
		if (ws === clientes.overlay.includes(ws)) clientes.overlay = clientes.overlay.filter((c) => c !== ws);
		if (ws === clientes.controllPanel) clientes.controllPanel = null;
		if (clientes.timerOverlay && clientes.timerOverlay.length > 0 && ws === clientes.timerOverlay.find((w) => w.ws == ws))
			//
			clientes.timerOverlay = clientes.timerOverlay.filter((w) => w.ws !== ws);
	});
});

function HandleWSTimer(ws = null, data, clList) {
	if (ws && ws.readyState === WebSocket.OPEN)
		if (data.data === "connect") {
			//

			ws.send(JSON.stringify({ type: "connectPing", data: { ping: TIMERPING_INTERVAL, disconnect: TIMERDISCONNECT_INTERVAL } }));
			// set timeout
			const interval = setTimeout(() => {
				ws.close(1001);
			}, TIMERPING_INTERVAL + TIMERDISCONNECT_INTERVAL);

			clList.push({ ws: ws, ping: interval });
			console.log("Timer Overlay connected");
		} else if (data.data === "p") {
			// reset timeout
			const cliente = clList.find((c) => c.ws == ws);
			if (cliente) {
				try {
					clearTimeout(cliente.ping);
				} catch (e) {}
				cliente.ping = setTimeout(() => {
					cliente.ws.close(1001);
				}, TIMERPING_INTERVAL + TIMERDISCONNECT_INTERVAL);
				ws.send(JSON.stringify({ type: "ping" }));
			}
		}
}

//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
//
// Carga fuentes
//
//------------------------------------------------------------------------------------
async function LoadFonts() {
	console.log("Loading Google fonts...");
	let list;
	fetch("https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=")
		.then((response) => response.json())
		.then((data) => {
			list = data.items.map((item) => {
				let familyName = item.family;
				let value = familyName.replace(/ /g, "+");

				if (Array.isArray(item.variants) && item.variants.length > 0) {
					value += ":" + item.variants.join(",");
				}
				return {
					family: familyName,
					value,
				};
			});
			fontList = list;
			console.log("Fonts loaded");
			return list;
		})
		.catch((e) => {
			console.error("Error getting Google Fonts", e);
		});
}

//------------------------------------------------------------------------------------
// Nuevo archivo de configuracion
//------------------------------------------------------------------------------------
function NewConfig() {
	fs.writeFileSync(
		CONFIG_PATH,
		JSON.stringify(
			{
				mode: "mod",
				allowedNames: [],
				blacklist: [],
			},
			null,
			4
		)
	);
}

// lee el modo de comandos, la lista permitida y la prohibida desde el archivo de configuracion
function CheckAccessMode() {
	console.log("Loading modes...");
	let configData;
	try {
		configData = fs.readFileSync(CONFIG_PATH, "utf-8");
		configData = JSON.parse(configData);
	} catch (er) {
		console.error("Error reading config file", er);
		return;
	}

	FanslyChatCommandMode = configData.mode;
	FanslyAllowedNames = configData.allowedNames;
	FanslyBlacklist = configData.blacklist;
	console.log("Modes loaded");
}

// modifica solo el modo de comandos
function ChangeAccessMode(mode) {
	let configData;
	try {
		configData = fs.readFileSync(CONFIG_PATH, "utf-8");
		configData = JSON.parse(configData);
	} catch (er) {
		console.error("Error reading for update config file", er);
		return;
	}

	FanslyChatCommandMode = mode;
	configData.mode = mode;

	fs.writeFileSync(CONFIG_PATH, JSON.stringify(configData, null, 4));
}
// modifica la lista de nombres permitidos para usar los comandos
function ChangeAccessNames(userList) {
	let configData;
	try {
		configData = fs.readFileSync(CONFIG_PATH, "utf-8");
		configData = JSON.parse(configData);
	} catch (er) {
		console.error("Error reading for update config file", er);
		return;
	}
	FanslyAllowedNames = userList;
	configData.allowedNames = userList;

	fs.writeFileSync(CONFIG_PATH, JSON.stringify(configData, null, 4));
}
// modifica la lista de nombres prohibidos para usar los comandos
function ChangeBlacklistNames(userList) {
	let configData;
	try {
		configData = fs.readFileSync(CONFIG_PATH, "utf-8");
		configData = JSON.parse(configData);
	} catch (er) {
		console.error("Error reading for update config file", er);
		return;
	}
	FanslyBlacklist = userList;
	configData.blacklist = userList;

	fs.writeFileSync(CONFIG_PATH, JSON.stringify(configData, null, 4));
}

// carga la lista de comandos desde la base de datos
function LoadCommandsList() {
	console.log("Loading commands database...");
	CheckCommandsList();

	const commandsRow = db.prepare("SELECT * FROM commands").all();
	FanslyCommands = commandsRow.map((c) => {
		return { command: c.command, shortcut: c.shortcut, type: c.type, functionName: c.functionName, functionParams: c.params, description: c.description };
	});
	console.log("Commands loaded");
}

// comprueba que existan los comandos en la tabla
function CheckCommandsList() {
	const commands = [
		{
			command: "count",
			shortcut: "c",
			type: "counter",
			functionName: "CountCommand",
			functionParams: null,
			description:
				"Adds a specific amount to a selected counter. Accepts as parameters one or more counter names or shortcuts followed by the amount to be added. If no params are provided, it will add 1 to the default counter. If the amount is not specified, it will add 1 to the specified counter. If (--continue) is added to the end, it will continue from the last session.",
		},
		{
			command: "set",
			shortcut: null,
			type: "counter",
			functionName: "CountCommand",
			functionParams: "set",
			description:
				"Sets a specific counter to a number. Accepts as parameters one or more counter names or shortcuts followed by the amount to be added. If no params are provided, it will add 1 to the default counter. If the amount is not specified, it will add 1 to the specified counter. By default, if no session was started, it will continue from the last session. If (--new) is added to the end, it will start a new session.",
		},
		{ command: "continue", shortcut: null, type: "config", functionName: "ContinueSession", functionParams: null, description: "Continue from the last session" },
		{ command: "newsession", shortcut: null, type: "config", functionName: "StartNewSession", functionParams: null, description: "Starts a new session" },
		{ command: "counterlist", shortcut: "cl", type: "info", functionName: "SendCounterListToChat", functionParams: null, description: "Gets the list of all the available counter names" },
		{ command: "commandlist", shortcut: "cml", type: "info", functionName: "SendCommandListToChat", functionParams: null, description: "Shows the list of available commands to the chat" },
		{ command: "startTimer", shortcut: "startT", type: "timer", functionName: "StartTimer", functionParams: null, description: "Starts running the donothon timer" },
		{ command: "stopTimer", shortcut: "stopT", type: "timer", functionName: "StopTimer", functionParams: null, description: "Stops running the donothon timer" },
		{ command: "enableTimer", shortcut: null, type: "timer", functionName: "EnableTimer", functionParams: null, description: "Enables the donothon timer and it's interactions" },
		{ command: "disableTimer", shortcut: null, type: "timer", functionName: "DisableTimer", functionParams: null, description: "Disable the donothon timer and it's interactions" },
		{ command: "addTime", shortcut: null, type: "timer", functionName: "AddTime", functionParams: null, description: "Adds the specified amount of seconds to the donothon timer" },
	];

	// obtengo la lista de comandos que hay
	let commandsRows = db.prepare("SELECT * FROM commands").all();
	if (!commandsRows) console.log("Commands database empty. Creating new list...");
	// creo un set con los elementos que no esten en la tabla
	const commandsSet = new Set(commandsRows.map((c) => c.command));
	// inserto los comandos que no estén
	commandsRows = db.prepare("INSERT OR IGNORE INTO commands (command, shortcut, type, functionName, params, description) VALUES (?, ?, ?, ?, ?, ?)");
	for (const c of commands) {
		if (!commandsSet.has(c.command)) {
			commandsRows.run(c.command, c.shortcut, c.type, c.functionName, c.functionParams, c.description);
		}
	}
}

// fucion para cargar la lista de contadores
function LoadCounterList() {
	console.log("Loading counters list...");
	const suffixes = ["Total", "Best", "ActualBest", "MonthTotal", "MonthBest", "MonthActualBest"];
	// obtengo la cantidad de lineas para saber si la tabla de contadores está vacia o no
	let counters = db.prepare("SELECT COUNT(*) AS total FROM counters").get();
	// si está vacia inserto el contador counter con id 1
	if (counters.total == 0) {
		console.log("Counters list empty. Creating new list...");
		db.prepare("INSERT INTO counters (id, name, shortcut) VALUES (?, ?, ?)").run(1, "counter", "c");
	}

	// leo el contenido de la tabla en orden por id
	counters = db.prepare("SELECT id, name, shortcut FROM counters ORDER BY id").all();

	// cargo la posicion 0 de counterList con el primero elemento de la tabla el cual es el contador default
	counterList[0].name = counters[0].name;
	counterList[0].shortcut = counters[0].shortcut;
	counterList[0].varList = suffixes.map((suffix) => {
		return { name: `${counters[0].name}${suffix}`, value: 0 };
	});

	// filtro el primer elemento de la tabla para recorrer el resto de los elementos
	counters = counters.filter((c) => c.id !== 1);
	// agrego los demas elementos a counterList
	if (counters.length > 0) {
		counters.map((c) => {
			counterList.push({
				name: c.name,
				shortcut: c.shortcut,
				id: c.id,
				value: 0,
				bestDate: "",
				monthBestDate: "",
				varList: suffixes.map((suffix) => {
					return { name: `${c.name}${suffix}`, value: 0 };
				}),
			});
		});
	}

	const fecha = fechaHoy();
	let monthRow = db.prepare("SELECT id FROM months WHERE month_label = ?").get(fecha.substring(0, 7));
	if (!monthRow) {
		const insertedRow = db.prepare("INSERT INTO months (month_label) VALUES (?)").run(fecha.substring(0, 7));
		monthRow = db.prepare("SELECT id FROM months WHERE month_label = ?").get(fecha.substring(0, 7));
	}
	counterList.map((c) => {
		if (!db.prepare("SELECT * FROM counter_stats_global WHERE counter_id = ?").get(c.id)) {
			db.prepare("INSERT INTO counter_stats_global (counter_id, best_date) VALUES (?, ?)").run(c.id, fecha);
		}

		if (!db.prepare("SELECT * FROM counter_stats_monthly WHERE counter_id = ? AND month_id = ?").get(c.id, monthRow.id)) {
			db.prepare("INSERT INTO counter_stats_monthly (counter_id, month_id, best_date) VALUES (?, ?, ?)").run(c.id, monthRow.id, fecha);
		}
	});
	console.log("Counters list loaded");
}

// carga configuracion del overlay
async function loadOverlayConfig() {
	try {
		var _overlayString = await fs.promises.readFile(OVERLAYSTYLE_PATH, "utf-8");
	} catch (er) {
		console.error("ERROR opening overlayConfig file for storage", er);
		return;
	}
	try {
		var _overlayJson = JSON.parse(_overlayString);
	} catch (er) {
		console.error("ERROR parsing overlayConfig file", er);
		return;
	}

	let bModificado = false;
	for (let key of Object.keys(configOverlay)) {
		if (!_overlayJson.hasOwnProperty(key)) {
			_overlayJson = { ..._overlayJson, [key]: configOverlay[key] };
			bModificado = true;
		}
	}

	configOverlay = _overlayJson;
	if (bModificado) {
		try {
			await fs.promises.writeFile(OVERLAYSTYLE_PATH, JSON.stringify(_overlayJson, null, 4));
		} catch (er) {
			console.error("ERROR updating overlayConfig file", er);
			return;
		}
	}
}

// carga los datos guardados en la database en timer
function LoadTimerDatabase() {
	console.log("Loading timer database...");

	//guardo los datos base en timer
	timer.LoadBaseParameters(database.getTimer(), database.getTimerBaseParams(), database.getTimerEvents());
	// cargo la info de los contadores
	let cList = [];
	counterList.forEach((c) => cList.push({ id: c.id, amount: 0, enabled: true }));
	// cList no puede ser menor que 1 ya que siempre existe 1 constador
	if (!cList || cList.length < 1) throw new Error("missing default counter");
	timer.LoadCountersParameters(cList);

	// cargo los datos completos de contadores en timer
	timer.UpdateCounters(database.getTimerCounters(), database.deleteTimerCounter, database.updateTimerCounter);

	console.log("Timer loaded");
}

// funcion para cargar la informacion del donothon en la database
function LoadDonothonDatabase() {
	console.log("Loading donothon stats database...");
	// cargo la ultima fila de los stats, si no hay nada agrego una default
	let donothonRow = database.getLastDonothonBaseStats();

	// compruebo si hay datos de subs, so los hay los cargo en memoria
	let donothonSubRow = database.getDonothonSubs(donothonRow.id);
	let subs = [];
	if (donothonSubRow && donothonSubRow.length > 0) {
		donothonSubRow.forEach((sR) => subs.push({ id: sR.sub_id, name: sR.name, color: sR.color, price: sR.price, amount: sR.amount }));
	}
	// cargo la informacion de los contadores del donothon
	timer.LoadBaseDonothonStats(donothonRow, subs, LoadDonothonCountersDatabase(donothonRow.id));

	console.log("Donothon database loaded");
}

// funcion para cargar los stats de los contadores en el donothon, es una funcion recursiva
// en el donothon se van a almacenar todos los contadores que hay
function LoadDonothonCountersDatabase(id) {
	return database.LoadDonothonCounters(counterList, id);
}
function LoadDonothonSubsDatabase(id) {
	return database.LoadDonothonSubs(subscriptionTiers, id);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------------------------------------
//
// Seccion funciones del registro de contadores en base de datos
//
//---------------------------------------------------------------------------------------------------------

async function setOverlaySize(jsonInfo) {
	try {
		var _overlayString = await fs.promises.readFile(OVERLAYSTYLE_PATH, "utf-8");
	} catch (er) {
		console.error("ERROR opening overlayConfig file for storage", er);
		return;
	}
	try {
		var _overlayJson = JSON.parse(_overlayString);
	} catch (er) {
		console.error("ERROR parsing overlayConfig file", er);
		return;
	}
	configOverlay = _overlayJson;
	if (jsonInfo) {
		if (jsonInfo.height) {
			configOverlay.height = parseInt(jsonInfo.height);
		}
		if (jsonInfo.width) {
			configOverlay.width = parseInt(jsonInfo.width);
		}

		try {
			await fs.promises.writeFile(OVERLAYSTYLE_PATH, JSON.stringify(configOverlay, null, 4));
		} catch (er) {
			console.error("ERROR updating overlayConfig file", er);
			return;
		}
	}
}

// compruebo y cargo la tabla de contadores globales
function CheckGlobalTable() {
	console.log("Loading gobal stats...");
	// compruebo si la tabla tiene contenido, de no tenerlo inserto una linea con cada contador disponible y la fecha actual en el best
	let global = db.prepare("SELECT COUNT(*) AS total FROM counter_stats_global").get();
	if (global.total != counterList.length) {
		counterList.map((c) => {
			db.prepare("INSERT INTO counter_stats_global (counter_id, best_date) VALUES	(?, ?)").run(c.id, fechaHoy());
		});
	}
	// obtengo un LEFT JOIN entre los contadores disponibles y el contenido de global
	global = db
		.prepare(
			`
		SELECT 	c.id			AS	counter_id,
				c.name			AS	counter_name,
				IFNULL(g.total,			0)	AS	total_global,
				IFNULL(g.actual_best,	0)	AS	actual_best_global,
				IFNULL(g.best,			0)	AS	best,
				IFNULL(g.best_date,		'')	AS	best_date
				FROM counters AS c LEFT JOIN counter_stats_global AS g
				ON g.counter_id = c.id	ORDER BY c.id`
		)
		.all();
	// pueblo los datos de las variables globales asociadas de cada contador
	global.map((g) => {
		const c = counterList.find((co) => co.id === g.counter_id);

		c.varList.find((vl) => vl.name.includes("Total")).value = g.total_global;
		c.varList.find((vl) => vl.name.includes("ActualBest")).value = g.actual_best_global;
		c.varList.find((vl) => vl.name.includes("Best")).value = g.best;
		c.bestDate = g.best_date;
	});
	console.log("Global stats loaded");
}
// lo mismo para la tabla de contadores mensuales
function CheckMonthlyTable() {
	// let month = db.prepare("SELECT COUNT(*) AS total FROM months").get();
	// if (month.total === 0) {
	// 	db.prepare("INSERT INTO months (month_label) VALUES (?)").run(fechaHoy().substring(0, 7));
	// }
	console.log("Loading month stats...");
	let monthRow = db.prepare("SELECT id FROM months WHERE month_label = ?").get(fechaHoy().substring(0, 7));
	let currMonthId = monthRow ? monthRow.id : null;

	if (!currMonthId) {
		const i = db.prepare("INSERT INTO months (month_label) VALUES (?)").run(fechaHoy().substring(0, 7));
		currMonthId = i.lastInsertRowid;
	}

	const month = db.prepare("SELECT COUNT(*) AS total FROM counter_stats_monthly WHERE month_id = ?").get(currMonthId);
	if (month.total != counterList.length) {
		counterList.map((c) => {
			db.prepare("INSERT INTO counter_stats_monthly (counter_id, month_id, best_date) VALUES (?, ?, ?)").run(c.id, currMonthId, fechaHoy());
		});
	}
	const statsMonthly = db
		.prepare(
			`
		SELECT	c.id						AS	counter_id,
				IFNULL(m.total,			0)	AS	total_month,
				IFNULL(m.best,			0)	AS	best_month,
				IFNULL(m.actual_best,	0)	AS	actual_best_month,
				IFNULL(m.best_date,		'')	AS	best_date_month
			FROM 		counters				AS		c
			LEFT JOIN	counter_stats_monthly	AS 		m
			ON			m.counter_id = c.id 	AND		m.month_id = ?
			ORDER BY 	c.id`
		)
		.all(currMonthId);

	if (statsMonthly && statsMonthly.length > 0) {
		statsMonthly.map((sm) => {
			const c = counterList.find((co) => co.id === sm.counter_id);

			c.varList.find((vl) => vl.name.includes("MonthTotal")).value = sm.total_month;
			c.varList.find((vl) => vl.name.includes("MonthBest")).value = sm.best_month;
			c.varList.find((vl) => vl.name.includes("MonthActualBest")).value = sm.actual_best_month;
			c.monthBestDate = sm.best_date_month;
		});
		console.log("Month stats loaded");
	}
}

function StartNewSession() {
	const fecha = fechaHoy();

	// tabla de mes
	// inserto o ignoro en caso de que exista el mes actual y obtengo su id
	db.prepare("INSERT OR IGNORE INTO months (month_label) VALUES (?)").run(fecha.substring(0, 7));
	let monthRow = db.prepare("SELECT id FROM months WHERE month_label = ?").get(fecha.substring(0, 7));
	if (monthRow) {
		// almaceno el id del mes en memoria
		currentMonthId = monthRow.id;
		// inserto una nueva sesion
		const sessionRow = db.prepare("INSERT INTO sessions (month_id, session_date) VALUES (?, ?)").run(monthRow.id, fecha);
		if (sessionRow) {
			// almaceno su id y la fecha
			currentSessionId = sessionRow.lastInsertRowid;
			currentSessionDate = fecha;
			// marco el flag como sesion iniciada
			sessionStarted = true;
		}
	}

	// intercambio los best por actualBest
	const globalInsert = db.prepare("UPDATE counter_stats_global SET best = ? WHERE counter_id = ?");
	const monthlyInsert = db.prepare("UPDATE counter_stats_monthly SET best = ? WHERE counter_id = ? AND month_id = ?");
	// recorro la lista de contadores
	counterList.map((c) => {
		// obtengo su valor de de actualBest y lo guardo en best de la tabla y en memoria
		let value = c.varList.find((v) => v.name.includes("ActualBest") && !v.name.includes("Month")).value;
		globalInsert.run(value, c.id);
		c.varList.find((v) => v.name.includes("Best") && !v.name.includes("Actual") && !v.name.includes("Month")).value = value;
		// lo mismo para month
		value = c.varList.find((v) => v.name.includes("MonthActualBest")).value;
		monthlyInsert.run(value, c.id, currentMonthId);
		c.varList.find((v) => v.name.includes("MonthBest")).value = value;
		c.value = 0;
	});

	enviarInfo();
	sendToCounterStats();
	SendCountersToPreview();
	SendCountersToTimerClients();
}

function ContinueSession() {
	// cargo la fila de months
	const monthRow = db.prepare("SELECT id FROM months ORDER BY month_label DESC LIMIT 1").get();
	if (monthRow) {
		// almaceno el month id
		currentMonthId = monthRow.id;
		// obtengo la fila de la sesion a continuar
		const sessionRow = db.prepare("SELECT id, session_date FROM sessions WHERE month_id = ? ORDER BY session_date DESC, id DESC LIMIT 1").get(monthRow.id);
		if (sessionRow) {
			// guardo el id y la fecha
			currentSessionId = sessionRow.id;
			currentSessionDate = sessionRow.session_date;
			// obtengo la lista de valores por contador de la ultima sesion
			const sessionCountersRows = db.prepare("SELECT counter_id, value FROM session_counters WHERE session_id = ?").all(currentSessionId);
			// los cargo en memoria
			sessionCountersRows.map((sR) => {
				counterList.find((c) => c.id === sR.counter_id).value = sR.value;
			});
			// marco el flag como sesion iniciada
			sessionStarted = true;
		}
	}

	enviarInfo();
	sendToCounterStats();
	SendCountersToPreview();
	SendCountersToTimerClients();
}

function ProcessCounterCommand(commandString, modeSet) {
	// esta función recibe el string del comando DESPUES del comando en si, sin incluir el comando
	// divide y reconoce las partes del string
	// FORMATO nombre/abreviacion candidad ...(se puede repetir para todos los contadores disponibles) --continue(opcional)
	// si el formato está incorrecto devolvera que es incorrecto para mostrarlo en el chat

	// separo el strign en tokens
	let tokens = commandString.trim().split(/\s+/);

	let newSession;
	// determino si se indica para continuar la sesion o iniciar una nueva
	if (modeSet != "set") {
		newSession = true;
		if (tokens.includes("--continue")) {
			// elimino el token de continue
			tokens.splice(
				tokens.findIndex((t) => t === "--continue"),
				1
			);
			newSession = false;
		}
	} else {
		newSession = false;
		if (tokens.includes("--new")) {
			// elimino el token de continue
			tokens.splice(
				tokens.findIndex((t) => t === "--new"),
				1
			);
			newSession = true;
		}
	}

	const isInteger = (s) => /^-?\d+$/.test(s); // determina si es entero
	let error = false;
	let errors;
	const items = []; // lista de items encontrados
	let i = 0;
	if (tokens[0] !== undefined && tokens[0] !== "" && !(tokens.length == 1 && isInteger(tokens[0]))) {
		while (i < tokens.length) {
			// almaceno el token que se está procesando
			const nameToken = tokens[i];
			const entero = isInteger(tokens[i]);
			// si es un numero indico que es error y corto el bucle
			if (entero) {
				if (i != 0) {
					console.log("Number without an assigned counter");
					error = true;
					errors = `Incorrect syntax: number not assigned to anything: "${tokens[i]}"`;
					break;
				} else {
				}
			}
			// cuento la cantidad a sumar de cada contador que aparezca
			// si no se indica se supone 1
			let amount = 1;
			if (i + 1 < tokens.length && isInteger(tokens[i + 1])) {
				amount = parseInt(tokens[i + 1], 10);
				i += 2;
			} else {
				i += 1;
			}
			// compruebo que sea un contador correcto
			const co = counterList.find((c) => c.name === nameToken || c.shortcut === nameToken);
			if (co) {
				items.push({ id: co.id, amount: amount });
			} else {
				console.log("Invalid Counter");
				error = true;
				errors = `Incorrect syntax: incorrect counter name/shortcut: "${nameToken}"`;
				break;
			}
		}
	} else {
		if (tokens[0] == undefined || tokens[0] == "") items.push({ id: 1, amount: 1 });
		else items.push({ id: 1, amount: parseInt(tokens[0], 10) });
	}

	// en caso de no haber errores continuo con la siguiente funcion
	// le envio el array de items encontrado y si hay que crear una nueva sesion o no
	if (!error) {
		if (modeSet) {
			items.map((it) => {
				it.amount -= counterList.find((c) => c.id === it.id).value;
			});
		}
		CounterCommand(items, newSession, modeSet == "set");
	} else {
		SendMessageToChat(errors);
	}
}

// funcion que toma un array con los ids de los contadores a calcular y la cantidad de cada uno
// command = [{id, amount}]
function CounterCommand(command, newSession = true, isSet = false) {
	// 1) verifico si hay sesion y creo nueva o continuo la anterior
	// 1.5) almaceno los best anteriores
	// 2) itero por los contadores a calcular

	// 1) verificar si hay sesion y crear una nueva
	if (newSession && !sessionStarted) {
		StartNewSession();
		// console.log("sessionId: ", currentSessionId, "monthId: ", currentMonthId);
	}

	// si hay que continuar la sesion anterior
	if (!newSession && !sessionStarted) {
		ContinueSession();
		// console.log("sessionId: ", currentSessionId, "monthId: ", currentMonthId);
	}

	// 2) itero por los contadores a calcular
	// si la sesion está iniciada continuo, recorro la lista de comandos de contador recibidos
	// y llamo a Count con la informacion de cada uno
	if (sessionStarted) {
		if (command && command.length > 0) {
			command.map((comm) => {
				Count(comm.id, comm.amount);
				const c = counterList.find((c) => comm.id);
				if (c) SendMessageToChat(`${c.name}: ${c.value}`);
				if (!isSet && timer.timerParameters.event.counters) {
					timer.TriggerCounter(comm.id, comm.amount, database.TriggerTimerCounter);
				}
			});
		}
	}

	enviarInfo();
	sendToCounterStats();
	SendCountersToPreview();
	SendCountersToTimerClients();
}

// funcion para calcular un contador especifico por id y un amount
function Count(counterId, amount) {
	// obtengo el contador a partir del nombre
	const contador = counterList.find((c) => c.id === counterId);
	const index = counterList.findIndex((c) => c.id === counterId);

	if (!contador) return;
	// realizo la suma y lo guardo en una variable, evito que sea negativo
	let value = contador.value + amount;
	if (value < 0) value = 0;

	// obtengo el indice de la variable total
	const totalIndex = contador.varList.findIndex((v) => v.name.includes("Total") && !v.name.includes("Month"));
	// realizo la suma y lo guardo en una variable, evito que sea negativo
	let totalValue = contador.varList[totalIndex].value + amount;
	if (totalValue < 0) totalValue = 0;

	// obtengo el indice de la variable monthTotal
	const monthTotalIndex = contador.varList.findIndex((v) => v.name.includes("MonthTotal"));
	// realizo la suma y lo guardo en una variable, evito que sea negativo
	let monthTotalValue = contador.varList[monthTotalIndex].value + amount;
	if (monthTotalValue < 0) monthTotalValue = 0;

	// obtengo el indice del actualBest global
	const bestIndex = contador.varList.findIndex((v) => v.name.includes("ActualBest") && !v.name.includes("Month"));
	// creo las variables para el best y bestdate, si best es undefined quiere decir que no hay valor best
	let best;
	let bestDate;

	// obtengo el indice del actualBest mensual
	const monthBestIndex = contador.varList.findIndex((v) => v.name.includes("MonthActualBest"));
	// creo las variables para el best y bestdate, si best es undefined quiere decir que no hay valor best
	let monthBest;
	let monthBestDate;

	// guardo los valores en memoria
	contador.value = value;
	contador.varList[totalIndex].value = totalValue;
	contador.varList[monthTotalIndex].value = monthTotalValue;
	// guardo el valor del contador en la tabla de contadores por sesion
	db.prepare(
		`INSERT INTO session_counters (session_id, counter_id, value) VALUES (?, ?, ?) 
		ON CONFLICT(session_id, counter_id) DO UPDATE SET value = excluded.value`
	).run(currentSessionId, counterId, value);

	// compruebo si se tiene que restar (amount negativo) para poder recalcular el best en consecuencia
	// si amount es positivo se comprueba si value es mas alto que el anterior best
	if (amount < 0) {
		// obtengo un join de la tabla de contadores por sesion y todas las sesiones
		// se ordena de forma descendente de forma que el primer valor sea el mas alto y se limita la salida a 1 solo valor
		const bestGlobalRow = db
			.prepare(
				`
			SELECT	sc.value		AS		best_value,
					s.session_date	AS		best_date,
					s.id			AS		best_id
			FROM	session_counters	AS	sc
			JOIN	sessions			AS	s
			ON		sc.session_id	=	s.id
			WHERE	sc.counter_id	=	?
			ORDER BY	sc.value DESC, s.session_date DESC
			LIMIT 1`
			)
			.get(counterId);

		// se comprueba que se haya devuelto algun valor
		if (bestGlobalRow) {
			// si sesion es distinta a la actual actualizo los valores de best para esa sesion
			if (bestGlobalRow.best_id != currentSessionId) {
				best = bestGlobalRow.best_value;
				bestDate = bestGlobalRow.best_date;
			} else {
				// si la sesion devuelta es la actual actualizo los valores para el nuevo value
				best = value;
				bestDate = currentSessionDate;
			}
		}

		// realizo lo mismo que antes pero para el mensual
		const bestMonthRow = db
			.prepare(
				`
			SELECT	sc.value			AS	month_best_value,
            		s.session_date		AS 	month_best_date,
					s.id				AS	month_best_id
        	FROM	session_counters	AS	sc
        	JOIN	sessions			AS	s
          	ON 		sc.session_id = s.id
        	WHERE 	sc.counter_id = ?
          	AND 	s.month_id   = ?
        	ORDER BY sc.value DESC, s.session_date DESC
        	LIMIT 1`
			)
			.get(counterId, currentMonthId);
		if (bestMonthRow) {
			if (bestMonthRow.month_best_id != currentSessionId) {
				monthBest = bestMonthRow.month_best_value;
				monthBestDate = bestMonthRow.month_best_date;
			} else {
				monthBest = value;
				monthBestDate = currentSessionDate;
			}
		}
	} else {
		// en caso de que amount sea positivo compruebo que el value calculado sea mayor que el best anterior
		// si lo es lo guardo
		// lo mismo para el mensual
		if (value > contador.varList[bestIndex].value) {
			best = value;
			bestDate = currentSessionDate;
		}
		if (value > contador.varList[monthBestIndex].value) {
			monthBest = value;
			monthBestDate = currentSessionDate;
		}
	}

	// si exite best lo guardo
	if (best) {
		contador.varList[bestIndex].value = best;
		contador.bestDate = bestDate;
	}
	if (monthBest) {
		contador.varList[monthBestIndex].value = monthBest;
		contador.monthBestDate = monthBestDate;
	}
	counterList[index] = contador;

	// // guardo el valor del contador en la tabla de contadores por sesion
	// db.prepare(
	// 	`INSERT INTO session_counters (session_id, counter_id, value) VALUES (?, ?, ?)
	// 	ON CONFLICT(session_id, counter_id) DO UPDATE SET value = excluded.value`
	// ).run(currentSessionId, counterId, value);

	// guardo los datos correspondientes a global
	// si existe best guardo con esos valores, si no, solo el total
	best
		? db.prepare(`UPDATE counter_stats_global SET total = @total, actual_best = @actualBest, best_date = @bestDate WHERE counter_id = @id`).run({
				id: counterId,
				total: totalValue,
				actualBest: best,
				bestDate: bestDate,
		  })
		: db.prepare(`UPDATE counter_stats_global SET total = @total WHERE counter_id = @id`).run({
				id: counterId,
				total: totalValue,
		  });

	// lo mismo que lo anterior pero para el mensual
	monthBest
		? db.prepare(`UPDATE counter_stats_monthly SET total = @total, actual_best = @actualBest, best_date = @bestDate WHERE counter_id = @id AND month_id = @month`).run({
				id: counterId,
				month: currentMonthId,
				total: monthTotalValue,
				actualBest: monthBest,
				bestDate: monthBestDate,
		  })
		: db.prepare(`UPDATE counter_stats_monthly SET total = @total WHERE counter_id = @id AND month_id = @month`).run({
				id: counterId,
				month: currentMonthId,
				total: monthTotalValue,
		  });
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------------------------------------
//
// Seccion overlay
//
//---------------------------------------------------------------------------------------------------------

// Carga los datos numericos a mostrar en el overlay para interpolarlos con los tags
app.get("/getNumberData", (req, res) => {
	// creo un objeto compuesto por el nombre de cada contador como key y su valor como value
	let countersObject;
	counterList.map((c) => {
		countersObject = { ...countersObject, [c.name]: c.value };
		c.varList.map((v) => (countersObject = { ...countersObject, [v.name]: v.value }));
	});
	// lo envio
	res.json(countersObject);
});

// Carga la configuracion del overlay y la envia al mismo
app.get("/configOverlay", async (req, res) => {
	await loadOverlayConfig();
	res.json({
		type: "config",
		data: configOverlay,
	});
});

// envia los labels que haya
app.get("/checkForLabels", (req, res) => {
	res.json({
		labels: configOverlay.labels,
	});
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------------------------------------
//
// Seccion panel de control
//
//---------------------------------------------------------------------------------------------------------

app.post("/getAccessMode", (req, res) => {
	res.json({ mode: FanslyChatCommandMode, allowedNames: FanslyAllowedNames, blacklist: FanslyBlacklist });
});

app.post("/modifyAccessMode", (req, res) => {
	ChangeAccessMode(req.body.mode);
	res.json({ mode: FanslyChatCommandMode, allowedNames: FanslyAllowedNames, blacklist: FanslyBlacklist });
});
app.post("/modifyAccessNames", (req, res) => {
	ChangeAccessNames(req.body.allowedNames);
	res.json({ mode: FanslyChatCommandMode, allowedNames: FanslyAllowedNames, blacklist: FanslyBlacklist });
});
app.post("/modifyBlacklist", (req, res) => {
	ChangeBlacklistNames(req.body.blacklist);
	res.json({ mode: FanslyChatCommandMode, allowedNames: FanslyAllowedNames, blacklist: FanslyBlacklist });
});

app.post("/modifyStyle", async (req, res) => {
	configOverlay.width = req.body.width;
	configOverlay.height = req.body.height;
	configOverlay.background = req.body.background;
	configOverlay.backgroundColor = req.body.backgroundColor ?? undefined;
	configOverlay.backgroundImage = req.body.backgroundImage ?? undefined;
	configOverlay.border = req.body.border;
	configOverlay.borderColor = req.body.border > 0 ? req.body.borderColor ?? "#000000" : undefined;
	configOverlay.borderRadius = req.body.border > 0 ? req.body.borderRadius ?? 0 : undefined;

	try {
		await fs.promises.writeFile(OVERLAYSTYLE_PATH, JSON.stringify(configOverlay, null, 4));
	} catch (er) {
		console.error("ERROR updating overlayConfig file", er);
		return;
	}

	if (clientes.overlay && clientes.overlay.length > 0) {
		clientes.overlay.forEach((c) =>
			c.send(
				JSON.stringify({
					type: "styleModify",
					data: configOverlay,
				})
			)
		);
		enviarInfo();
	}
	// sendToCounterStats();
	SendStyleToPreview();
	res.json({});
});

app.get("/setControllOverlay", async (req, res) => {
	await loadOverlayConfig();
	res.json(configOverlay);
});

// llamada al añadir un label desde el panel de control
app.post("/addLabel", async (req, res) => {
	configOverlay.labels.push(req.body.data);

	try {
		await fs.promises.writeFile(OVERLAYSTYLE_PATH, JSON.stringify(configOverlay, null, 4));
	} catch (er) {
		console.error("ERROR updating overlayConfig file", er);
		return;
	}

	console.log("addlabel");
	// si el overlay está conectado se envia la informacion
	if (clientes.overlay && clientes.overlay.length > 0) {
		clientes.overlay.forEach((c) =>
			c.send(
				JSON.stringify({
					type: "addLabel",
					data: req.body.data,
				})
			)
		);
		enviarInfo();
	}
	sendToCounterStats();
	SendLabelsToPreview();
	res.json({});
});

app.post("/modifyLabelText", (req, res) => {
	configOverlay.labels[req.body.index].label = req.body.data;

	try {
		fs.promises.writeFile(OVERLAYSTYLE_PATH, JSON.stringify(configOverlay, null, 4));
	} catch (er) {
		console.error("ERROR updating overlayConfig file", er);
		return;
	}

	// si el overlay está conectado se envia la informacion
	if (clientes.overlay && clientes.overlay.length > 0) {
		console.log(req.body.data);
		clientes.overlay.forEach((c) =>
			c.send(
				JSON.stringify({
					type: "modifyLabel",
					data: configOverlay.labels[req.body.index],
					index: req.body.index,
				})
			)
		);
		enviarInfo();
	}
	sendToCounterStats();
	SendLabelsToPreview();
	res.json({});
});

function HexToRGBA(hex, alpha = 1) {
	const matches = hex.match(/\w\w/g);
	if (!matches || matches.length < 3) {
		throw new Error("Invalid hex color");
	}

	const [r, g, b] = matches.map((x) => parseInt(x, 16));

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
// llamada al modificar un label desde el panel de control
app.post("/modifyLabel", async (req, res) => {
	configOverlay.labels[req.body.index].X = req.body.data.X;
	configOverlay.labels[req.body.index].Y = req.body.data.Y;
	configOverlay.labels[req.body.index].fontSize = req.body.data.fontSize;
	configOverlay.labels[req.body.index].color = req.body.data.color;
	configOverlay.labels[req.body.index].outline = req.body.data.outline;

	if (req.body.data.outline && req.body.data.outlineColor.includes("#")) {
		configOverlay.labels[req.body.index].outlineColor = HexToRGBA(req.body.data.outlineColor, req.body.data.outlineOpacity);
	} else configOverlay.labels[req.body.index].outlineColor = req.body.data.outlineColor;
	configOverlay.labels[req.body.index].outlineSize = req.body.data.outlineSize;

	configOverlay.labels[req.body.index].background = req.body.data.background;

	if (req.body.data.background && req.body.data.backgroundColor.includes("#")) {
		configOverlay.labels[req.body.index].backgroundColor = HexToRGBA(req.body.data.backgroundColor, req.body.data.backgroundOpacity);
	} else configOverlay.labels[req.body.index].backgroundColor = req.body.data.backgroundColor;

	try {
		await fs.promises.writeFile(OVERLAYSTYLE_PATH, JSON.stringify(configOverlay, null, 4));
	} catch (er) {
		console.error("ERROR updating overlayConfig file", er);
		return;
	}

	// si el overlay está conectado se envia la informacion
	if (clientes.overlay && clientes.overlay.length > 0) {
		console.log(req.body.data);
		clientes.overlay.forEach((c) =>
			c.send(
				JSON.stringify({
					type: "modifyLabel",
					data: req.body.data,
					index: req.body.index,
				})
			)
		);
		enviarInfo();
	}
	sendToCounterStats();
	SendLabelsToPreview();
	res.json({});
});

// Llamada al eliminar un label desde el panel de control
app.post("/deleteLabel", async (req, res) => {
	let labels = configOverlay.labels.filter((_label) => _label !== configOverlay.labels[req.body.index]);
	configOverlay.labels = labels;
	try {
		await fs.promises.writeFile(OVERLAYSTYLE_PATH, JSON.stringify(configOverlay, null, 4));
	} catch (er) {
		console.error("ERROR updating overlayConfig file", er);
		return;
	}

	// si el overlay está conectado se envia la informacion
	if (clientes.overlay && clientes.overlay.length > 0) {
		clientes.overlay.forEach((c) =>
			c.send(
				JSON.stringify({
					type: "deleteLabel",
					data: configOverlay.labels,
				})
			)
		);
		enviarInfo();
	}
	sendToCounterStats();
	SendLabelsToPreview();
	res.json({ labels });
});

// Llamada al mover los sliders de tamaño del overlay en el panel de control
app.post("/sliderSizeInfo", async (req, res) => {
	await setOverlaySize(req.body);

	// si el overlay está conectado se envia la informacion
	if (clientes.overlay && clientes.overlay.length > 0) {
		clientes.overlay.forEach((c) =>
			c.send(
				JSON.stringify({
					type: "sizeConfig",
					data: { width: configOverlay.width, height: configOverlay.height },
				})
			)
		);
	} else {
		console.log("Overlay no conectado");
	}
	res.json({});
});

app.get("/media/list", (req, res) => {
	const mediaDir = join(__dirname, "media");
	fs.readdir(mediaDir, (err, files) => {
		if (err) {
			console.error("Error reading media folder", err);
			return res.status(500).json({ error: "Error reading media folder" });
		}
		res.json(files);
	});
});

app.get("/fontslist", async (req, res) => {
	try {
		if (!fontList) {
			await LoadFonts();
		}
		res.json(fontList);
	} catch (e) {
		console.error("Error loading fonts", e);
		res.status(500).json({ error: "No fonts loaded" });
	}
});

app.post("/fontChange", (req, res) => {
	console.log(req.body);
	configOverlay.labels[req.body.index].font = req.body.data.font;
	configOverlay.labels[req.body.index].fontValue = req.body.data.fontValue;
	configOverlay.labels[req.body.index].fontWeight = req.body.data.fontWeight;

	try {
		fs.promises.writeFile(OVERLAYSTYLE_PATH, JSON.stringify(configOverlay, null, 4));
	} catch (er) {
		console.error("ERROR updating overlayConfig file", er);
		return;
	}

	if (clientes.overlay && clientes.overlay.length > 0) {
		clientes.overlay.forEach((c) =>
			c.send(
				JSON.stringify({
					type: "fontModify",
					data: {
						value: configOverlay.labels[req.body.index].fontValue,
						family: configOverlay.labels[req.body.index].font,
						weight: configOverlay.labels[req.body.index].fontWeight,
					},
					index: req.body.index,
				})
			)
		);
	} else {
		console.log("Overlay no conectado");
	}

	SendLabelsToPreview();
	res.json({});
});

app.post("/fontWeightChange", async (req, res) => {
	configOverlay.labels[req.body.index].fontWeight = req.body.value;

	try {
		await fs.promises.writeFile(OVERLAYSTYLE_PATH, JSON.stringify(configOverlay, null, 4));
	} catch (er) {
		console.error("ERROR updating overlayConfig file", er);
		return;
	}

	if (clientes.overlay && clientes.overlay.length > 0) {
		clientes.overlay.forEach((c) =>
			c.send(
				JSON.stringify({
					type: "fontModify",
					data: {
						value: configOverlay.labels[req.body.index].fontValue,
						family: configOverlay.labels[req.body.index].font,
						weight: configOverlay.labels[req.body.index].fontWeight,
					},
					index: req.body.index,
				})
			)
		);
	} else {
		console.log("Overlay no conectado");
	}

	SendLabelsToPreview();
	res.json({});
});

app.post("/getCommandList", (req, res) => {
	res.json(FanslyCommands);
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------------------------------------
//
// Seccion panel de contadores
//
//---------------------------------------------------------------------------------------------------------

/*
counterList = [
	{
		name: "counter",
		active: true,
		value: 0,
		vars: [
			{ id: "0", name: "counterBest", value: 0 },
			{ id: "1", name: "counterActualBest", value: 0 },
			{ id: "2", name: "counterTotal", value: 0 },
			{ id: "3", name: "counterMonthBest", value: 0 },
			{ id: "4", name: "counterMonthTotal", value: 0 },
		],
	},
]
*/

app.post("/getCounterList", (req, res) => {
	res.json(counterList);
});

app.post("/addCounter", async (req, res) => {
	res.json(AddNewCounter());
});

// funcion para agregar un nuevo contador
function AddNewCounter() {
	// el siguiente fragmento busca si hay contadores con el formato counterNUMERO
	// en caso de haberlo devolvera en i el numero siguiente
	const regex = /^counter(\d+)$/;
	let i = 1;
	for (const e of counterList) {
		const match = regex.exec(e.name);
		if (match) {
			const num = parseInt(match[1], 10);
			if (num > i) {
				i = num;
			}
		}
	}
	i++;
	// inserto el nuevo contador a la tabla de contadores
	const insert = db.prepare("INSERT INTO counters (name) VALUES (?)").run(`counter${i}`);
	let fecha;
	if (currentSessionDate && currentSessionDate != "") fecha = currentSessionDate;
	else fecha = fechaHoy();
	db.prepare("INSERT INTO counter_stats_global (counter_id, best_date) VALUES (?, ?)").run(insert.lastInsertRowid, fecha);
	const month = db.prepare("SELECT id FROM months WHERE month_label = ?").get(fecha.substring(0, 7));
	if (!month) {
		month.id = db.prepare("INSERT INTO months (month_label) VALUES (?)").run(fecha.substring(0, 7)).lastInsertRowid;
	}
	db.prepare("INSERT INTO counter_stats_monthly (counter_id, month_id, best_date) VALUES (?, ?, ?)").run(insert.lastInsertRowid, month.id, fecha);

	// hago un contador auxiliar con toda la informacion correspondiente
	let contador = {
		name: `counter${i}`,
		active: true,
		shortcut: "",
		value: 0,
		id: insert.lastInsertRowid,
		bestDate: fechaHoy(),
		monthBestDate: fechaHoy(),
		varList: [
			{ name: `counter${i}Best`, value: 0 },
			{ name: `counter${i}ActualBest`, value: 0 },
			{ name: `counter${i}Total`, value: 0 },
			{ name: `counter${i}MonthBest`, value: 0 },
			{ name: `counter${i}MonthTotal`, value: 0 },
			{ name: `counter${i}MonthActualBest`, value: 0 },
		],
	};
	// lo añado a counterList
	counterList.push(contador);
	timer.AddCounterToTimer(contador.id, contador.name, database.insertTimerDonothonCounter);
	sendToCounterStats();
	SendCountersToPreview();

	enviarInfo();
	return counterList;
}

app.post("/counterModify", async (req, res) => {
	res.json(ModifyCounter(req.body.value, req.body.index));
});

// funcion para modificar un contador especifico
function ModifyCounter(data, index) {
	// creo un contador auxiliar
	// lo relleno con los datos del contador a modificar
	const contador = { ...counterList[index] };

	// compruevo que los datos que recibo existan, no sea un string vacio y que no exista otro contador con el mismo nombre
	if (data.name && data.name != "" && counterList.findIndex((elem, ind) => (elem.name == data.name || (data.shortcut != "" && elem.shortcut == data.shortcut && isNaN(data.shortcut))) && ind != index) == -1) {
		// actualizo la linea del contador
		const fila = db
			.prepare("UPDATE counters SET name = @name, shortcut = @shortcut WHERE id = @id") //
			.run({ name: data.name, shortcut: data.shortcut == "" ? null : data.shortcut, id: counterList[index].id });
		// console.log("Updated: ", fila);

		// prefijos de las variables asociadas
		const suffixes = ["Total", "Best", "ActualBest", "MonthTotal", "MonthBest", "MonthActualBest"];

		// actualizo los datos del contador para ingresarlo en counterList
		contador.name = data.name;

		contador.shortcut = data.shortcut;
		contador.active = data.active;
		contador.varList.map((c, ind) => {
			c.name = `${data.name}${suffixes[ind]}`;
		});
		// lo añado a counterList
		counterList[index] = contador;
		timer.ModifyCounter(contador.id, contador.name, database.updateDonothonCounter);
	} else {
		console.log("(ModifyCounter) Incorrect name");
		contador.varList = [];
	}

	sendToCounterStats();
	SendCountersToPreview();
	enviarInfo();
	// retorno el objeto del contador
	return contador;
}

app.post("/deleteCounter", async (req, res) => {
	res.json(DeleteCounter(req.body.index));
});

function DeleteCounter(index) {
	// elimino la linea del contador
	const deleted = db.prepare("DELETE FROM counters WHERE id = ?").run(counterList[index].id);

	// si el borrado de la linea en al tabla fue efectivo actualizo la lista de contadores
	if (deleted) {
		timer.DeleteCounterFromTimer(counterList[index].id, database.deleteDonothonCounter);
		counterList = counterList.filter((c) => c !== counterList[index]);
	}

	sendToCounterStats();
	SendCountersToPreview();

	enviarInfo();
	return counterList;
}

app.get("/counters/statsPanel", (req, res) => {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.flushHeaders();

	counterStatsClients.push(res);

	sendToCounterStats();
	req.on("close", () => {
		counterStatsClients = counterStatsClients.filter((c) => c !== res);
	});
});

function sendToCounterStats() {
	if (counterStatsClients && counterStatsClients.length > 0) {
		counterStatsClients.forEach((res) => res.write(`data: ${JSON.stringify(counterList)}\n\n`));
	}
}

app.get("/overlay/counters/preview", (req, res) => {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.flushHeaders();
	overlayPreviewClients.push(res);

	SendCountersToPreview();
	SendStyleToPreview();
	SendLabelsToPreview();
	req.on("close", () => {
		overlayPreviewClients = overlayPreviewClients.filter((c) => c !== res);
	});
});

function SendCountersToPreview() {
	if (overlayPreviewClients && overlayPreviewClients.length > 0) {
		let countersObject;
		counterList.map((c) => {
			countersObject = { ...countersObject, [c.name]: c.value };
			c.varList.map((v) => (countersObject = { ...countersObject, [v.name]: v.value }));
		});
		overlayPreviewClients.forEach((res) => res.write(`data: ${JSON.stringify({ type: "counters", data: countersObject })}\n\n`));
	}
}

function SendStyleToPreview() {
	if (overlayPreviewClients && overlayPreviewClients.length > 0) {
		let style = {
			width: configOverlay.width,
			height: configOverlay.height,
			backgroundColor: configOverlay.backgroundColor,
			background: configOverlay.background,
			border: configOverlay.border,
			borderRadius: configOverlay.borderRadius,
			borderColor: configOverlay.borderColor,
		};

		overlayPreviewClients.forEach((res) => res.write(`data: ${JSON.stringify({ type: "style", data: style })}\n\n`));
	}
}

function SendLabelsToPreview() {
	if (overlayPreviewClients && overlayPreviewClients.length > 0) {
		overlayPreviewClients.forEach((res) => res.write(`data: ${JSON.stringify({ type: "labels", data: configOverlay.labels })}\n\n`));
	}
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------------------------------------
//
// Seccion funcionamiento Fansly
//
//---------------------------------------------------------------------------------------------------------

// obtiene los datos de acceso a traves de la extencion
app.post("/FanslyAccess", (req, res) => {
	if (!req.body) {
		res.json(false);
		return;
	}
	console.log("Connecting to Fansly WebSocket");
	// cargo chatRoomId, token, id y la lista de subs tiers
	FanslyAccess.chatRoomId = req.body.chatRoomId;
	FanslyAccess.token = req.body.token;
	FanslyAccess.id = req.body.id;
	subscriptionTiers = req.body.subscriptionTiers;

	// cargo en el timer la lista de subs
	timer.LoadSubsParameters(subscriptionTiers);

	CheckSubsTimerDatabase();

	if (fanslyWs && fanslyWs.readyState === WebSocket.OPEN) {
		fanslyWs.close(1000);
		if (fanslyChatWs && fanslyChatWs.readyState === WebSocket.OPEN) {
			fanslyChatWs.close(1000);
		}
	}
	setTimeout(() => {
		ConectarFanslyWs();
		ConectarFanslyChatWs();
	}, 500);

	res.json(true);
});

// obtiene los datos de los goals, los datos se guardan solo la primera vez
// luego se actualizaran a traves del ws del chat
app.post("/FanslyGoals", (req, res) => {
	if (req.body && !fanslyGoalsReady) {
		console.log("Loading chatroom goals...");
		fanslyGoals = req.body;
		fanslyGoalsReady = true;

		timer.LoadGoalsParameters(fanslyGoals);
		CheckGoalsTimerDatabase();
		console.log("Goals loaded");

		res.json(true);
	} else {
		res.json(false);
	}
});

function ConectarFanslyWs() {
	clearInterval(fanslyWsHeartbeat);
	clearInterval(fanslyChatWsHeartbeat);
	fanslyWsHeartbeat = undefined;

	console.log("Attempting to connect...");
	fanslyWs = new WebSocket("wss://wsv3.fansly.com/?v=3", {
		headers: {
			origin: "https://fansly.com",
			host: "wsv3.fansly.com",
			"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
		},
	});

	fanslyWs.on("error", (err) => {
		console.log("Connexion error");
		console.error("Error connecting to Fansly WebSocket", err);
	});

	fanslyWs.on("open", () => {
		const authMessage = {
			t: 1,
			d: JSON.stringify({
				token: FanslyAccess.token,
				v: 3,
			}),
		};
		fanslyWs.send(JSON.stringify(authMessage));
	});

	fanslyWs.on("message", (data) => {
		let msg = deepParse(data.toString());
		// console.log(msg);
		if (msg.t) {
			if (msg.t == 1) {
				if (!fanslyWsHeartbeat) {
					if (fanslyWs.readyState === WebSocket.OPEN) {
						fanslyWs.send("p");
						// console.log("send p");
					}
					console.log("Fansly WebSocket connected");
					fanslyWsHeartbeat = setInterval(() => {
						if (fanslyWs && fanslyWs.readyState === WebSocket.OPEN) {
							fanslyWs.send("p");
							DisconnectTimeout(true);
						}
					}, HEARTBEAT_INTERVAL);
				}
			} else if (msg.t == 2) {
				if (msg.d && msg.d.lastPing !== undefined) {
					DisconnectTimeout();
				}
			} else if (msg.t == 10000) {
				if (msg.d.serviceId) {
					if (msg.d.serviceId == 3) {
						if (msg.d.event && msg.d.event.type && msg.d.event.type == 2) {
							if (msg.d.event.follow) {
								if (msg.d.event.follow.hasOwnProperty("accountSortOrder")) timer.TriggerFollower(database.TriggerTimerFollower);
							}
						}
					} else if (msg.d.serviceId == 15) {
						if (msg.d.event && msg.d.event.type && msg.d.event.type == 5) {
							if (msg.d.event.subscription) {
								if (msg.d.event.subscription.hasOwnProperty("subscriptionTotalDays")) {
									if (msg.d.event.subscription.subscriptionTierId) {
										timer.TriggerSubs(msg.d.event.subscription.subscriptionTierId, database.TriggerTimerSub, false);
									}
								}
							}
						}
					}
				}
			}
		}
	});

	fanslyWs.on("close", (event) => {
		console.log("WebSocket Closed:", event);
		clearInterval(fanslyWsHeartbeat);
		clearInterval(fanslyChatWsHeartbeat);
		fanslyChatWs.close(1000);
	});
}

function DisconnectTimeout(reset = false) {
	if (!reset) {
		clearTimeout(disconnectTimer);
		return;
	}
	clearTimeout(disconnectTimer);
	disconnectTimer = setTimeout(() => {
		console.log("Status Disconnected, check the connexion and reload the Fansly streaming panel");

		// funciones para la desconexion
		fanslyWs.close(1000);
	}, HEARTBEAT_TIMEOUT);
}

// conecta con el websocket del chat y asigna los listeners correcpondientes
function ConectarFanslyChatWs() {
	console.log("Connecting Fansly chatroom WebSocket...");
	fanslyChatWs = new WebSocket("wss://chatws.fansly.com/?v=3", {
		headers: {
			Origin: "https://www.fansly.com", // Agrega otros headers necesarios (User-Agent, Authorization, etc.) si es requerido.
			"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
			"accept-language": "es-419,es-US;q=0.9,es;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5,ja;q=0.4",
			"accept-encoding": "gzip, deflate, br, zstd",
			"cache-control": "no-cache",
			connection: "Upgrade",
			host: "chatws.fansly.com",
			pragma: "no-cache",
			"sec-websocket-extensions": "permessage-deflate; client_max_window_bits",
		},
	});

	fanslyChatWs.on("error", (error) => {
		console.error("Error en el WebSocket de Fansly", error);
	});

	fanslyChatWs.on("open", () => {
		const authMessage = {
			t: 1,
			d: JSON.stringify({
				token: FanslyAccess.token,
				v: 3,
			}),
		};
		fanslyChatWs.send(JSON.stringify(authMessage));
	});

	fanslyChatWs.on("close", (evnt) => {
		if (evnt) console.log("Chat WebSocket closed:", evnt);
	});

	fanslyChatWs.on("message", (data) => {
		// console.log(JSON.parse(data.toString()));
		// let _datos = JSON.parse(data.toString());
		let _datos = deepParse(data.toString());
		if (_datos.t == 1) {
			const suscripcion = {
				t: 46001,
				d: JSON.stringify({
					chatRoomId: FanslyAccess.chatRoomId, // Reemplázalo con el ID del chat
				}),
			};

			setTimeout(() => {
				fanslyChatWs.send(JSON.stringify(suscripcion));
				console.log("Chatroom connected");
				setTimeout(() => {
					SendMessageToChat("Server connected");
				}, 2000);
				setTimeout(KeepChatConnected, 10000);
			}, 100);
		}

		if (_datos.t && _datos.t === 10000) {
			let event;
			event = _datos.d.event;
			if (event.type == 10) {
				// if (event.chatRoomMessage.username && event.chatRoomMessage.content) {
				// 	console.log(event.chatRoomMessage.username, ":", event.chatRoomMessage.content);
				// }
				if (event.chatRoomMessage) {
					if (event.chatRoomMessage.attachments && event.chatRoomMessage.attachments.length > 0 && event.chatRoomMessage.attachments[0].contentType === 7) {
						const tip = event.chatRoomMessage.attachments[0].metadata.amount;
						console.log(tip);
						timer.TriggerTip(tip, database.TriggerTimerTip);
					}
					if (event.chatRoomMessage.content) {
						//
						if (event.chatRoomMessage.content == "!ppsize") {
							const pp = `@${event.chatRoomMessage.username} PP is ${Math.floor(Math.random() * 40)}cm long`;
							SendMessageToChat(pp);
						}
						if (event.chatRoomMessage.content == "!s") {
							FakeSub();
						} else if (event.chatRoomMessage.content == "!g") FakeGoal();
						else if (event.chatRoomMessage.content == "!t") FakeTip();

						switch (FanslyChatCommandMode) {
							case "all":
								ProccessChatMessages(event.chatRoomMessage);
								break;
							case "mod":
								if (event.chatRoomMessage.accountFlags == 1 || event.chatRoomMessage.accountFlags == 2) {
									ProccessChatMessages(event.chatRoomMessage);
									// console.log("mods");
								}
								break;
							case "streamer":
								if (event.chatRoomMessage.accountFlags == 1) {
									ProccessChatMessages(event.chatRoomMessage);
									// console.log("streamer");
								}
								break;
							case "custom":
								if (event.chatRoomMessage.accountFlags == 1 || (!FanslyBlacklist.includes(event.chatRoomMessage.username) && FanslyAllowedNames.includes(event.chatRoomMessage.username))) {
									ProccessChatMessages(event.chatRoomMessage);
									// console.log("custom");
								}
								break;
							case "customMod":
								if (event.chatRoomMessage.accountFlags == 1 || (!FanslyBlacklist.includes(event.chatRoomMessage.username) && (FanslyAllowedNames.includes(event.chatRoomMessage.username) || event.chatRoomMessage.accountFlags == 2))) {
									ProccessChatMessages(event.chatRoomMessage);
									// console.log("custom + mod");
								}
								break;
						}
					}
				}
			} else if (event.type == 50) {
				// console.log("goal creado");
				GoalCreated(event.chatRoomGoal);
			} else if (event.type == 51) {
				if (event.chatRoomGoal.deletedAt) {
					// console.log("goal eliminado");
					GoalDeleted(event.chatRoomGoal);
				} else {
					// console.log("goal modificado");
					GoalModified(event.chatRoomGoal);
				}
			} else if (event.type == 53) {
				// console.log("sub");
				if (event.subAlert.subscriptionTierId !== undefined) {
					timer.TriggerSubs(event.subAlert.subscriptionTierId, database.TriggerTimerSub, true);
				}
			}
		}
	});
}

// mantiene el chat conectado
function KeepChatConnected() {
	if (fanslyChatWs) {
		if (fanslyChatWs.readyState === WebSocket.OPEN) {
			fanslyChatWs.send("p");
			// console.log("fanslyChatWs sent p");
			// setTimeout(KeepChatConnected, 20000);
		}
	}
	fanslyChatWsHeartbeat = setInterval(() => {
		if (fanslyChatWs && fanslyWs && fanslyChatWs.readyState === WebSocket.OPEN) {
			fanslyChatWs.send("p");
			// console.log("fanslyChatWs sent p");
		}
	}, HEARTBEAT_INTERVAL);
}

function SendMessageToChat(message) {
	const url = "https://apiv3.fansly.com/api/v1/chatroom/message?ngsw-bypass=true";

	// Define las cabeceras necesarias (ajusta las cabeceras según lo requiera el servidor)
	const headers = {
		accept: "application/json, text/plain, */*",
		"accept-encoding": "gzip, deflate, br, zstd",
		"accept-language": "es-419,es-US;q=0.9,es;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5,ja;q=0.4",
		authorization: FanslyAccess.token,
		"content-type": "application/json",
		// Muchas veces no necesitas definir content-length, axios lo calcula

		//'origin': 'https://fansly.com',
		//'referer': 'https://fansly.com/',
		//'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
		//'sec-ch-ua-mobile': '?0',
		//'sec-ch-ua-platform': '"Windows"',
		//'sec-fetch-dest': 'empty',
		//'sec-fetch-mode': 'cors',
		//'sec-fetch-site': 'same-site',
		//'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
	};

	// Define el payload (el mensaje a enviar)
	const payload = {
		// Por ejemplo, el contenido del mensaje, ajusta según la estructura que espere el endpoint

		chatRoomId: FanslyAccess.chatRoomId,
		content: message,
		private: 0,
	};
	if (fanslyChatWs && fanslyChatWs.readyState === WebSocket.OPEN) {
		axios
			.post(url, payload, { headers })
			.then((response) => {
				//console.log("Respuesta del servidor:", response.data);
			})
			.catch((error) => {
				console.error("Petision error:", error.response ? error.response.data : error.message);
			});
	}
}
function ReconocerComando(mensaje) {
	// Esta regex extrae el comando (que comienza con "!") y el resto de los parámetros
	const regex = /^(!\w+)\s*(.*)$/;
	const match = mensaje.match(regex);

	if (!match) return null; // si no es comando se sale y retorna null

	let comandoEntrada = match[1]; // comando ejemplo !c !continue !set
	const parametros = match[2]; // El resto del mensaje que pueden ser parametros
	// comandoEntrada = comandoEntrada.replace("!", "");
	// Busca el comando en la lista de comandos disponibles
	const comandoEncontrado = FanslyCommands.find((cmd) => "!" + cmd.command === comandoEntrada || "!" + cmd.shortcut === comandoEntrada);
	// el comando no está definido
	if (!comandoEncontrado) {
		// console.log("ReconocerComando() command not recognized");
		return null;
	}

	// Preparar un objeto de salida que incluya la información del comando y los parámetros
	let salida = { ...comandoEncontrado, params: parametros.trim() };
	return salida;
}

function ProccessChatMessages(message) {
	if (!message || !message.content) return; // si no hay mensage o no tiene contenido que sale de la funcion

	let commandInfo = ReconocerComando(message.content.trim()); // reconozco si hay comando o no
	if (!commandInfo) return null;

	const grp = CommandHandlers[commandInfo.type];
	if (!grp) {
		console.log("Error: Command group not exists");
		return;
	}

	const fn = grp[commandInfo.functionName];
	if (typeof fn !== "function") {
		console.log(`Error: Function ${commandInfo.functionName} not found`);
		return;
	}

	fn(commandInfo.params, commandInfo.functionParams);
}

function fechaHoy() {
	return new Date().toISOString().split("T")[0];
}

function enviarInfo() {
	// creo un objeto compuesto por el nombre de cada contador como key y su valor como value

	if (clientes.overlay && clientes.overlay.length > 0) {
		let countersObject;
		counterList.map((c) => {
			countersObject = { ...countersObject, [c.name]: c.value };
			c.varList.map((v) => (countersObject = { ...countersObject, [v.name]: v.value }));
		});
		clientes.overlay.forEach((c) =>
			c.send(
				JSON.stringify({
					type: "numberUpdate",
					data: countersObject,
				})
			)
		);
	}
}
const InfoHandlers = {
	SendCounterListToChat: () => SendCounterListToChat(),
	SendCommandListToChat: () => SendCommandListToChat(),
};
const ConfigHandlers = {
	StartNewSession: () => StartNewSession(),
	ContinueSession: () => ContinueSession(),
};
const CounterHandlers = {
	CountCommand: (commandParams, functionParams) => ProcessCounterCommand(commandParams, functionParams),
};
const TimerHandlers = {
	AddTime: (commandParams) => {
		const tokens = commandParams.trim().split(/\s+/);
		const num = Number(tokens[0]);
		if (!isNaN(num)) {
			timer.AddTime(num);
			SendMessageToChat(`Timer added: ${num}seconds`);
		} else SendMessageToChat("Invalid syntax");
	},
	StartTimer: () => StartTimer(),
	StopTimer: () => StopTimer(),
	EnableTimer: () => {
		timer.Enable(true);
		SendMessageToChat("Timer enabled");
	},
	DisableTimer: () => {
		timer.Enable(false);
		SendMessageToChat("Timer diabled");
	},
};
const CommandHandlers = {
	info: InfoHandlers,
	config: ConfigHandlers,
	counter: CounterHandlers,
	timer: TimerHandlers,
};

function SendCounterListToChat() {
	let text;

	let lines = [
		"Counter Name  --  Shortcut",
		...counterList.map((c) => {
			if (c.shortcut) return `${c.name}  --  ${c.shortcut}`;
			else return `${c.name}`;
		}),
	];

	const result = lines.join("\n");
	text = "Counter list:\n" + result;

	// console.log(text);
	SendMessageToChat(text);
}

function SendCommandListToChat() {
	let text;

	let lines = [
		"Command Name  --  Shortcut -- Description",
		...FanslyCommands.map((c) => {
			if (c.shortcut) return `!${c.command}  --  !${c.shortcut}  --  ${c.description}`;
			else return `!${c.command}  --  n/c  --  ${c.description}`;
		}),
	];

	const result = lines.join("\n");
	text = "Command list:\n" + result;

	// console.log(text);
	SendMessageToChat(text);
}

// se llama al cambiar cualquier dato relacionado con los parametros del panel del timer
app.post("/timer/update/:mode", (req, res) => {
	const mode = req.params.mode;
	SetTimerParams(mode, req.body);
	res.json({});
});
// actualiza los valores de cada parametro
function SetTimerParams(mode, params) {
	timer.setTimerParams(mode, params);
	database.setTimerParams(mode, params);

	DonothonUpdateFollowers();
	DonothonUpdateTips();
	DonothonUpdateGoals();
	DonothonUpdateSubs();
	DonothonUpdateCounters();
}

app.get("/timer/donothon", (req, res) => {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.flushHeaders();
	donothonClients.push(res);

	DonothonUpdateFollowers();
	DonothonUpdateTips();
	DonothonUpdateGoals();
	DonothonUpdateSubs();
	DonothonUpdateCounters();

	req.on("close", () => {
		donothonClients = donothonClients.filter((c) => c !== res);
	});
});

app.get("/timer/donothon/newpage", (req, res) => {
	timer.NewDonothonPage(database.insertDonothonPage(), LoadDonothonCountersDatabase, LoadDonothonSubsDatabase);
	res.json({});
});

function DonothonUpdateFollowers() {
	if (donothonClients && donothonClients.length > 0) {
		donothonClients.forEach((res) => res.write(`data: ${JSON.stringify({ type: "followers", data: { amount: timer.donothonStats.followers, active: true } })}\n\n`));
	}
}
function DonothonUpdateTips() {
	if (donothonClients && donothonClients.length > 0) {
		donothonClients.forEach((res) => res.write(`data: ${JSON.stringify({ type: "tips", data: { amount: timer.donothonStats.tips, active: true } })}\n\n`));
	}
}
function DonothonUpdateGoals() {
	if (donothonClients && donothonClients.length > 0) {
		donothonClients.forEach((res) => res.write(`data: ${JSON.stringify({ type: "goals", data: { amount: timer.donothonStats.goals, active: true } })}\n\n`));
	}
}
function DonothonUpdateSubs(subsList) {
	if (!subsList) subsList = timer.donothonStats.subs;
	if (donothonClients && donothonClients.length > 0 && subsList && subsList.length > 0) {
		let subs = [];
		subsList.forEach((s) => {
			let enabled = false;
			const sub = timer.timerParameters.subs.find((su) => su.id == s.id);
			if (sub && sub.enabled) {
				enabled = true;
			} else enabled = !!(s.amount > 0);
			subs.push({ id: s.id, name: s.name, color: s.color, price: s.price, amount: s.amount, active: enabled });
		});
		donothonClients.forEach((res) => res.write(`data: ${JSON.stringify({ type: "subs", data: subs })}\n\n`));
	}
}

function DonothonUpdateCounters() {
	if (donothonClients && donothonClients.length > 0) {
		let counters = [];
		timer.donothonStats.counters.forEach((c) => {
			let enabled = false;
			const coun = timer.timerParameters.counters.find((co) => co.id == c.id);
			if (coun && coun.enabled) {
				enabled = true;
			} else enabled = !!(c.amount > 0);
			counters.push({ id: c.id, name: c.name, amount: c.amount, active: enabled });
		});
		donothonClients.forEach((res) => res.write(`data: ${JSON.stringify({ type: "counters", data: counters })}\n\n`));
	}
}
// GET del EventSource del preview del timer
app.get("/timer/preview", (req, res) => {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.flushHeaders();
	timerPreviewClients.push(res);

	if (timerPreviewClients && timerPreviewClients.length > 0) {
		timerPreviewClients.forEach((res) => res.write(`data: ${JSON.stringify({ type: "set", data: timer.timerParameters.enabled })}\n\n`));
	}
	SendTimerToPreview(timer.getTimer());
	req.on("close", () => {
		timerPreviewClients = timerPreviewClients.filter((c) => c !== res);
	});
});

// se envia el timer al preview cada vez que su valor se actualice, esto envia el valor numerico de timer en segundos
function SendTimerToPreview(t) {
	if (timerPreviewClients && timerPreviewClients.length > 0) {
		timerPreviewClients.forEach((res) => res.write(`data: ${JSON.stringify({ type: "timerUpdate", data: t })}\n\n`));
	}
}

// en caso de que se detenga el timer se envia "timerStopped" al preview
function SendTimerStoppedToPreview() {
	if (timerPreviewClients && timerPreviewClients.length > 0) {
		timerPreviewClients.forEach((res) => res.write(`data: ${JSON.stringify({ type: "timerStopped" })}\n\n`));
	}
}

// en caso de que se resetee el timer se envia "timerReset" al preview
function SendTimerResetToPreview() {
	if (timerPreviewClients && timerPreviewClients.length > 0) {
		timerPreviewClients.forEach((res) => res.write(`data: ${JSON.stringify({ type: "timerReset" })}\n\n`));
	}
}

// funcion que envia el timer a los clientes de WebSocket
function TimerToWs(type, data) {
	if (clientes.timerOverlay && clientes.timerOverlay.length > 0) {
		clientes.timerOverlay.forEach((c) =>
			c.ws.send(
				JSON.stringify({
					type: type,
					data: data,
				})
			)
		);
	}
}
function SendTimerToWsClients(t) {
	TimerToWs("timerUpdate", t);
}

// GET llamado con EventSource para el panel de timer
app.get("/timer/addings", (req, res) => {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.flushHeaders();
	timerAddingsClients.push(res);

	// una vez que haya el primer cliente envio la informacion para pupolar el panel
	if (timerAddingsClients && timerAddingsClients.length > 0) {
		const params = timer.timerParameters;
		const c = counterList.map((co) => {
			const tc = params.counters.find((u) => co.id == u.id);
			if (tc) return { id: co.id, name: co.name, value: co.value, time: tc.amount, enabled: tc.enabled };
			else return { id: co.id, name: co.name, value: co.value, time: 0, enabled: false };
		});

		timerAddingsClients.forEach((res) =>
			res.write(
				`data: ${JSON.stringify({
					type: "set",
					data: {
						start: params.start,
						followers: params.followers,
						tips: params.tips,
						event: {
							followers: params.event.followers,
							tips: params.event.tips,
							subs: params.event.subs,
							goals: params.event.goals,
							counters: params.event.counters,
							subsOnlyShared: params.event.subsOnlyShared,
						},
						counters: c,
					},
				})}\n\n`
			)
		);
	}
	// envio las subs y los goal si los hubiera
	SendSubsToClient(timer.timerParameters.subs);
	SendGoalsToTimerClient();
	// elimino el cliente si se cierra el EventSource
	req.on("close", () => {
		timerAddingsClients = timerAddingsClients.filter((c) => c !== res);
	});
});

// funcion que envia los contadores disponebles a los clientes de panel
function SendCountersToTimerClients() {
	// creo un lista a enviar con id, name, value, time y enabled
	const c = counterList.map((co) => {
		const tc = timer.timerParameters.counters.find((u) => co.id == u.id);
		if (tc) return { id: co.id, name: co.name, value: co.value, time: tc.amount, enabled: tc.enabled };
		else return { id: co.id, name: co.name, value: co.value, time: 0, enabled: false };
	});
	// envio la lista a los clientes
	if (timerAddingsClients && timerAddingsClients.length > 0) {
		timerAddingsClients.forEach((res) => res.write(`data: ${JSON.stringify({ type: "counters", data: { counters: c } })}\n\n`));
	}
}

// funcion que envia los subs tiers a los clientes de panel
function SendSubsToClient(subsList) {
	// creo una lista a enviar con subId, name, color, price, time y enabled
	const subs = subscriptionTiers.map((s) => {
		const sub = subsList.find((sub) => sub.id === s.id);
		return { id: sub.id, name: s.name, color: s.color, price: s.plans[0].price, time: sub.amount, enabled: sub.enabled };
	});
	// envio los subs tiers a los clientes
	if (timerAddingsClients && timerAddingsClients.length > 0) {
		timerAddingsClients.forEach((res) => res.write(`data: ${JSON.stringify({ type: "subs", data: subs })}\n\n`));
	}
}

// funcion que envia los goals a los clientes de panel
function SendGoalsToTimerClient() {
	// creo la lista a enviar con goalId, label, currentAmount, goalAmount, time y enabled
	const goals = fanslyGoals.map((g) => {
		const goal = timer.timerParameters.goals.find((gl) => gl.id === g.id);
		return { id: g.id, label: g.label, currentAmount: g.currentAmount, goalAmount: g.goalAmount, time: goal.amount, enabled: goal.enabled };
	});
	// envio los goals al preview para renderizarlos
	if (timerAddingsClients && timerAddingsClients.length > 0) {
		timerAddingsClients.forEach((res) => res.write(`data: ${JSON.stringify({ type: "goals", data: goals })}\n\n`));
	}
}

// funcion llamada al crearse un nuevo goal, recibe el objeto del goal completo
// lo inserta en la lista de goals, en timerParameters y en la database
function GoalCreated(goal) {
	fanslyGoals.push(goal);
	timer.timerParameters.goals.push({ id: goal.id, amount: 0, enabled: true });
	database.insertTimerGoal(goal.id);
	SendGoalsToTimerClient();
}

// funcion llamada al ser borrado un goal, recibe el objeto completo del goal
function GoalDeleted(goal) {
	// borro el goal del la lista general, luego de timerParameters y luego de database
	fanslyGoals = fanslyGoals.filter((fg) => fg.id !== goal.id);
	timer.deleteTimerGoal(goal.id, database.deleteTimerGoal);
	SendGoalsToTimerClient();
}

// se llama siempre que un goal se modifica
function GoalModified(goal) {
	// obtengo el indice, si no existe salgo de la funcion
	const i = fanslyGoals.findIndex((fg) => fg.id === goal.id);
	if (i === -1) return;
	// si cambió el current, asigno su valor
	if (fanslyGoals[i].currentAmount !== goal.currentAmount) {
		fanslyGoals[i].currentAmount = goal.currentAmount;
		// luego compruebo si elgoal se completó, en ese caso llamo a GoalCompleted solo si antes no se habia completado
		if (goal.currentAmount >= goal.goalAmount && goal.goalAmount !== 0) {
			if (!fanslyGoals[i].completed) {
				fanslyGoals[i].completed = true;
				GoalCompleted(goal.id);
			}
		}
	}
	// si lo que cambió fue el goalAmount lo actualizo
	if (fanslyGoals[i].goalAmount !== goal.goalAmount) {
		fanslyGoals[i].goalAmount = goal.goalAmount;
		// si gracias a eso ahora el goal está completo lo asigno para evitar que se llame a GoalCompleted
		// gracias a que se completó artificialmente
		fanslyGoals[i].completed = goal.goalAmount !== 0 && goal.currentAmount >= goal.goalAmount;
	}
	// actualizo el resto de los datos
	fanslyGoals[i].type = goal.type;
	fanslyGoals[i].label = goal.label;
	fanslyGoals[i].description = goal.description;
	fanslyGoals[i].version = goal.version;
	// envio los goals al preview
	SendGoalsToTimerClient();
}

// funcion que comprueba las subs almacenados en la base de datos, los que coincidan con los alamcenados
// en timerParameters, se actualizan los valores de dicho objeto, los que no existan en el objeto se borran de la base de datos
function CheckSubsTimerDatabase() {
	// obtengo la lista de subs de la base de datos
	let exito = timer.UpdateSubs(db.prepare("SELECT * FROM timer_subs").all(), database.deleteTimerSubs, database.updateTimerSub);

	if (!exito) {
		console.log("Timer Subs Database failed to update");
		return;
	}
	console.log("Timer Subs Database updated");
	exito = timer.LoadDonothonSubs(LoadDonothonSubsDatabase(timer.getDonothonId()));
	if (!exito) {
		console.log("Donothon Subs Failed to update");
		return;
	}
}

// funcion que comprueba los goal almacenados en la base de datos, los que coincidan con los alamcenados
// en timerParameters, se actualizan los valores de dicho objeto, los que no existan en el objeto se borran de la base de datos
function CheckGoalsTimerDatabase() {
	// obtengo la lista de goals de la base de datos
	const exito = timer.UpdateGoals(db.prepare("SELECT * FROM timer_goals").all(), database.deleteTimerGoal, database.updateTimerGoal);

	console.log(exito ? "Timer Goals Database updated" : "Timer Goals Database failed to update");
}

function GoalCompleted(id) {
	timer.TriggerGoal(id, database.TriggerTimerGoal);
}

app.get("/extension/notify", (req, res) => {
	let list = [];
	counterList.forEach((c) => list.push({ name: c.name, value: c.value, id: c.id }));
	res.json({
		server: { server: true, fansly: fanslyWs && fanslyWs.readyState === WebSocket.OPEN && fanslyChatWs && fanslyChatWs.readyState === WebSocket.OPEN },
		counterList: list,
		started: sessionStarted,
	});
});

app.post("/extension/session", (req, res) => {
	if (req.body.id === "1") {
		console.log("new");
		StartNewSession();
	} else if (req.body.id === "2") {
		ContinueSession();
	}
	let list = [];
	counterList.forEach((c) => list.push({ name: c.name, value: c.value, id: c.id }));
	res.json({ started: sessionStarted, counterList: list });
});

app.post("/extension/count", (req, res) => {
	CounterCommand([{ id: req.body.id, amount: 1 }]);
	let list = [];
	counterList.forEach((c) => list.push({ name: c.name, value: c.value, id: c.id }));
	res.json({ started: sessionStarted, counterList: list });
});

// arranca el timer y lo detiene
app.post("/timer/start", (req, res) => {
	timer.ToggleTimer(database.getTimer(timer.timerParameters.start, timer.timerParameters.enabled).remaining_time);
	res.json({});
});

// arranca el timer desde el guardado en la base de datos
function StartTimer() {
	timer.Start(database.getTimer(timer.timerParameters.start, timer.timerParameters.enabled).remaining_time);
}
// detiene el timer y envia al los clientes
function StopTimer() {
	timer.Stop();
}

// agrega tiempo en segundos
app.post("/timer/addTime", (req, res) => {
	timer.AddTime(req.body.seconds);
	res.json({});
});
// resetea el timer
app.post("/timer/reset", (req, res) => {
	ResetTimer();
	res.json({});
});

app.post("/timer/enable", (req, res) => {
	timer.Enable(req.body.enabled);
	res.json({});
});

timer.timerEmitter.on("timerUpdate", (remain) => {
	// actualizo el timer en la base de datos
	database.updateTimer(remain);
	// envio el timer al preview y al WebSocket
	SendTimerToPreview(remain);
	SendTimerToWsClients(remain);
});

timer.timerEmitter.on("started", () => {
	SendMessageToChat("Timer started");
});
timer.timerEmitter.on("stopped", (t) => {
	TimerToWs("timerStopped", t);
	SendTimerStoppedToPreview(t);
	SendMessageToChat("Timer stopped");
});
timer.timerEmitter.on("enable", (e) => {
	if (timerPreviewClients && timerPreviewClients.length > 0) {
		timerPreviewClients.forEach((res) => res.write(`data: ${JSON.stringify({ type: "set", data: e })}\n\n`));
	}
	database.setTimerEnable(e);
});
timer.timerEmitter.on("reset", (t) => {
	database.setTimer(t);
	SendTimerToPreview(t);
	SendTimerResetToPreview();
	SendTimerToWsClients(t);
	TimerToWs("timerReset", t);
	SendMessageToChat("Timer reset");
});
timer.timerEmitter.on("addedTime", (seconds) => {
	if (clientes.timerOverlay && clientes.timerOverlay.length > 0) {
		clientes.timerOverlay.forEach((c) => c.ws.send(JSON.stringify({ type: "addedTime", data: seconds })));
	}
});

timer.donothonEmitter.on("followersTrigger", () => {
	DonothonUpdateFollowers();
});
timer.donothonEmitter.on("tipsTrigger", () => {
	DonothonUpdateTips();
});
timer.donothonEmitter.on("subsTrigger", () => {
	DonothonUpdateSubs();
});

timer.timerEmitter.on("countersUpdated", () => {
	SendCountersToTimerClients();
	DonothonUpdateCounters();
});
timer.timerEmitter.on("counterDeleted", (id) => {
	// creo un lista a enviar con id, name, value, time y enabled
	let c = [];
	timer.timerParameters.counters.forEach((co) => {
		const cl = counterList.find((u) => co.id == u.id && co.id != id);
		if (cl) c.push({ id: cl.id, name: cl.name, value: cl.value, time: co.amount, enabled: co.enabled });
	});
	// envio la lista a los clientes
	if (timerAddingsClients && timerAddingsClients.length > 0) {
		timerAddingsClients.forEach((res) => res.write(`data: ${JSON.stringify({ type: "counters", data: { counters: c } })}\n\n`));
	}
	if (donothonClients && donothonClients.length > 0) {
		let counters = [];
		timer.donothonStats.counters.forEach((c) => {
			let enabled = false;
			const coun = timer.timerParameters.counters.find((co) => co.id == c.id);
			if (coun && coun.enabled) {
				enabled = true;
			} else enabled = !!(c.amount > 0);
			counters.push({ id: c.id, name: c.name, amount: c.amount, active: enabled });
		});
		donothonClients.forEach((res) => res.write(`data: ${JSON.stringify({ type: "counters", data: counters })}\n\n`));
	}
});
timer.donothonEmitter.on("donothonUpdated", () => {
	DonothonUpdateFollowers();
	DonothonUpdateTips();
	DonothonUpdateSubs();
	DonothonUpdateGoals();
	DonothonUpdateCounters();
});

timer.timerEmitter.on("subsUpdated", (list) => {
	SendSubsToClient(list);
});

timer.donothonEmitter.on("subsUpdated", (list) => {
	DonothonUpdateSubs(list);
});

timer.timerEmitter.on("goalsUpdated", (goalslist) => {
	SendGoalsToTimerClient();
});

timer.donothonEmitter.on("subsUpdated", (subsList) => {
	if (donothonClients && donothonClients.length > 0 && subsList && subsList.length > 0) {
		let subs = [];
		subsList.forEach((s) => {
			let enabled = false;
			const sub = timer.timerParameters.subs.find((su) => su.id == s.id);
			if (sub && sub.enabled) {
				enabled = true;
			} else enabled = !!(s.amount > 0);
			subs.push({ id: s.id, name: s.name, color: s.color, price: s.price, amount: s.amount, active: enabled });
		});
		donothonClients.forEach((res) => res.write(`data: ${JSON.stringify({ type: "subs", data: subs })}\n\n`));
	}
});

timer.donothonEmitter.on("goalsTrigger", () => {
	DonothonUpdateGoals();
});

// llamada al resetear el timer
function ResetTimer() {
	timer.Reset();
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//	Final
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("*", (req, res) => {
	res.sendFile(join(__dirname, "/dist", "index.html"));
});
