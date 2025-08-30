import { useEffect, useState } from "react";
import { CounterStat } from "./CounterStat";
import { CounterListType } from "./CounterElement";

export function CountersStats() {
	const [counters, setCounters] = useState<CounterListType[]>([]);

	useEffect(() => {
		const eventSource = new EventSource("http://localhost:3000/counters/statsPanel");
		eventSource.onmessage = (event) => {
			setCounters(JSON.parse(event.data));
		};
		return () => {
			eventSource.close();
		};
	}, []);

	return (
		<div className="bg-panel-primary rounded-xl border-1 border-white/10 p-2 flex flex-col w-full">
			<div className="flex items-center px-1 py-2">
				<h2 className="text-base font-bold p-2 px-2">Stats</h2>
			</div>

			<div className="flex flex-col gap-4">{counters && counters.map((c) => <CounterStat key={c.name} counter={c} />)}</div>
		</div>
	);
}
