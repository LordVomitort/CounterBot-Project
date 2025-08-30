import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import clsx from "clsx";
import { useEffect, useReducer, useRef, useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

const FontWeight = ({ value, selected, onWeight }: { value: string; selected: string; onWeight: (weight: string) => void }) => {
	const [selectedWeight, setSelectedWeight] = useState<string>("");
	const valueList = useRef<string[]>([]);
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	function filterWeights(values: string) {
		const weights = values.split(":")[1].split(",");
		const result = [];

		if (weights.includes("regular") || weights.includes("400")) {
			result.push("Regular");
		}
		if (weights.includes("500")) {
			result.push("Medium");
		}
		if (weights.includes("800") || weights.includes("bold")) {
			result.push("Bold");
		}
		if (weights.includes("italic")) {
			result.push("Italic");
		}
		if (weights.includes("500italic")) {
			result.push("Italic medium");
		}
		if (weights.includes("800italic")) {
			result.push("Italic bold");
		}

		valueList.current = result;
	}
	function convertWeight(value: string) {
		switch (value) {
			case "regular":
			case "400":
				return "Regular";
			case "500":
				return "Medium";
			case "800":
			case "bold":
				return "Bold";
			case "italic":
				return "Italic";
			case "500italic":
				return "Italic medium";
			case "800italic":
				return "Italic bold";
		}
		return "";
	}
	function weightToValue(val: string) {
		switch (val) {
			case "Regular":
				if (value.includes("regular")) return "regular";
				else return "400";
			case "Medium":
				return "500";
			case "Bold":
				if (value.includes("bold")) return "bold";
				else return "800";
			case "Italic":
				return "italic";
			case "Italic medium":
				return "500italic";
			case "Italic bold":
				return "800italic";
		}
		return "";
	}

	function ChangeWeight(value: string) {
		setSelectedWeight(() => value);
		onWeight(weightToValue(value));
		// console.log(weightToValue(value));
	}

	useEffect(() => {
		if (value && selected) {
			filterWeights(value);
			setSelectedWeight(() => convertWeight(selected));
			forceUpdate();
		}
		// console.log("drop weight", value, selected);
	}, [value, selected]);
	return (
		<div>
			{selectedWeight && valueList.current.length > 0 && (
				<Listbox as={"div"} value={selectedWeight} onChange={ChangeWeight}>
					<div className="relative">
						{/* <ListboxButton
							className={clsx(
								" flex items-center gap-4 justify-between w-full min-w-40 rounded-lg bg-white/5 py-1.5 px-2 text-right text-sm/6 text-white",
								"outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
							)}
						> */}
						<ListboxButton className={clsx("flex items-center justify-between min-w-40 input input-base px-2 text-right text-sm/6 w-full")}>
							<FiChevronDown className="group pointer-events-none  size-5 " aria-hidden="true" />
							{selectedWeight}
						</ListboxButton>
						<ListboxOptions
							anchor={{ to: "bottom end", gap: "6px" }}
							as="div"
							className={clsx(
								"z-30 relative w-(--button-width) rounded-xl border border-white/30 bg-gray-800/30 [--anchor-gap:var(--spacing-1)] focus:outline-none",
								"p-1 transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 backdrop-blur-sm"
							)}
						>
							{valueList.current.length > 0 &&
								valueList.current.map((val) => (
									<ListboxOption value={val} key={val}>
										{({ focus, selected }) => (
											<div className={clsx("flex px-1 items-center justify-between cursor-default rounded-lg", focus && "bg-slate-600/50")}>
												<FiChevronRight className={clsx("size-4", !selected && "invisible")} />
												<div className="flex items-center">{val}</div>
											</div>
										)}
									</ListboxOption>
								))}
						</ListboxOptions>
					</div>
				</Listbox>
			)}
		</div>
	);
};

export default FontWeight;
