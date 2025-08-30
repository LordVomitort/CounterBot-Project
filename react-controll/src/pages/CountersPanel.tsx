import { CounterPanel } from "../components/CounterPanel";
import { CountersStats } from "../components/CountersStats";

export function CountersPanel() {
	return (
		<div className="flex flex-col p-2 gap-1">
			<h1 className="text-2xl font-bold px-4 p-2">Counters settings</h1>
			<div className="h-screen overflow-hidden justify-between gap-2 flex flex-col xl:flex-row xl:gap-4">
				<CounterPanel />
				<CountersStats />
			</div>
		</div>
	);
}
