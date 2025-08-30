import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { FontType } from "../FontLoader";
import { Virtuoso } from "react-virtuoso";
import clsx from "clsx";

export const DropDown = ({ fontsList, select, onChange }: { fontsList: FontType[]; select: FontType; onChange: (value: FontType) => void }) => {
	const _default: FontType = { family: "Default", value: "" };
	const [selectedFont, setSelectedFont] = useState<FontType>(_default);
	const list = useRef<FontType[]>([]);
	const fontIndex = useRef(0);

	const [query, setQuery] = useState("");

	useEffect(() => {
		if (fontsList) {
			list.current = fontsList;
			// if (select) {
			// 	setSelectedFont(() => fontsList[fontsList.findIndex((f) => f.family === select.family)]);
			// 	fontIndex.current = fontsList.findIndex((f) => f.family === select.family);
			// 	console.log(select);
			// }
		}
	}, [fontsList]);

	useEffect(() => {
		if (select && select.family != "") {
			setSelectedFont(() => list.current[list.current.findIndex((f) => f.family === select.family)]);
			fontIndex.current = list.current.findIndex((f) => f.family === select.family);
		}
	}, [select]);

	const filtered = useMemo(() => {
		if (!query) return list.current;
		const q = query.toLowerCase();
		return list.current.filter((f) => f.family.toLowerCase().includes(q));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query, list.current]);

	const ChangeFont = (value: FontType) => {
		fontIndex.current = list.current.findIndex((f) => f.family === value.family);
		setSelectedFont(() => value);
		onChange(value);
		// fetch("http://localhost:3000/fontChange", {
		// 	method: "POST",
		// 	headers: { "Content-Type": "application/json" },
		// 	body: JSON.stringify({
		// 		value,
		// 		index: index,
		// 	}),
		// });
	};

	return (
		<div className="flex justify-end ">
			<div className="w-full h-full ">
				{selectedFont && list.current.length > 0 && (
					<Listbox as={"div"} value={selectedFont} onChange={ChangeFont}>
						{() => (
							<div className="relative">
								<ListboxButton
									// className={clsx(
									// 	"z-30 relative flex items-center gap-4 justify-between w-full min-w-40 rounded-lg bg-white/5 py-1.5 px-2 text-right text-sm/6 text-white",
									// 	"focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
									// )}
									className={clsx("z-30 relative flex items-center gap-4 justify-between min-w-40 input input-base px-2 text-right text-sm/6 ")}
								>
									<FiChevronDown className="group pointer-events-none  size-5 " aria-hidden="true" />
									{selectedFont.family}
								</ListboxButton>
								{/* {open && <div className="fixed inset-0 z-10 backdrop-blur-sm bg-black/30" onClick={(e) => e.stopPropagation()}></div>} */}
								<ListboxOptions
									anchor={{ to: "bottom end", gap: "6px" }}
									as="div"
									className={clsx(
										"z-30 relative w-auto min-w-max rounded-xl border border-white/30 bg-gray-800/50 [--anchor-gap:var(--spacing-1)] focus:outline-none",
										"transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 backdrop-blur-sm"
									)}
								>
									<div className="flex flex-col w-70 p-2 !pr-0 gap-1">
										<input type="text" className="mr-2 px-4 p-1 rounded-xl border text-white " placeholder="Buscar..." value={query} onChange={(e) => setQuery(() => e.target.value)} onKeyDown={(e) => e.stopPropagation()} />
										{filtered.length === 0 ? (
											<div className="p-2 text-sm text-gray-400">No se encontró "{query}"</div>
										) : (
											<Virtuoso
												className="!h-100 w-full "
												data={filtered}
												initialTopMostItemIndex={fontIndex.current}
												itemContent={(index, font) => {
													return (
														<>
															<div className={clsx("h-px my-1 mx-3 self-center", index < filtered.length && "bg-white/15")} />
															<ListboxOption value={font} as={Fragment}>
																{({ focus, selected }) => {
																	return (
																		<div className={clsx("flex gap-2 items-center cursor-default rounded-lg  px-3 data-[focus]:bg-white/10 whitespace-nowrap", focus && "bg-slate-600")}>
																			<FiChevronRight className={clsx("size-4 ", !selected && "invisible")} />
																			<div className="text-sm/6 text-white whitespace-nowrap">{font.family}</div>
																		</div>
																	);
																}}
															</ListboxOption>
														</>
													);
												}}
											/>
										)}
									</div>
								</ListboxOptions>
							</div>
						)}
					</Listbox>
				)}
			</div>
		</div>
	);
};
