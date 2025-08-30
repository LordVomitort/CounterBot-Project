import { CommandPanel } from "../components/CommandPanel";
import { CommandAccessPanel } from "../components/CommandsAccessPanel";

export function CommandsPanel() {
	return (
		<div className="flex flex-col">
			<h1 className="text-2xl mx-2">Commands</h1>
			<div className="h-full overflow-hidden lg:flex justify-between">
				<div className="flex flex-col p-2 gap-4">
					<CommandPanel />
					<div className="flex">
						<div className="w-[50%] min-w-170">
							<CommandAccessPanel />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
