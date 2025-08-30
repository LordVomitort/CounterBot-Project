import { CommandPanel } from "../components/CommandPanel";
import { CommandAccessPanel } from "../components/CommandsAccessPanel";

export function ControlPanel() {
	return (
		<div className="flex flex-col p-2">
			<CommandAccessPanel />
			<CommandPanel />
		</div>
	);
}
