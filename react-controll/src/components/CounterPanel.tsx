import { Button } from "@headlessui/react";
// import clsx from "clsx";
// import { Fragment } from "react/jsx-runtime";
import { CounterElement, CounterListType, CounterType } from "./CounterElement";
import { useEffect, useReducer, useRef } from "react";

export const CounterPanel = () => {
	const [, forceUpdate] = useReducer((x) => x + 1, 0);
	const counterList = useRef<CounterType[]>([]);

	useEffect(() => {
		fetch("http://localhost:3000/getCounterList", {
			method: "POST",
		})
			.then((response) => response.json())
			.then((data: CounterListType[]) => {
				counterList.current = data.map((d: CounterListType) => {
					const newData: CounterType = {
						name: "",
						shortcut: "",
						active: true,
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
				});
				forceUpdate();
			});
	}, []);

	const deleteCounter = (data: CounterType[]) => {
		counterList.current = data;

		forceUpdate();
	};

	const addCounter = () => {
		fetch("http://localhost:3000/addCounter", {
			method: "POST",
		})
			.then((response) => response.json())
			.then((data) => {
				counterList.current = data.map((d: CounterListType) => {
					const newData: CounterType = {
						name: "",
						shortcut: "",
						active: true,
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
				});
				forceUpdate();
			});
	};
	return (
		<div className="w-full min-w-200 rounded-xl flex flex-col p-2 gap-2 border-1 border-white/10 bg-panel-primary">
			<div className="flex items-center p-2 justify-between">
				<div className="flex items-center px-1">
					<h2 className="text-nowrap text-white font-bold text-base">Counters</h2>
				</div>
				<Button onClick={addCounter} className={"rounded-xl p-1 w-40 bg-blue-700 hover:bg-blue-600 border-1 border-white/0 hover:border-white/20 shadow-lg"}>
					Add counter
				</Button>
			</div>
			<div className="overflow-auto rounded-lg border-1 border-white/20 bg-panel-secundary shadow-xl shadow-black/40">
				<table className="table-fixed w-full">
					<thead className="bg-white/10 rounded-t-lg broder-b-4 border-white/20 border-b-4 border-b-white/20">
						<tr className="h-8 divide-x-1 divide-white/10">
							{/* <th className=" w-20"></th> */}
							<th className=" w-60">Counter name</th>
							<th className="w-30">Shortcut</th>
							<th className=" ">Variables</th>
							<th className=" w-16 ">Delete</th>
						</tr>
					</thead>
					<tbody className="divide-y-1 divide-white/10">
						{counterList.current &&
							counterList.current.length > 0 &&
							counterList.current.map((item, index) => (
								<CounterElement index={index} nombre={item.name} shortcut={item.shortcut} active={item.active} counterType={"correct"} variables={item.varList} key={index} onDelete={deleteCounter} />
							))}
					</tbody>
				</table>
			</div>
		</div>
	);
};
