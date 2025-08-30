import { DonothonStatsPanel } from "../components/DonothonStatsPanel";
import { TimerPanel } from "../components/TimerPanel";

export function TimerPage() {
	return (
		<div className="flex flex-col gap-2">
			<div className="p-2">
				<h1 className="text-2xl font-bold">Donothon Timer</h1>
			</div>
			<div className="flex gap-2 flex-col xl:flex-row">
				<TimerPanel />
				<DonothonStatsPanel />
			</div>
		</div>
	);
}
