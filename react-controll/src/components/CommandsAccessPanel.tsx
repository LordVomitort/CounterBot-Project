import { Input, Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { AllowedName } from "./AllowedName";
import { ForbiddenName } from "./ForbiddenName";

interface ModesType {
	mode: string;
	value: string;
}

const modes: ModesType[] = [
	{ mode: "streamer", value: "Streamer" },
	{ mode: "mod", value: "Moderators" },
	{ mode: "customMod", value: "Custom + Mods" },
	{ mode: "custom", value: "Custom" },
	{ mode: "all", value: "All" },
];

export function CommandAccessPanel() {
	const [selectedMode, setSelectedMode] = useState<ModesType>(modes[1]);
	const [inputText, setInputText] = useState<string>("");
	const [inputBlacklistText, setInputBlacklistText] = useState<string>("");
	const [allowedNames, setAllowedNames] = useState<string[]>([]);
	const [blacklistNames, setBlacklistNames] = useState<string[]>([]);

	const [flash, setFlash] = useState(false);
	const [flashBlacklist, setFlashBlacklist] = useState(false);

	useEffect(() => {
		fetch("http://localhost:3000/getAccessMode", { method: "POST" })
			.then((data) => data.json())
			.then((data) => {
				setSelectedMode(() => modes.find((m) => m.mode == data.mode) ?? modes[1]);
				setAllowedNames(() => data.allowedNames);
				setBlacklistNames(() => data.blacklist);
			});
	}, []);

	// Maneja la pulsación de teclas en el Input
	function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Enter" && inputText.trim() !== "") {
			// Agrega el texto actual a la lista
			if (!allowedNames.includes(inputText) && !blacklistNames.includes(inputText)) {
				setFlash(false);
				setAllowedNames((prev) => [...prev, inputText.trim()]);
				// Limpia el campo
				setInputText("");
				ChangeUserList([...allowedNames, inputText.trim()]);
			} else {
				setFlash(true);
				// setTimeout(() => setFlash(false), 0.2 * 6 * 1000);
			}
		}
	}
	// Maneja la pulsación de teclas en el Input
	function handleKeyDownBl(event: React.KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Enter" && inputBlacklistText.trim() !== "") {
			// Agrega el texto actual a la lista
			if (!allowedNames.includes(inputText) && !blacklistNames.includes(inputBlacklistText)) {
				setFlashBlacklist(false);
				setBlacklistNames((prev) => [...prev, inputBlacklistText.trim()]);
				// Limpia el campo
				setInputBlacklistText("");
				ChangeUserBlacklist([...blacklistNames, inputBlacklistText.trim()]);
			} else {
				setFlashBlacklist(true);
				// setTimeout(() => setFlash(false), 0.2 * 6 * 1000);
			}
		}
	}
	function ChangeUserList(nameList: string[]) {
		fetch("http://localhost:3000/modifyAccessNames", {
			method: "POST",
			headers: { "Content-type": "application/json" },
			body: JSON.stringify({
				allowedNames: nameList,
			}),
		});
		// .then((data) => data.json())
		// .then((data) => console.log(data));
	}
	function ChangeUserBlacklist(nameList: string[]) {
		fetch("http://localhost:3000/modifyBlacklist", {
			method: "POST",
			headers: { "Content-type": "application/json" },
			body: JSON.stringify({
				blacklist: nameList,
			}),
		});
		// .then((data) => data.json())
		// .then((data) => console.log(data));
	}
	function ChandeMode(value: ModesType) {
		setSelectedMode(() => value);
		fetch("http://localhost:3000/modifyAccessMode", {
			method: "POST",
			headers: { "Content-type": "application/json" },
			body: JSON.stringify({
				mode: value.mode,
			}),
		});
		// .then((data) => data.json())
		// .then((data) => console.log(data));
	}

	function Delete(userName: string) {
		setAllowedNames((allowed) => allowed.filter((a) => a !== userName));
		ChangeUserList(allowedNames.filter((a) => a !== userName));
	}
	function DeleteBl(userName: string) {
		setBlacklistNames((forbidden) => forbidden.filter((a) => a !== userName));
		ChangeUserBlacklist(blacklistNames.filter((a) => a !== userName));
	}
	return (
		<div className="w-full border rounded-lg p-2 bg-panel-primary border-white/20 flex flex-col gap-2">
			<div className="flex justify-between items-center">
				<div className="flex items-center ">
					<h2 className="text-sm font-normal">Access mode</h2>
				</div>
				<div className="flex items-center">
					<Listbox as={"div"} value={selectedMode} onChange={(e) => ChandeMode(e)}>
						<div className="relative">
							<ListboxButton className={clsx(" flex items-center gap-4 justify-between w-full min-w-40 input input-base py-1.5 px-2 text-right text-sm/6 text-white")}>
								<FiChevronDown className="group pointer-events-none  size-5 " aria-hidden="true" />
								{selectedMode.value}
							</ListboxButton>
							<ListboxOptions
								anchor={{ to: "bottom end", gap: "6px" }}
								as="div"
								className={clsx(
									"z-30 relative min-w-40 w-(--button-width) rounded-lg border border-white/30 bg-white/2 [--anchor-gap:var(--spacing-1)] focus:outline-none",
									"p-1 transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 backdrop-blur-xs"
								)}
							>
								{modes.map((m) => (
									<ListboxOption value={m} key={m.mode}>
										{({ focus, selected }) => (
											<div className={clsx("flex px-1 items-center justify-between cursor-default rounded-lg", focus && "bg-white/15")}>
												<FiChevronRight className={clsx("size-4", !selected && "invisible")} />
												<div className="flex items-center">{m.value}</div>
											</div>
										)}
									</ListboxOption>
								))}
							</ListboxOptions>
						</div>
					</Listbox>
				</div>
			</div>
			<div className="flex justify-between items-start">
				<div className="flex items-center mt-2">
					<h2 className="text-sm font-normal">Allowed List</h2>
				</div>
				{/* cuadro de nombres */}
				<div className={clsx("border rounded-2xl w-130 min-h-20 flex flex-col p-2 panel-terciary", flash ? "animate-blink border-red-600" : "")}>
					<div className="flex items-center ">
						<Input
							value={inputText}
							onChange={(e) => {
								if (e.target.value == "") setFlash(false);
								return setInputText(e.target.value);
							}}
							onKeyDown={handleKeyDown}
							placeholder="Add username"
							className={"text-sm w-full focus:outline-0 border-0 unstyled !ring-0 bg-transparent"}
						/>
					</div>
					<div className="flex flex-wrap gap-1 mt-auto">{allowedNames && allowedNames.map((a) => <AllowedName key={a} name={a} onDelete={Delete} />)}</div>
				</div>
			</div>
			<div className="flex justify-between items-start">
				<div className="flex items-center mt-2">
					<h2 className="text-sm font-normal">Blocked List</h2>
				</div>
				{/* cuadro de nombres */}
				<div className={clsx("border rounded-2xl w-130 min-h-20 flex flex-col p-2 panel-terciary", flashBlacklist ? "animate-blink border-red-600" : "")}>
					<div className="flex items-center ">
						<Input
							value={inputBlacklistText}
							onChange={(e) => {
								if (e.target.value == "") setFlashBlacklist(false);
								return setInputBlacklistText(e.target.value);
							}}
							onKeyDown={handleKeyDownBl}
							placeholder="Add username"
							className={"text-sm w-full focus:outline-0 border-0 unstyled !ring-0 bg-transparent"}
						/>
					</div>
					<div className="flex flex-wrap gap-1 mt-auto">{blacklistNames && blacklistNames.map((a) => <ForbiddenName key={a} name={a} onDelete={DeleteBl} />)}</div>
				</div>
			</div>
		</div>
	);
}
