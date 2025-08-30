import { useEffect, useReducer, useRef } from "react";
import { CommandType } from "./CommandPanel";
import clsx from "clsx";

export function CommandElement({ command, index }: { command: CommandType; index: number }) {
	const commandInfo = useRef<CommandType>({
		name: "",
		short: "",
		description: "",
	});
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	useEffect(() => {
		if (command) {
			commandInfo.current = { ...command };
			forceUpdate();
		}
	}, [command]);
	return (
		<tr className={clsx("divide-x-1 divide-white/10 hover:bg-white/2", !(index % 2) && "bg-white/3 hover:bg-white/5")}>
			<td className="p-2">
				<div className="flex justify-center items-center ">
					<div className="w-34 rounded-2xl flex items-center gap-1 h-8 input input-base !pl-0">
						<div className="border-r border-white/30 m-0 justify-end flex items-center bg-white/10 rounded-l-2xl h-full w-5.5">
							<p className="text-center pr-1.5">!</p>
						</div>
						<p className="text-center text-nowrap font-normal text-md text-white pl-1">{commandInfo.current.name}</p>
					</div>
				</div>
			</td>
			<td className="p-2">
				<div className="flex items-center justify-center">
					<div className="w-15 h-8 flex items-center px-2 rounded-2xl input input-base">
						<p className="text-center text-nowrap font-normal text-md text-white pl-1">{commandInfo.current.short}</p>
					</div>
				</div>
			</td>
			<td className="p-2">
				<div className="flex items-center">
					<p className="text-start text-wrap font-normal text-sm text-white pl-1">{commandInfo.current.description}</p>
				</div>
			</td>
		</tr>
	);
}
