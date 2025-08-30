import { Button } from "@headlessui/react";
import { useEffect, useReducer, useRef } from "react";
import { FiX } from "react-icons/fi";

export function AllowedName({ name, onDelete }: { name: string; onDelete: (name: string) => void }) {
	const userName = useRef("");
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	useEffect(() => {
		if (name) {
			userName.current = name;
			forceUpdate();
		}
	}, [name]);

	function Delete() {
		onDelete(userName.current);
	}
	return (
		<div className="shadow-xl shadow-black/30 flex rounded-3xl h-6 bg-green-700/50 hover:bg-green-700/80 p-1 px-2 w-fit items-center gap-1">
			<div className="flex">
				<p className="text-sm">{name}</p>
			</div>
			<div className="flex">
				<Button onClick={Delete}>
					<FiX size={15} />
				</Button>
			</div>
		</div>
	);
}
