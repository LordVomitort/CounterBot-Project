import { Button, Input } from "@headlessui/react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
// import { FiTrash } from "react-icons/fi";
import { FaTrash } from "react-icons/fa6";
export interface VarListType {
	name: string;
	value: number;
}
export interface CounterType {
	name: string;
	active: boolean;
	shortcut: string;
	bestDate: string;
	monthBestDate: string;
	value: number;
	varList: string[];
}
export interface CounterListType {
	name: string;
	id: number;
	shortcut: string;
	bestDate: string;
	monthBestDate: string;
	value: number;
	varList: VarListType[];
}
export const CounterElement = ({
	index,
	nombre,
	shortcut,
	active,
	counterType,
	variables,
	onDelete,
}: {
	index: number;
	nombre: string;
	shortcut: string;
	active: boolean;
	counterType: string;
	variables: string[];
	onDelete: (data: CounterType[]) => void;
}) => {
	const counterIndex = useRef<number>(0);
	const [isActive, setIsActive] = useState(false);
	const [isDisabled, setIsDisabled] = useState(false);
	const [isCorrect, setIsCorrect] = useState(true);
	const [isShortCorrect, setIsShortCorrect] = useState(true);
	const [counterName, setCounterName] = useState("");
	const [counterShort, setCounterShort] = useState("");
	const [varList, setVarList] = useState<string[]>([]);

	useEffect(() => {
		counterIndex.current = index;
		if (index == 0) {
			setIsDisabled(() => true);
		}
	}, [index]);
	useEffect(() => {
		if (counterType) {
			switch (counterType) {
				case "incorrect":
					// setIsCorrect(() => false);
					break;
				case "correct":
					setIsCorrect(() => true);
					break;
			}
		}
	}, [counterType]);
	useEffect(() => {
		if (nombre) {
			setCounterName(() => nombre);
		}
	}, [nombre]);
	useEffect(() => {
		if (shortcut) setCounterShort(() => shortcut);
	}, [shortcut]);
	useEffect(() => {
		setIsActive(() => active);
	}, [active]);
	useEffect(() => {
		setVarList(() => variables);
	}, [variables]);

	const ChangeValue = (val: string, type: string) => {
		const _aux = {
			switch: isActive,
			counterName: counterName,
			shortcut: counterShort,
		};
		switch (type) {
			case "switch":
				setIsActive(val == "true");
				_aux.switch = val == "true";
				// console.log("active");
				break;
			case "input":
				setCounterName(() => val);
				_aux.counterName = val;
				break;
			case "short":
				setCounterShort(() => val);
				_aux.shortcut = val;
		}
		fetch("http://localhost:3000/counterModify", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				value: {
					name: _aux.counterName,
					active: _aux.switch,
					shortcut: _aux.shortcut,
				},
				index: counterIndex.current,
			}),
		})
			.then((data) => data.json())
			.then((data) => {
				// console.log(data.varList);
				if (data.varList.length == 0) {
					if (type == "input") {
						setIsCorrect(() => false);
						setIsShortCorrect(() => true);
					} else {
						setIsCorrect(() => true);
						setIsShortCorrect(() => false);
					}
				} else {
					// if (data.varList.length === 1 && data.varList[0] == "short") setIsShortCorrect(() => false);
					setIsShortCorrect(() => true);
					setIsCorrect(() => true);
				}
				if (data.varList[0] == "short") setVarList(() => ["short"]);
				else setVarList(() => data.varList.map((p: VarListType) => `{${p.name}}`));
				// console.log(data);
			});
	};

	const DeleteCounter = () => {
		fetch("http://localhost:3000/deleteCounter", {
			method: "POST",
			headers: { "Content-type": "application/json" },
			body: JSON.stringify({
				index: counterIndex.current,
			}),
		})
			.then((data) => data.json())
			.then((data) => {
				onDelete(
					data.map((d: CounterListType) => {
						const newData: CounterType = {
							name: "",
							active: true,
							shortcut: "",
							bestDate: "",
							monthBestDate: "",
							value: 0,
							varList: [],
						};
						newData.name = d.name;
						newData.shortcut = d.shortcut;
						newData.bestDate = d.bestDate;
						newData.monthBestDate = d.monthBestDate;
						newData.value = d.value;
						newData.varList = d.varList.map((vl) => `{${vl.name}}`);
						return newData;
					})
				);
			});
	};

	return (
		<>
			<tr className={clsx("divide-x-1 divide-white/10 hover:bg-white/2 transition-colors duration-300", !(index % 2) && "bg-white/3 hover:bg-white/5")}>
				{/* <td className="">
					<div className="flex justify-center items-center">
						<Switch checked={isActive && isCorrect} onChange={(e) => ChangeValue(e.toString(), "switch")} disabled={isDisabled} as={Fragment}>
							{({ checked, disabled }) => (
								<button
									className={clsx(
										"group inline-flex h-4 w-10 items-center rounded-full",
										checked ? "bg-blue-600" : "bg-white/10",
										disabled && "cursor-not-allowed opacity-50",
										"transition duration-500 ease-in-out"
									)}
								>
									<span className={clsx("size-5 rounded-full bg-white transition duration-500 ease-in-out", checked ? "translate-x-5" : "translate-x-0")} />
								</button>
							)}
						</Switch>
					</div>
				</td> */}
				<td className="p-2">
					<div className="flex justify-center items-center">
						<Input
							type="text"
							value={counterName}
							onChange={(e) => ChangeValue(e.target.value, "input")}
							className={clsx("px-4 border-1 input input-base shadow-xl shadow-black/30", !isCorrect && "bg-red-700/20 data-[hover]:bg-red-700/30", isCorrect && "")}
						/>
					</div>
				</td>
				<td className="p-2">
					<div className="flex justify-center items-center">
						<Input
							type="text"
							value={counterShort}
							onChange={(e) => ChangeValue(e.target.value, "short")}
							className={clsx("px-4 w-20 border-1 input input-base shadow-xl shadow-black/30", !isShortCorrect && "bg-red-700/20 data-[hover]:bg-red-700/30", isShortCorrect && "")}
						/>
					</div>
				</td>
				<td className="p-2">
					<div className="flex flex-wrap items-center text-center gap-1">
						{varList.length > 0 ? (
							varList.map((v, i) => (
								<div key={i}>
									<p className="text-center text-nowrap font-normal text-sm text-white/50">{v}</p>
								</div>
							))
						) : !isCorrect ? (
							<div className="text-center text-nowrap font-normal text-sm text-red-400">Invalid name</div>
						) : (
							<div className="text-center text-nowrap font-normal text-sm text-red-400">Invalid shortcut</div>
						)}
					</div>
				</td>

				<td className="">
					<div className="flex justify-center items-center">
						<Button onClick={DeleteCounter} disabled={isDisabled} className={clsx(isDisabled && "opacity-20 cursor-not-allowed")}>
							<FaTrash className="size-4 brightness-80 hover:brightness-500 hover:shadow-xl shadow-white/80 hover:size-5" />
						</Button>
					</div>
				</td>
			</tr>
		</>
	);
};
