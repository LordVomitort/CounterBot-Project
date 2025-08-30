import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import { LabelType } from "./LabelManager";
import { FontType } from "./FontLoader";
import { DropDown } from "./DropDown/DropDown";
import FontWeight from "./DropDown/FontWeight";
import { Input, Switch } from "@headlessui/react";
import clsx from "clsx";

export function HexToRGBA(hex: string, alpha = 1) {
	const matches = hex.match(/\w\w/g);
	if (!matches || matches.length < 3) {
		throw new Error("Invalid hex color");
	}

	const [r, g, b] = matches.map((x) => parseInt(x, 16));

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
export function RGBAToHex(color: string): { hex: string; alpha: number } {
	const matches = color.match(/[\d.]+/g);
	if (!matches || matches.length < 3) {
		throw new Error("Invalid RGBA format");
	}
	const r = parseInt(matches[0], 10);
	const g = parseInt(matches[1], 10);
	const b = parseInt(matches[2], 10);

	const alpha = matches[3] ? parseFloat(matches[3]) : 1;
	const toHex = (num: number) => {
		const hex = num.toString(16);
		return hex.length === 1 ? "0" + hex : hex;
	};
	const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
	return { hex, alpha };
}

export function LabelBody({ children, data, index, onLabelChange }: { children: ReactNode; data: LabelType; index: number; onLabelChange: (text: string) => void }) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [labelValue, setLabelValue] = useState<string>("");

	// const labelData = useRef(data);
	const ind = useRef(index ?? 0);

	useEffect(() => {
		if (data && data.label) {
			setLabelValue(() => data.label ?? "");
		}
	}, [data]);

	const ChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
		setLabelValue(() => e.target.value);
		// handleChildData({ label: e.target.value });

		try {
			fetch("http://localhost:3000/modifyLabelText", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					data: e.target.value,
					index: ind.current,
				}),
			});
		} catch (e) {
			console.error("error modifyLabel", e);
		}
		onLabelChange(e.target.value);
	};

	const EditClick = () => {
		setIsExpanded(!isExpanded);
	};
	return (
		<div className="flex flex-col gap-2 bg-panel-secundary border-1 shadow-xl shadow-black/40 border-white/20 hover:border-white/35 pt-2 px-2 rounded-xl transition-all duration-500 overflow-hidden">
			<div className="flex flex-row justify-between items-center">
				<div className="flex items-center space-x-2 pl-2">
					<h2 className="text-base font-semibold">Label</h2>
				</div>
				<Input type="text" id="labelInput" className="labelInput input input-base border-solid border-2 px-4 py-0.5 w-120 shadow-xl shadow-black/30" placeholder="Label" value={labelValue} list="label-input" onChange={ChangeValue} />
			</div>
			<div className="w-full overflow-hidden relative flex flex-col gap-1.5">
				<input className="buttonEdit w-full peer absolute inset-x-0 top-0 h-6 cursor-pointer opacity-0 z-10" type="checkbox" checked={isExpanded} onChange={() => {}} onClick={EditClick} />
				<div className={clsx(" bg-blue-600 h-6 w-full flex items-center flex-col rounded-lg")}>{isExpanded ? "Close" : "Edit"}</div>
				{/* <div className={` gap-1 flex flex-col justify-between rounded-lg pl-2 after:transition-opacity max-h-0 overflow-hidden peer-checked:max-h-[600px] transition-all duration-500`}> */}
				<div className={clsx("flex flex-col gap-2 pl-2 transition-all duration-500 overflow-hidden", isExpanded ? "max-h-180 opacity-100 mb-2" : "max-h-0 opacity-0")}>{children}</div>
			</div>
		</div>
	);
}

type LabelPositionType = {
	X: number;
	Y: number;
};

