import { Input, Switch } from "@headlessui/react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { SubscriptionType, SubTimerElement } from "./SubTimerElement";
import { GoalTimerElement, GoalType } from "./GoalTimerElement";
import { CounterTimerElement, CounterTimerType } from "./CounterTimerElement";

export function TimerDonothonConfig() {
	const [subs, setSubs] = useState<SubscriptionType[]>([]);
	const [goals, setGoals] = useState<GoalType[]>([]);
	const [counters, setCounters] = useState<CounterTimerType[]>([]);

	const [isSubsEnabled, setIsSubsEnabled] = useState(true);
	const [isSubsOnlyShared, setIsSubsOnlyShared] = useState(false);
	const [isGoalsEnabled, setIsGoalsEnabled] = useState(true);
	const [isCountersEnabled, setIsCountersEnabled] = useState(true);

	const [inputStartTime, setInputStartTime] = useState("00:00:00");
	const inputStartNumber = useRef(0);

	const [inputFollowersTime, setInputFollowersTime] = useState("00:00:00");
	const inputFollowersNumber = useRef(0);
	const [isFollowersEnabled, setIsFollowersEnabled] = useState(true);

	const [inputTipsTime, setInputTipsTime] = useState("00:00:00");
	const inputTipsNumber = useRef(0);
	const [isTipsEnabled, setIsTipsEnabled] = useState(true);

	useEffect(() => {
		const eventSource = new EventSource("http://localhost:3000/timer/addings");

		eventSource.onmessage = (evnt) => {
			const evento = JSON.parse(evnt.data);
			switch (evento.type) {
				case "set":
					console.log(evento.data.followers);
					setInputStartTime(formatSecondsToTime(evento.data.start));
					inputStartNumber.current = evento.data.start;
					setInputFollowersTime(formatSecondsToTime(evento.data.followers));
					inputFollowersNumber.current = evento.data.followers;
					setIsFollowersEnabled(evento.data.event.followers);
					setInputTipsTime(formatSecondsToTime(evento.data.tips));
					inputTipsNumber.current = evento.data.tips;
					setIsTipsEnabled(evento.data.event.tips);
					setCounters(evento.data.counters);

					setIsSubsEnabled(evento.data.event.subs);
					setIsSubsOnlyShared(evento.data.event.subsOnlyShared);
					setIsGoalsEnabled(evento.data.event.goals);
					setIsCountersEnabled(evento.data.event.counters);
					break;
				case "subs":
					setSubs(evento.data);
					break;
				case "goals":
					setGoals(evento.data);
					break;
				case "counters":
					setCounters(evento.data.counters);
					break;
			}
		};

		return () => {
			eventSource.close();
		};
	}, []);

	function formatSecondsToTime(p: number) {
		// si es cero
		if (p == 0) {
			return "00:00:00";
		}
		// si es menor a cero, devuelvo -hh:mm:ss
		if (p < 0) {
			return `-${Math.floor(-p / 3600)
				.toString()
				.padStart(2, "0")}:${Math.floor((-p / 60) % 60)
				.toString()
				.padStart(2, "0")}:${(-p % 60).toString().padStart(2, "0")}`;
		}
		// retorno normal hh:mm:ss
		return `${Math.floor(p / 3600)
			.toString()
			.padStart(2, "0")}:${Math.floor((p / 60) % 60)
			.toString()
			.padStart(2, "0")}:${(p % 60).toString().padStart(2, "0")}`;
	}
	function FormatTimeToSeconds(t: string) {
		// determino si es negativo
		const negative = t.startsWith("-");
		// const cleanTime = negative ? t.slice(1) : t;
		// const parts = cleanTime.split(":").map(Number).reverse();
		const parts = (negative ? t.slice(1) : t).split(":").map(Number).reverse();
		// calculo la cantidad de segundos y luego si es nagativo o no
		let currentInput = Math.floor(parts[0] + (parts[1] ?? 0) * 60 + (parts[2] ?? 0) * 3600);
		currentInput = negative ? -currentInput : currentInput;
		// si no es un number lo igualo a 0
		if (isNaN(currentInput)) currentInput = 0;
		return currentInput;
	}
	// se ejecuta cuando se preciona enter o se quita el foco
	function HandleSummit(source: string, enabled: boolean) {
		if (source === "start") {
			// seteo el tiempo con los segundos calculados
			setInputStartTime(formatSecondsToTime(inputStartNumber.current));
			SendUpdate("start", inputStartNumber.current, true);
			// envio los datos al componente padre
			return;
		}
		if (source === "follower") {
			setInputFollowersTime(formatSecondsToTime(inputFollowersNumber.current));
			setIsFollowersEnabled(enabled);
			SendUpdate("follower", inputFollowersNumber.current, enabled);
			return;
		}
		if (source === "tip") {
			setInputTipsTime(formatSecondsToTime(inputTipsNumber.current));
			setIsTipsEnabled(enabled);
			SendUpdate("tip", inputTipsNumber.current, enabled);
			return;
		}
	}
	function handleSubTimerChange(time: number, enabled: boolean, id: string) {
		try {
			fetch("http://localhost:3000/timer/update/subs", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					time: time,
					enabled: enabled,
					id: id,
				}),
			});
		} catch (e) {
			console.error("Error sending style data", e);
		}
	}
	function handleGoalTimerChange(time: number, enabled: boolean, id: string) {
		try {
			fetch("http://localhost:3000/timer/update/goals", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					time: time,
					enabled: enabled,
					id: id,
				}),
			});
		} catch (e) {
			console.error("Error sending style data", e);
		}
	}
	function handleCounterTimerChange(time: number, enabled: boolean, id: string) {
		try {
			fetch("http://localhost:3000/timer/update/counters", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					time: time,
					enabled: enabled,
					id: id,
				}),
			});
		} catch (e) {
			console.error("Error sending style data", e);
		}
	}
	function handleEventTimerChange(subs: boolean, subsOnlyShared: boolean, goals: boolean, counters: boolean) {
		try {
			fetch("http://localhost:3000/timer/update/events", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					subs: subs,
					subsOnlyShared: subsOnlyShared,
					goals: goals,
					counters: counters,
				}),
			});
		} catch (e) {
			console.error("Error sending style data", e);
		}
	}

	function SendUpdate(mode: string, time: number, enabled: boolean) {
		//
		try {
			fetch(`http://localhost:3000/timer/update/${mode}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					time: time,
					enabled: enabled,
				}),
			});
		} catch (e) {
			console.error("Error sending style data", e);
		}
	}
	return (
		<div className="flex flex-col gap-2">
			<div className="panel-secundary p-2 flex flex-col">
				<div className="flex items-center justify-between px-2 pl-3 ">
					<p className="font-bold">Start duration</p>
					<Input
						className={"input input-base text-center w-30"}
						onChange={(e) => {
							inputStartNumber.current = FormatTimeToSeconds(e.target.value);
							setInputStartTime(e.target.value);
						}}
						value={inputStartTime}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								// HandleSummit();
								e.currentTarget.blur();
							}
						}}
						onBlur={() => HandleSummit("start", true)}
					/>
				</div>
			</div>
			<div className="panel-secundary p-2 flex flex-col gap-2">
				<div className="flex items-center px-3">
					<h2 className="text-xl font-bold">Time Addition</h2>
				</div>
				<div className="panel-terciary p-2 gap-2 flex flex-col">
					{/* 
						--------------------------------------------------------------------------------
						Followers
						--------------------------------------------------------------------------------
					*/}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Switch
								checked={isFollowersEnabled}
								onChange={(c) => {
									setIsFollowersEnabled(c);
									HandleSummit("follower", c);
								}}
								as={Fragment}
							>
								{({ checked }) => (
									<button className={clsx("group inline-flex h-4 w-10 items-center rounded-full shadow-xl shadow-black/30", checked ? "bg-blue-600 " : "bg-white/10 ", "transition duration-500 ease-in-out")}>
										<span className={clsx("size-5 rounded-full bg-white", " transition duration-500 ease-in-out", checked ? "translate-x-5" : "translate-x-0")} />
									</button>
								)}
							</Switch>
							<p className="font-bold">New Followers</p>
						</div>

						<Input
							className={clsx("input input-base text-center w-30", !isFollowersEnabled && "border-rose-600/50")}
							onChange={(e) => {
								inputFollowersNumber.current = FormatTimeToSeconds(e.target.value);
								setInputFollowersTime(e.target.value);
							}}
							value={inputFollowersTime}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									// HandleSummit();
									e.currentTarget.blur();
								}
							}}
							onBlur={() => HandleSummit("follower", isFollowersEnabled)}
						/>
					</div>
					<div className="separator"></div>
					{/* 
						--------------------------------------------------------------------------------
						Tips
						-------------------------------------------------------------------------------- 
					*/}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Switch
								checked={isTipsEnabled}
								onChange={(c) => {
									setIsTipsEnabled(c);
									HandleSummit("tip", c);
								}}
								as={Fragment}
							>
								{({ checked }) => (
									<button className={clsx("group inline-flex h-4 w-10 items-center rounded-full shadow-xl shadow-black/30", checked ? "bg-blue-600 " : "bg-white/10 ", "transition duration-500 ease-in-out")}>
										<span className={clsx("size-5 rounded-full bg-white", " transition duration-500 ease-in-out", checked ? "translate-x-5" : "translate-x-0")} />
									</button>
								)}
							</Switch>
							<p className="font-bold">{"Tips (time per $1)"}</p>
						</div>

						<Input
							className={clsx("input input-base text-center w-30", !isTipsEnabled && "border-rose-600/50")}
							onChange={(e) => {
								inputTipsNumber.current = FormatTimeToSeconds(e.target.value);
								setInputTipsTime(e.target.value);
							}}
							value={inputTipsTime}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									// HandleSummit();
									e.currentTarget.blur();
								}
							}}
							onBlur={() => HandleSummit("tip", isTipsEnabled)}
						/>
					</div>
					<div className="separator"></div>
					{/* 
						--------------------------------------------------------------------------------
						Subs y Goals
						--------------------------------------------------------------------------------
					*/}
					<div>
						{subs && subs.length > 0 ? (
							<div className="flex flex-col gap-2">
								{/* 
									--------------------------------------------------------------------------------
									Subs
									--------------------------------------------------------------------------------
						 		*/}
								<div className="flex flex-col gap-4">
									<div className="flex items-center gap-2">
										<div className="flex items-center gap-2">
											<Switch
												checked={isSubsEnabled}
												onChange={(c) => {
													setIsSubsEnabled(c);
													handleEventTimerChange(c, isSubsOnlyShared, isGoalsEnabled, isCountersEnabled);
												}}
												as={Fragment}
											>
												{({ checked }) => (
													<button className={clsx("group inline-flex h-4 w-10 items-center rounded-full shadow-xl shadow-black/30", checked ? "bg-blue-600 " : "bg-white/10 ", "transition duration-500 ease-in-out")}>
														<span className={clsx("size-5 rounded-full bg-white", " transition duration-500 ease-in-out", checked ? "translate-x-5" : "translate-x-0")} />
													</button>
												)}
											</Switch>
											<h2 className="font-bold">New Subs</h2>
										</div>

										<div className="flex items-center gap-2">
											<Switch
												checked={isSubsOnlyShared}
												onChange={(c) => {
													setIsSubsOnlyShared(c);
													handleEventTimerChange(isSubsEnabled, c, isGoalsEnabled, isCountersEnabled);
												}}
												as={Fragment}
											>
												{({ checked }) => (
													<button className={clsx("group inline-flex h-4 w-10 items-center rounded-full shadow-xl shadow-black/30", checked ? "bg-blue-600 " : "bg-white/10 ", "transition duration-500 ease-in-out")}>
														<span className={clsx("size-5 rounded-full bg-white", " transition duration-500 ease-in-out", checked ? "translate-x-5" : "translate-x-0")} />
													</button>
												)}
											</Switch>
											<h3 className="font-bold">Only subs shared in chat</h3>
										</div>
									</div>
									<div className="pl-4 flex flex-col gap-2">
										{subs &&
											subs.length > 0 &&
											subs.map((s, i) => (
												<div key={s.name + i} className="flex items-center gap-2">
													<SubTimerElement key={s.name + i} sub={s} onChange={handleSubTimerChange} enabled={isSubsEnabled} />
												</div>
											))}
									</div>
								</div>
								<div className="separator"></div>
								{/* 
									--------------------------------------------------------------------------------
									Goals
									--------------------------------------------------------------------------------
								*/}
								<div className="flex flex-col gap-4">
									<div className="flex items-center gap-2">
										<Switch
											checked={isGoalsEnabled}
											onChange={(c) => {
												setIsGoalsEnabled(c);
												handleEventTimerChange(isSubsEnabled, isSubsOnlyShared, c, isCountersEnabled);
											}}
											as={Fragment}
										>
											{({ checked }) => (
												<button className={clsx("group inline-flex h-4 w-10 items-center rounded-full shadow-xl shadow-black/30", checked ? "bg-blue-600 " : "bg-white/10 ", "transition duration-500 ease-in-out")}>
													<span className={clsx("size-5 rounded-full bg-white", " transition duration-500 ease-in-out", checked ? "translate-x-5" : "translate-x-0")} />
												</button>
											)}
										</Switch>
										<h2 className="font-bold">Goals Completion</h2>
									</div>
									<div className="pl-4 flex flex-col gap-2">
										{goals &&
											goals.length > 0 &&
											goals.map((g, i) => (
												<div key={g.label + i} className="flex items-center gap-2">
													<GoalTimerElement key={g.label + i} goal={g} onChange={handleGoalTimerChange} enabled={isGoalsEnabled} />
												</div>
											))}
									</div>
								</div>
							</div>
						) : (
							<div className="p-2">
								<h2 className="font-bold">Please reload the Fansly streaming panel</h2>
							</div>
						)}
					</div>

					<div className="separator"></div>
					{/* 
						--------------------------------------------------------------------------------
						Counters
						--------------------------------------------------------------------------------
					*/}
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<Switch
								checked={isCountersEnabled}
								onChange={(c) => {
									setIsCountersEnabled(c);
									handleEventTimerChange(isSubsEnabled, isSubsOnlyShared, isGoalsEnabled, c);
								}}
								as={Fragment}
							>
								{({ checked }) => (
									<button className={clsx("group inline-flex h-4 w-10 items-center rounded-full shadow-xl shadow-black/30", checked ? "bg-blue-600 " : "bg-white/10 ", "transition duration-500 ease-in-out")}>
										<span className={clsx("size-5 rounded-full bg-white", " transition duration-500 ease-in-out", checked ? "translate-x-5" : "translate-x-0")} />
									</button>
								)}
							</Switch>
							<h2 className="font-bold">{"Counters (time per unit added)"}</h2>
						</div>
						<div className="flex flex-col gap-2 pl-4">
							{counters &&
								counters.length > 0 &&
								counters.map((c, i) => (
									<div key={c.name + i} className="items-center">
										<CounterTimerElement key={c.name + i} counter={c} onChange={handleCounterTimerChange} enabled={isCountersEnabled} />
									</div>
								))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
