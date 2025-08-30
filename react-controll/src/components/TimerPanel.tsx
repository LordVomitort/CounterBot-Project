import { Fragment, useEffect, useState } from "react";
import { TimerDonothonConfig } from "./TimerDonothonConfig";
import { Button, Switch } from "@headlessui/react";
import clsx from "clsx";

export interface TimeType {
	seconds: number;
	minutes: number;
	hours: number;
}
export function TimerPanel() {
	const [isTimerEnabled, setIsTimerEnabled] = useState(true);
	const [remainingTime, setRemainingTime] = useState<TimeType>({
		seconds: 0,
		minutes: 0,
		hours: 0,
	});

	useEffect(() => {
		const eventSource = new EventSource("http://localhost:3000/timer/preview");

		eventSource.onmessage = (evnt) => {
			const evento = JSON.parse(evnt.data);
			switch (evento.type) {
				case "set":
					setIsTimerEnabled(evento.data);
					break;
				case "timerUpdate":
					UpdateTimer(evento.data);
					break;
			}
		};

		return () => {
			eventSource.close();
		};
	}, []);

	function UpdateTimer(time: number) {
		if (time !== undefined) {
			setRemainingTime((t) => ({ ...t, seconds: time % 60, minutes: Math.floor((time / 60) % 60), hours: Math.floor(time / 3600) }));
		}
	}
	const FormatTime = (value: number) => value.toString().padStart(2, "0");

	function StartTimer() {
		fetch("http://localhost:3000/timer/start", { method: "POST" });
	}
	function AddTime(tiempo: number) {
		fetch("http://localhost:3000/timer/addTime", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ seconds: tiempo }),
		});
	}
	function resetTimer() {
		fetch("http://localhost:3000/timer/reset", { method: "POST" });
	}
	function EnableTimer(en: boolean) {
		fetch("http://localhost:3000/timer/enable", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ enabled: en }),
		});
	}
	return (
		<div className="bg-panel-primary border-1 border-white/20 rounded-xl w-full min-w-170 p-2 flex flex-col gap-2">
			<div className="flex gap-2 items-center px-4">
				<h2 className="font-bold text-lg">Enable Timer</h2>
				<Switch
					checked={isTimerEnabled}
					onChange={(c) => {
						setIsTimerEnabled(c);
						EnableTimer(c);
					}}
					as={Fragment}
				>
					{({ checked }) => (
						<button className={clsx("group inline-flex h-4 w-10 items-center rounded-full shadow-xl shadow-black/30", checked ? "bg-blue-600 " : "bg-white/10 ", "transition duration-500 ease-in-out")}>
							<span className={clsx("size-5 rounded-full bg-white", " transition duration-500 ease-in-out", checked ? "translate-x-5" : "translate-x-0")} />
						</button>
					)}
				</Switch>
			</div>
			<div className="panel-secundary flex flex-col gap-2 p-2">
				<div className="p-2 panel-terciary rounded-xl border-1 border-white/20 justify-center flex">
					<p className="font-black text-5xl">
						{FormatTime(remainingTime.hours)}
						{":"}
						{FormatTime(remainingTime.minutes)}
						{":"}
						{FormatTime(remainingTime.seconds)}
					</p>
				</div>
				<div className="flex gap-4 panel-terciary p-2">
					<div className="h-fit grid grid-cols-1 gap-y-1">
						<Button className={clsx(isTimerEnabled ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-600", "transition-colors  duration-300 border-1 border-white/20  rounded-lg w-20 h-8")} onClick={StartTimer}>
							Start/Stop
						</Button>
						<Button className="border-1 border-white/20 bg-rose-600 hover:bg-rose-700 rounded-lg w-20 h-8" onClick={resetTimer}>
							Reset
						</Button>
					</div>

					<div className="grid grid-cols-2 gap-x-1 gap-y-1">
						<Button className="border-1 border-white/20 bg-green-600 hover:bg-green-700 rounded-lg w-20 h-8" onClick={() => AddTime(3600)}>
							+1hr
						</Button>
						<Button className="border-1 border-white/20 bg-rose-600 hover:bg-rose-700 rounded-lg w-20 h-8" onClick={() => AddTime(-3600)}>
							-1hr
						</Button>
						<Button className="border-1 border-white/20 bg-green-600 hover:bg-green-700 rounded-lg w-20 h-8" onClick={() => AddTime(36000)}>
							+10hr
						</Button>
						<Button className="border-1 border-white/20 bg-rose-600 hover:bg-rose-700 rounded-lg w-20 h-8" onClick={() => AddTime(-36000)}>
							-10hr
						</Button>
						<Button className="border-1 border-white/20 bg-green-600 hover:bg-green-700 rounded-lg w-20 h-8" onClick={() => AddTime(360000)}>
							+100hr
						</Button>
						<Button className="border-1 border-white/20 bg-rose-600 hover:bg-rose-700 rounded-lg w-20 h-8" onClick={() => AddTime(-360000)}>
							-100hr
						</Button>
					</div>

					<div className="h-fit grid grid-cols-2 gap-y-1 gap-x-1">
						<Button className="border-1 border-white/20 bg-green-600 hover:bg-green-700 rounded-lg w-20 h-8" onClick={() => AddTime(60)}>
							+1min
						</Button>
						<Button className="border-1 border-white/20 bg-rose-600 hover:bg-rose-700 rounded-lg w-20 h-8" onClick={() => AddTime(-60)}>
							-1min
						</Button>
						<Button className="border-1 border-white/20 bg-green-600 hover:bg-green-700 rounded-lg w-20 h-8" onClick={() => AddTime(600)}>
							+10min
						</Button>
						<Button className="border-1 border-white/20 bg-rose-600 hover:bg-rose-700 rounded-lg w-20 h-8" onClick={() => AddTime(-600)}>
							-10min
						</Button>
					</div>

					<div className="h-fit grid grid-cols-2 gap-y-1 gap-1">
						<Button className="border-1 border-white/20 bg-green-600 hover:bg-green-700 rounded-lg w-20 h-8" onClick={() => AddTime(1)}>
							+1sec
						</Button>
						<Button className="border-1 border-white/20 bg-rose-600 hover:bg-rose-700 rounded-lg w-20 h-8" onClick={() => AddTime(-1)}>
							-1sec
						</Button>
						<Button className="border-1 border-white/20 bg-green-600 hover:bg-green-700 rounded-lg w-20 h-8" onClick={() => AddTime(10)}>
							+10sec
						</Button>
						<Button className="border-1 border-white/20 bg-rose-600 hover:bg-rose-700 rounded-lg w-20 h-8" onClick={() => AddTime(-10)}>
							-10sec
						</Button>
					</div>
				</div>
			</div>

			<TimerDonothonConfig />
		</div>
	);
}