export const LabelPosition = ({ position, onPostionChange }: { position: LabelPositionType; onPostionChange: (data: LabelPositionType) => void }) => {
	const [pos, setPos] = useState<LabelPositionType>({ X: 0, Y: 0 });

	// al iniciar almacena los valores de position en el state pos
	useEffect(() => {
		if (position && position.X && position.Y) {
			setPos((prev) => ({ ...prev, X: position.X, Y: position.Y }));
		}
	}, [position]);

	// al cambiar los atributos de posision se llama esta funcion
	const change = (e: React.ChangeEvent<HTMLInputElement>) => {
		// almaceno el auxiliar
		const _pos = {
			X: pos.X,
			Y: pos.Y,
		};
		// si cambia X
		if (e.target.name === "pos-x") {
			setPos((prev) => ({ ...prev, X: e.target.valueAsNumber }));
			_pos.X = Number(e.target.value);
		}
		// si cambia Y
		if (e.target.name === "pos-y") {
			setPos((prev) => ({ ...prev, Y: e.target.valueAsNumber }));
			_pos.Y = Number(e.target.value);
		}
		// llamo a handler padre
		onPostionChange(_pos);
	};
	return (
		<div className="p-2 panel-terciary shadow-xl shadow-black/20">
			<div className="flex flex-col justify-between space-x-2">
				<p className="font-normal text-xs m-1 mx-2">Label position</p>
				<div className="flex flex-col gap-2 pl-4">
					{/* Posicion X */}
					<div className="flex justify-between items-center">
						<div className="flex items-center space-x-2">
							<h2 className="text-sm">Pos X</h2>
						</div>
						<div className="flex items-center gap-1">
							{/* SLIDER */}
							<input className="slider shadow-xl shadow-black/30 accent-blue-600 w-50" type="range" min="0" max="500" value={pos.X ?? 0} onChange={change} name="pos-x" />
							{/* INPUT */}
							<input className="input input-base w-16" type="number" min={0} value={pos.X ?? 0} onChange={change} name="pos-x" />
						</div>
					</div>
					{/* Posicion Y */}
					<div className="flex justify-between items-center">
						<div className="flex items-center space-x-2">
							<h2 className="text-sm font-normal">Pos Y</h2>
						</div>
						<div className="flex items-center gap-1">
							{/* SLIDER */}
							<input type="range" className="slider shadow-xl shadow-black/30 accent-blue-600 w-50" min="0" max="500" value={pos.Y ?? 0} onChange={change} name="pos-y" />
							{/* INPUT */}
							<input className="input input-base w-16" type="number" min={0} value={pos.Y ?? 0} onChange={change} name="pos-y" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

type LabelFontConfigType = {
	font: string;
	fontValue: string;
	fontSize: number;
	fontWeight?: string;
	color: string;
	outline: boolean;
	outlineSize?: number;
	outlineColor?: string;
	outlineOpacity?: number;
};
export const FontConfig = ({ fontConfig, onFontChange, fonts }: { fontConfig: LabelFontConfigType; onFontChange: (data: LabelFontConfigType, type: string) => void; fonts: FontType[] }) => {
	const [labelFontConfig, setLabelFontConfig] = useState<LabelFontConfigType>({
		font: "Open Sans",
		fontValue: "Open+Sans:regular",
		fontWeight: "regular",
		fontSize: 10,
		color: "#ffffff",
		outline: false,
	});
	// const [fonts, setFonts] = useState<FontType[]>([]);
	const _selectedFont = useRef<FontType>(null);
	const [selectedFont, setSelectedFont] = useState<FontType>({ family: "", value: "" });
	const [selectedWeight, setSelectedWeight] = useState<string>("");

	useEffect(() => {
		// let _fonts: FontType[];
		// async function fontLoader() {
		// 	_fonts = await FontLoader();
		// 	if (_fonts) {
		// 		setFonts(() => [..._fonts]);
		// 	}
		// }
		// fontLoader();
		if (fontConfig) {
			setLabelFontConfig((p) => ({ ...p, ...fontConfig }));
			setSelectedWeight(() => fontConfig.fontWeight ?? "regular");
		}
	}, [fontConfig]);

	useEffect(() => {
		_selectedFont.current = fonts[fonts.findIndex((f) => f.family === fontConfig.font)];
		setSelectedFont(() => {
			const i = fonts.findIndex((f) => f.family === fontConfig.font);
			if (i >= 0) {
				return fonts[i];
			} else {
				const a: FontType = {
					family: "Open Sans",
					value: "Open+Sans:regular",
				};
				return a;
			}
		});
		// console.log(fonts[fonts.findIndex((f) => f.family === fontConfig.font)]);
	}, [fontConfig.font, fonts]);

	// const ChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	ChangeAndSend(e.target.value, e.target.name);
	// };

	const ChangeValue = (value: string, nameFrom: string) => {
		let _aux: LabelFontConfigType = {
			font: labelFontConfig.font,
			fontValue: labelFontConfig.fontValue,
			fontSize: labelFontConfig.fontSize,
			fontWeight: labelFontConfig.fontWeight,
			color: labelFontConfig.color,
			outline: labelFontConfig.outline,
			outlineColor: labelFontConfig.outlineColor,
			outlineOpacity: labelFontConfig.outlineOpacity,
		};

		switch (nameFrom) {
			case "color":
				setLabelFontConfig((p) => ({ ...p, color: value }));
				_aux.color = value as string;
				break;

			case "font-size":
				setLabelFontConfig((p) => ({ ...p, fontSize: Number(value) }));
				_aux.fontSize = Number(value);
				break;

			case "outline":
				_aux.outline = !labelFontConfig.outline;
				if (_aux.outline) {
					_aux.outlineColor = labelFontConfig.outlineColor ?? "#000000";
					_aux.outlineOpacity = labelFontConfig.outlineOpacity ?? 1;
					setLabelFontConfig((pre) => ({
						...pre,
						outlineColor: _aux.outlineColor,
						outlineOpacity: _aux.outlineOpacity,
					}));
				}
				setLabelFontConfig((pre) => ({ ...pre, outline: !pre.outline }));
				break;

			case "outline-size":
				setLabelFontConfig((p) => ({ ...p, outlineSize: Number(value) }));
				_aux = { ..._aux, outlineSize: Number(value) };
				break;

			case "outline-color":
				setLabelFontConfig((p) => ({ ...p, outlineColor: value }));
				_aux = { ..._aux, outlineColor: value };
				break;
			case "outline-opacity":
				setLabelFontConfig((p) => ({ ...p, outlineOpacity: Number(value) }));
				_aux = { ..._aux, outlineOpacity: Number(value) };
				break;
		}

		onFontChange(_aux, "other");
	};

	const FontWeightChange = (val: string) => {
		const _aux: LabelFontConfigType = {
			font: labelFontConfig.font,
			fontValue: labelFontConfig.fontValue,
			fontSize: labelFontConfig.fontSize,
			fontWeight: labelFontConfig.fontWeight,
			color: labelFontConfig.color,
			outline: labelFontConfig.outline,
		};
		_aux.fontWeight = val;
		setSelectedWeight(() => val);
		setLabelFontConfig((p) => ({ ...p, fontWeight: val }));
		// fetch("http://localhost:3000/fontWeightChange", {
		// 	method: "POST",
		// 	headers: { "Content-Type": "application/json" },
		// 	body: JSON.stringify({
		// 		value: val,
		// 		index: index,
		// 	}),
		// });

		onFontChange(_aux, "font");
	};

	const fontChange = (val: FontType) => {
		const _aux: LabelFontConfigType = {
			font: labelFontConfig.font,
			fontValue: labelFontConfig.fontValue,
			fontSize: labelFontConfig.fontSize,
			fontWeight: labelFontConfig.fontWeight,
			color: labelFontConfig.color,
			outline: labelFontConfig.outline,
		};
		_aux.font = val.family;
		_aux.fontValue = val.value;
		setLabelFontConfig((p) => ({ ...p, font: val.family }));
		setSelectedFont((p) => ({ ...p, ...val }));
		if (!val.value.includes(selectedWeight)) {
			setSelectedWeight(() => "regular");
			_aux.fontWeight = "regular";
		}
		onFontChange(_aux, "font");
	};

	return (
		<div className="panel-terciary p-2 gap-2 shadow-xl shadow-black/20">
			<p className="ffont-normal text-xs m-1 mx-2">Font config</p>
			<div className="flex flex-col pl-4 gap-2 justify-between">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-sm font-normal">Font</h2>
					</div>
					<div className="flex items-center ">
						<DropDown fontsList={fonts} select={selectedFont} onChange={fontChange} />
					</div>
				</div>
				<div className="flex items-center justify-between">
					<div className="items-center">
						<h2 className="text-sm font-normal">Font Weight</h2>
					</div>
					<div className="flex items-center">
						<FontWeight value={selectedFont.value} selected={selectedWeight} onWeight={FontWeightChange} />
					</div>
				</div>
				{/* Font color */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<h2 className="text-sm font-normal">Color</h2>
					</div>
					<div className="flex items-center gap-2">
						<input className="rounded-full w-8 h-8 shadow-xl shadow-black/30" type="color" id="labelColorPicker" value={labelFontConfig.color} onChange={(e) => ChangeValue(e.target.value, e.target.name)} name="color" />
						<input className="input input-base w-20  " type="text" value={labelFontConfig.color} onChange={(e) => ChangeValue(e.target.value, e.target.name)} name="color" />
					</div>
				</div>
				{/* Font size */}
				<div className="flex items-center justify-between">
					<div className="flex items-center">
						<h2 className="text-sm font-normal">Font size</h2>
					</div>
					<div className="flex items-start gap-1">
						<input type="number" className="input input-base w-16" min={0} value={labelFontConfig.fontSize} onChange={(e) => ChangeValue(e.target.value, e.target.name)} name="font-size" />
					</div>
				</div>
				{/* Outline */}
				<div className="flex flex-col justify-between gap-1 pt-1">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-sm font-normal">Outline</h2>
						</div>
						<div className="flex items-center">
							<Switch checked={labelFontConfig.outline} onChange={(b: boolean) => ChangeValue(b.toString(), "outline")} as={Fragment}>
								{({ checked }) => (
									<button className={clsx("group inline-flex h-4 w-10 items-center rounded-full shadow-xl shadow-black/30", checked ? "bg-blue-600" : "bg-white/10", "transition duration-500 ease-in-out")}>
										<span className={clsx("size-5 rounded-full bg-white transition duration-500 ease-in-out", checked ? "translate-x-5" : "translate-x-0")} />
									</button>
								)}
							</Switch>
						</div>
					</div>
					<div className={clsx("pt-1 flex flex-col gap-2 pl-2 overflow-hidden transition-all duration-500", labelFontConfig.outline ? "opacity-100 max-h-35" : "opacity-0 max-h-0")}>
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<h2 className="text-sm font-normal">Outline size</h2>
							</div>
							<input className="input input-base w-16" type="number" min={0} id="outLineSize" value={labelFontConfig.outlineSize ?? 0} onChange={(e) => ChangeValue(e.target.value, e.target.name)} name="outline-size" />
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<h2 className="text-sm font-normal">Outline color</h2>
							</div>
							<div className="flex items-center gap-1">
								<input
									className="rounded-full w-8 h-8 shadow-xl shadow-black/30"
									type="color"
									id="labelColorPicker"
									value={labelFontConfig.outlineColor ?? "#ffffff"}
									onChange={(e) => ChangeValue(e.target.value, e.target.name)}
									name="outline-color"
								/>
								<input className="input input-base w-20" type="text" value={labelFontConfig.outlineColor ?? "#ffffff"} onChange={(e) => ChangeValue(e.target.value, e.target.name)} name="outline-color" />
							</div>
						</div>
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<h2 className="text-sm font-normal">Outline opacity</h2>
							</div>
							<div className="flex items-center gap-1">
								<input
									type="range"
									className="slider shadow-xl shadow-black/30 accent-blue-600 w-50"
									min=""
									max="1"
									step={0.01}
									value={labelFontConfig.outlineOpacity ?? 1}
									onChange={(e) => ChangeValue(e.target.value, e.target.name)}
									name="outline-opacity"
								/>
								<input className="input input-base w-16" type="number" min="0" max="1" step={0.01} value={labelFontConfig.outlineOpacity ?? 1} onChange={(e) => ChangeValue(e.target.value, e.target.name)} name="outline-opacity" />
							</div>
						</div>
					</div>

					{/* <div className={`gap-1 flex flex-col pl-2 overflow-hidden transition-all duration-500 ${labelFontConfig.outline ? " opacity-100 max-h-35 " : " opacity-0 max-h-0"}`}></div> */}
				</div>
			</div>
		</div>
	);
};

type BackgoundConfigType = {
	background: boolean;
	backgroundColor?: string;
	backgroundOpacity?: number;
};
export const LabelBackground = ({ backgroundConfig, onBackgroundChange }: { backgroundConfig: BackgoundConfigType; onBackgroundChange: (data: BackgoundConfigType) => void }) => {
	const [backgroundData, setBackgroundData] = useState<BackgoundConfigType>({ background: false });
	useEffect(() => {
		if (backgroundConfig) {
			setBackgroundData((p) => ({ ...p, ...backgroundConfig }));
		}
	}, [backgroundConfig]);

	// const ChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	ChangeAndSend(e.target.value, e.target.name);
	// };

	const ChangeValue = (value: string, fromName: string) => {
		let _aux: BackgoundConfigType = {
			background: backgroundData.background,
			backgroundColor: backgroundData.backgroundColor,
			backgroundOpacity: backgroundData.backgroundOpacity,
		};
		switch (fromName) {
			case "background":
				_aux.background = !backgroundData.background;
				if (_aux.background) {
					_aux.backgroundColor = backgroundData.backgroundColor ?? "#000000";
					_aux.backgroundOpacity = backgroundData.backgroundOpacity ?? 1;
					setBackgroundData((pre) => ({
						...pre,
						backgroundColor: _aux.backgroundColor,
						backgroundOpacity: _aux.backgroundOpacity,
					}));
				}
				setBackgroundData((pre) => ({ ...pre, background: !pre.background }));
				break;
			case "background-color":
				setBackgroundData((pre) => ({ ...pre, backgroundColor: value }));
				_aux = { ..._aux, backgroundColor: value };
				break;
			case "background-opacity":
				setBackgroundData((pre) => ({ ...pre, backgroundOpacity: Number(value) }));
				_aux = { ..._aux, backgroundOpacity: Number(value) };
				break;
		}
		onBackgroundChange(_aux);
	};
	return (
		<div className="flex flex-col p-2 gap-2 panel-terciary shadow-xl shadow-black/20">
			{/* Background */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<h2 className="text-sm font-normal">Backgroung</h2>
				</div>
				<Switch checked={backgroundData.background} onChange={(b: boolean) => ChangeValue(b.toString(), "background")} as={Fragment}>
					{({ checked }) => (
						<button className={clsx("group inline-flex h-4 w-10 items-center rounded-full", checked ? "bg-blue-600" : "bg-white/10", "transition duration-500 ease-in-out")}>
							<span className={clsx("size-5 rounded-full bg-white transition duration-500 ease-in-out", checked ? "translate-x-5" : "translate-x-0")} />
						</button>
					)}
				</Switch>
			</div>

			<div className={`gap-2 flex flex-col pl-2 overflow-hidden transition-all duration-500  ${backgroundData.background ? "opacity-100 max-h-20" : "opacity-0 max-h-0"}`}>
				{/* Background color */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<h2 className="text-sm font-normal">Backgound color</h2>
					</div>
					<div className="flex items-center gap-1">
						<input
							className="rounded-full w-8 h-8 shadow-xl shadow-black/30"
							type="color"
							id="labelColorPicker"
							value={backgroundData.backgroundColor ?? "#000000"}
							onChange={(e) => ChangeValue(e.target.value, e.target.name)}
							name="background-color"
						/>
						<input className="input input-base w-20 shadow-xl shadow-black/30" type="text" value={backgroundData.backgroundColor ?? "#000000"} onChange={(e) => ChangeValue(e.target.value, e.target.name)} name="background-color" />
					</div>
				</div>
				{/* Backgorund opacity */}
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2">
						<h2 className="text-sm font-normal">Backgroung opacity</h2>
					</div>
					<div className="flex items-center gap-1">
						<input
							className="shadow-xl shadow-black/30 accent-blue-600 w-50"
							type="range"
							min="0"
							max="1"
							step={0.01}
							value={backgroundData.backgroundOpacity ?? 1}
							onChange={(e) => ChangeValue(e.target.value, e.target.name)}
							name="background-opacity"
						/>
						<input
							type="number"
							className="input input-base w-16 shadow-xl shadow-black/30"
							min="0"
							max="1"
							step={0.01}
							value={backgroundData.backgroundOpacity ?? 1}
							onChange={(e) => ChangeValue(e.target.value, e.target.name)}
							name="background-opacity"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export const LabelDelete = ({ onDelete }: { onDelete: () => void }) => {
	return (
		<>
			<div className="flex items-center justify-between border-2 border-red-900 p-2 rounded-xl">
				<div className="flex items-center space-x-2">
					<h2 className="text-sm font-normal">Delete label</h2>
				</div>
				<button className="buttonDelete bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded" onClick={onDelete}>
					Delete
				</button>
			</div>
		</>
	);
};
