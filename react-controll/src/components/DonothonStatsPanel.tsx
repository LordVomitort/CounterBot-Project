import { Button } from "@headlessui/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { FcCheckmark } from "react-icons/fc";

interface BaseStatType {
	amount: number;
	active: boolean;
}
interface SubStatType {
	id: string;
	name: string;
	price: number;
	color: string;
	amount: number;
	active: boolean;
}
interface CounterStatType {
	id: number;
	name: string;
	amount: number;
	active: boolean;
}
export function DonothonStatsPanel() {
	const [copy, setCopy] = useState(false);

	const [followers, setFollowers] = useState<BaseStatType | null>(null);
	const [tips, setTips] = useState<BaseStatType | null>(null);
	const [goals, setGoals] = useState<BaseStatType | null>(null);

	const [subs, setSubs] = useState<SubStatType[]>([]);
	const [subsActive, setSubsActive] = useState(false);
	const [counters, setCounters] = useState<CounterStatType[]>([]);
	const [countersActive, setCountersActive] = useState(false);

	// useEffect(() => {
	// 	if (subs && subs.length > 1) {
	// 		setSubsActive(false);
	// 		subs.forEach((s) => {
	// 			if (s.active) setSubsActive(true);
	// 		});
	// 	}
	// }, [subs]);
	useEffect(() => {
		const eventSource = new EventSource("http://localhost:3000/timer/donothon");
		eventSource.onmessage = (ev) => {
			const evento = JSON.parse(ev.data);
			switch (evento.type) {
				case "followers":
					if (evento.data) {
						setFollowers(evento.data);
					}
					break;
				case "tips":
					if (evento.data) {
						setTips(evento.data);
					}
					break;
				case "goals":
					if (evento.data) {
						setGoals(evento.data);
					}
					break;
				case "subs":
					if (evento.data) {
						setSubs(() => evento.data);
						setSubsActive(() => false);
						if (evento.data.length > 0) {
							evento.data.forEach((s: SubStatType) => {
								if (s.active) setSubsActive(true);
							});
						}
					}
					break;
				case "counters":
					if (evento.data) {
						setCounters(() => evento.data);
						setCountersActive(() => false);
						if (evento.data.length > 1) {
							evento.data.forEach((c: CounterStatType) => {
								if (c.active) setCountersActive(() => true);
							});
						}
					}
					break;
			}
		};
	}, []);

	function formatPrice(p: number) {
		const integerPart = Math.floor(p / 1000);
		const remainder = p % 1000;
		if (remainder === 0) return integerPart.toString();

		let decimals = remainder.toString().padStart(3, "0");
		decimals = decimals.replace(/0+$/, "");
		return `${integerPart}.${decimals}`;
	}

	function NewStatsPage() {
		fetch("http://localhost:3000/timer/donothon/newpage");
	}
	return (
		<div className="w-full bg-panel-primary rounded-xl border-1 border-white/20 flex flex-col p-2 gap-2 overflow-hidden">
			<div className="flex items-center justify-between px-2">
				<h1 className="text-xl font-bold">Donothon Stats</h1>
				<Button className={clsx(" rounded-lg p-1 px-4", "bg-blue-800 hover:bg-blue-700")} onClick={NewStatsPage}>
					New stats page
				</Button>
			</div>
			<div className="flex w-full flex-col rounded-xl border-1 border-white/20 bg-panel-secundary shadow-xl shadow-black/40 p-2 gap-2">
				{followers && followers.active && (
					<div className="flex w-full border-1 border-white/20 rounded-xl p-2 panel-terciary">
						<h3 className="whitespace-pre-wrap">{"New followers: "}</h3>
						<h3>{followers.amount}</h3>
					</div>
				)}
				{tips && tips.active && (
					<div className="flex w-full border-1 border-white/20 rounded-xl p-2 panel-terciary">
						<h3 className="whitespace-pre-wrap">Tips: </h3>
						<h3>
							{"$"}
							{formatPrice(tips.amount)}
						</h3>
					</div>
				)}

				{subs && subs.length > 0 && subsActive && (
					<div className="flex flex-col w-full border-1 border-white/20 rounded-xl p-2 gap-2 panel-terciary">
						<h3 className="font-bold">Sub tiers</h3>
						<div className="flex flex-col gap-2">
							{subs.map((s) => {
								if (s.active)
									return (
										<div key={s.id} className="flex justify-between items-center gap-2">
											<div className="flex gap-2 justify-between overflow-hidden items-center w-full p-2 px-4 rounded-[1.25rem] h-10" style={{ backgroundColor: s.color }}>
												<div className="overflow-hidden items-center flex flex-1">
													<span className="whitespace-nowrap text-ellipsis overflow-hidden">{s.name}</span>
												</div>
												<p>
													{"$"}
													{formatPrice(s.price)}
												</p>
											</div>
											<div className="flex justify-between w-35">
												<span className="whitespace-nowrap">New subs: </span>
												<span>{s.amount}</span>
											</div>
										</div>
									);
							})}
						</div>
					</div>
				)}

				{goals && goals.active && (
					<div className="flex border-1 border-white/20 rounded-xl p-2 whitespace-pre-wrap panel-terciary">
						<span className="">{"Goals completed: "}</span> <span>{goals.amount}</span>
					</div>
				)}

				{counters && counters.length > 0 && countersActive && (
					<div className="flex flex-col w-full border-1 border-white/20 rounded-xl p-2 panel-terciary">
						<h3 className="font-bold">Counters units added</h3>
						{counters.map((c) => {
							if (c.active)
								return (
									<div key={c.name} className="flex whitespace-pre-wrap gap-1">
										<span>{c.name}</span>
										{": "}
										<span>{c.amount}</span>
									</div>
								);
						})}
					</div>
				)}
			</div>
			<div className="panel-secundary p-2 flex flex-col gap-2">
				<div className="flex justify-between items-center px-2">
					<span className="font-bold">Overlay URL</span>
					<div className="flex items-center gap-2">
						<FcCheckmark className={clsx("size-6 transition-opacity duration-500 opacity-0", copy && "opacity-100")} />
						<Button
							className={"rounded-xl px-4 p-1 bg-blue-700 hover:bg-blue-600"}
							onClick={() => {
								navigator.clipboard.writeText("http://localhost:3000/timer.html");
								setCopy(true);
								setTimeout(() => setCopy(false), 8000);
							}}
						>
							Copy
						</Button>
					</div>
				</div>

				<div className="bg-stone-900 rounded-xl p-4 border-1 border-white/20">
					<span>http://localhost:3000/timer.html</span>
				</div>
			</div>
		</div>
	);
}
