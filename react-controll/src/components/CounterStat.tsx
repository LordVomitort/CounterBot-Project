import { useState } from "react";
import { CounterListType } from "./CounterElement";
import clsx from "clsx";

export function CounterStat({ counter }: { counter: CounterListType }) {
	const [expanded, setExpanded] = useState(false);
	return (
		<div
			className={clsx(
				"flex flex-col rounded-xl overflow-auto border-1 border-white/10 transition-all duration-300 shadow-xl shadow-black/40 ",
				expanded ? "bg-panel-secundary border-1 border-white/20" : "panel-secundary border-white/20 hover:border-white/30"
			)}
		>
			<table className="table-fixed w-full">
				<thead className="bg-white/10">
					<tr className="border-b-1 border-b-white/20">
						<th className="">
							<p className="text-start mx-2 m-1">Counter name</p>
						</th>
						<th>
							<p className="text-end mx-2 m-1">Value</p>
						</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>
							<p className="text-start px-3 p-2">{counter.name}</p>
						</td>
						<td>
							<p className="text-end px-4 p-2">{counter.value}</p>
						</td>
					</tr>
				</tbody>
			</table>
			<div className={clsx("px-2 w-full overflow-hidden relative flex flex-col", expanded && "gap-2 pb-2", !expanded && "pb-1")}>
				<input className="buttonEdit w-full peer absolute inset-x-0 top-0 h-6 cursor-pointer opacity-0 z-10" type="checkbox" checked={expanded} onChange={() => {}} onClick={() => setExpanded(!expanded)} />
				<div className={clsx("bg-blue-600 h-6 w-full flex items-center flex-col rounded-lg")}>{expanded ? "Show less" : "Show more"}</div>
				<div className={clsx("panel-terciary flex flex-col overflow-hidden transition-all duration-300", expanded ? "max-h-180 opacity-100 shadow-md shadow-black/40" : "max-h-0 opacity-0 my-0")}>
					<div className="bg-white/10 border-b-1 border-white/10">
						<h3 className="font-normal text-base mt-1 mx-2">Other values</h3>
					</div>
					<table className="table-auto w-full">
						<tbody>
							{counter.varList &&
								counter.varList.map((v, index) => {
									return (
										<tr key={v.name} className={clsx(!(index % 2) && "bg-white/3")}>
											<td>
												<p className="text-start mx-2 m-1">{v.name}</p>
											</td>
											<td>
												<p className="text-end mx-2">{v.value}</p>
											</td>
										</tr>
									);
								})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
