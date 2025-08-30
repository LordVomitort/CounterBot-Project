import { useEffect, useReducer, useRef } from "react";
import { CommandElement } from "./CommandElement";

export interface CommandType {
	name: string;
	short: string;
	description: string;
}

interface CommandDataType {
	command: string;
	shortcut: string;
	description: string;
}

export function CommandPanel() {
	const commandList = useRef<CommandType[]>([]);
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	useEffect(() => {
		fetch("http://localhost:3000/getCommandList", { method: "POST" })
			.then((data) => data.json())
			.then((data) => {
				commandList.current = data.map((c: CommandDataType) => {
					const comm: CommandType = {
						name: "",
						short: "",
						description: "",
					};
					comm.name = c.command;
					comm.short = c.shortcut;
					comm.description = c.description;
					return comm;
				});
				forceUpdate();
			});
	}, []);
	return (
		<div className="w-full rounded-xl flex flex-col p-2 bg-panel-primary border-1 border-white/20">
			<div className="overflow-auto rounded-xl border-1 bg-panel-secundary border-white/20">
				<table className="table-fixed w-full">
					<thead className="bg-white/10 rounded-t-lg broder-b-4 border-white/20 border-b-4 border-b-white/20">
						<tr className="h-8 divide-x-1 divide-white/10">
							<th className=" w-40">Command name</th>
							<th className="w-30">Shortcut</th>
							<th className="text-left pl-4">Description</th>
						</tr>
					</thead>
					<tbody className="divide-y-1 divide-white/10">{commandList.current && commandList.current.length > 0 && commandList.current.map((c, i) => <CommandElement key={c.name} index={i} command={c} />)}</tbody>
				</table>
			</div>
		</div>
	);
}
