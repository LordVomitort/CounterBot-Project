import { useEffect, useReducer, useRef } from "react";
import { FontConfig, HexToRGBA, LabelBackground, LabelBody, LabelDelete, LabelPosition, RGBAToHex } from "./LabelBody";
import { FontType } from "./FontLoader";

export type LabelType = {
	label: string | null;
	X: number;
	Y: number;
	font: string;
	fontValue?: string;
	fontSize: number;
	fontWeight: string;
	color: string;
	outline: boolean;
	outlineSize?: number;
	outlineColor?: string;
	outlineOpacity?: number;
	background: boolean;
	backgroundColor?: string;
	backgroundOpacity?: number;
};

export const LabelManager = ({ labelsData, fonts }: { labelsData: LabelType[]; fonts: FontType[] }) => {
	const labels = useRef<LabelType[]>([]);
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	const abortControllerRef = useRef<AbortController | null>(null);

	useEffect(() => {
		if (labelsData && labelsData.length >= 1) {
			labels.current = [
				...labels.current,
				...labelsData.map((label) => {
					const newLabel = { ...label };
					if (newLabel.backgroundColor) {
						try {
							if (!newLabel.backgroundColor.includes("#")) {
								const { hex, alpha } = RGBAToHex(newLabel.backgroundColor);
								newLabel.backgroundColor = hex;
								newLabel.backgroundOpacity = alpha;
							}
						} catch (e) {
							console.error("Error converting RGBA to HEX color", e);
						}
					}
					if (newLabel.outlineColor) {
						try {
							if (!newLabel.outlineColor.includes("#")) {
								const { hex, alpha } = RGBAToHex(newLabel.outlineColor);
								newLabel.outlineColor = hex;
								newLabel.outlineOpacity = alpha;
							}
						} catch (e) {
							console.error("Error converting RGBA to HEX color", e);
						}
					}
					return newLabel;
				}),
			];
			forceUpdate();
		}
	}, [labelsData]);

	function AddLabel() {
		abortControllerRef.current?.abort();
		abortControllerRef.current = new AbortController();
		const newLabel: LabelType = {
			label: null,
			font: "Arial",
			fontSize: 10,
			fontWeight: "regular",
			color: "#ffffff",
			X: 0,
			Y: 0,
			outline: false,
			background: false,
		};

		try {
			fetch("http://localhost:3000/addLabel", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					data: newLabel,
				}),
				signal: abortControllerRef.current?.signal,
			}).then(() => {
				labels.current.push(newLabel);
				forceUpdate();
			});
		} catch (e) {
			if (e instanceof Error && e.name === "AbortError") {
				return;
			}
			console.error("Error send addLabel", e);
		}
	}

	const rebuildLabels = (data: LabelType[]) => {
		// setLabels(() => data);
		labels.current = data.map((label) => {
			// console.log(labelsData);
			const newLabel = { ...label };
			if (newLabel.backgroundColor) {
				try {
					const { hex, alpha } = RGBAToHex(newLabel.backgroundColor);
					newLabel.backgroundColor = hex;
					newLabel.backgroundOpacity = alpha;
				} catch (e) {
					console.error("Error converting RGBA to HEX color", e);
				}
			}
			if (newLabel.outlineColor) {
				try {
					const { hex, alpha } = RGBAToHex(newLabel.outlineColor);
					newLabel.outlineColor = hex;
					newLabel.outlineOpacity = alpha;
				} catch (e) {
					console.error("Error converting RGBA to HEX color", e);
				}
			}
			return newLabel;
		});
		forceUpdate();
	};

	function SendLabelModify(label: LabelType, index: number, font = false) {
		let lb: LabelType = {
			label: labels.current[index].label,
			X: labels.current[index].X,
			Y: labels.current[index].Y,
			font: labels.current[index].font,
			fontValue: labels.current[index].fontValue,
			fontSize: labels.current[index].fontSize,
			fontWeight: labels.current[index].fontWeight,
			color: labels.current[index].color,
			outline: labels.current[index].outline,
			outlineSize: labels.current[index].outlineSize,
			outlineColor: labels.current[index].outlineColor,
			outlineOpacity: labels.current[index].outlineOpacity,
			background: labels.current[index].background,
			backgroundColor: labels.current[index].backgroundColor,
			backgroundOpacity: labels.current[index].backgroundOpacity,
		};
		lb = { ...label };
		if (lb.background && lb.backgroundColor?.includes("#")) {
			lb.backgroundColor = HexToRGBA(lb.backgroundColor ?? "#000000", lb.backgroundOpacity);
		}
		if (lb.outline && lb.outlineColor?.includes("#")) {
			lb.outlineColor = HexToRGBA(lb.outlineColor ?? "#000000", lb.outlineOpacity);
		}
		if (font) {
			try {
				fetch("http://localhost:3000/fontChange", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						data: lb,
						index: index,
					}),
				});
			} catch (e) {
				console.error("error fontChange", e);
			}
		} else {
			try {
				fetch("http://localhost:3000/modifyLabel", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						data: lb,
						index: index,
					}),
				});
			} catch (e) {
				console.error("error modifyLabel", e);
			}
		}
	}

	function LabelTextChange(text: string, index: number) {
		let lbs: LabelType[] = [];
		lbs = [...labels.current];
		lbs[index] = { ...lbs[index], label: text };
		labels.current = lbs;

		try {
			fetch("http://localhost:3000/modifyLabelText", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					data: lbs[index].label,
					index: index,
				}),
			});
		} catch (e) {
			console.error("error modifyLabelText", e);
		}
	}

	type LabelPositionType = {
		X: number;
		Y: number;
	};
	function LabelPositionChange(position: LabelPositionType, index: number) {
		let lbs: LabelType[] = [];
		lbs = [...labels.current];
		lbs[index] = { ...lbs[index], X: position.X, Y: position.Y };
		labels.current = lbs;

		SendLabelModify(lbs[index], index);
	}

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
	function LabelFontChange(fontData: LabelFontConfigType, index: number, type: string) {
		let lbs: LabelType[] = [];
		lbs = [...labels.current];
		lbs[index] = {
			...lbs[index],
			font: fontData.font ?? lbs[index].font,
			fontValue: fontData.fontValue ?? lbs[index].fontValue,
			fontWeight: fontData.fontWeight ?? lbs[index].fontWeight ?? "regular",
			fontSize: fontData.fontSize ?? lbs[index].fontSize,
			color: fontData.color ?? lbs[index].color,
			outline: fontData.outline ?? lbs[index].outline,
			outlineSize: fontData.outlineSize ?? lbs[index].outlineSize ?? 0,
			outlineColor: fontData.outlineColor ?? lbs[index].outlineColor ?? "#000000",
			outlineOpacity: fontData.outlineOpacity ?? lbs[index].outlineOpacity ?? 0,
		};
		labels.current = lbs;

		switch (type) {
			case "other":
				SendLabelModify(lbs[index], index);
				break;
			case "font":
				SendLabelModify(lbs[index], index, true);
				break;
		}
	}

	type BackgoundConfigType = {
		background: boolean;
		backgroundColor?: string;
		backgroundOpacity?: number;
	};
	function LabelBackgroundChange(backgroundData: BackgoundConfigType, index: number) {
		let lbs: LabelType[] = [];
		lbs = [...labels.current];
		lbs[index] = {
			...lbs[index],
			background: backgroundData.background,
			backgroundOpacity: backgroundData.backgroundOpacity ?? lbs[index].backgroundOpacity,
			backgroundColor: backgroundData.backgroundColor ?? lbs[index].backgroundColor,
		};
		labels.current = lbs;
		SendLabelModify(lbs[index], index);
	}

	function LabelDeleteChange(index: number) {
		try {
			fetch("http://localhost:3000/deleteLabel", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ index }),
			})
				.then((response) => response.json())
				.then((data) => {
					rebuildLabels(data.labels);
				});
		} catch (e) {
			console.error("Error fetch deleteLabel", e);
		}
	}

	return (
		<div className="flex flex-col justify-between gap-2">
			<div className="flex items-center justify-between px-2 border-1 border-white/20 bg-panel-secundary rounded-xl p-2 shadow-xl shadow-black/40">
				<div className="flex items-center px-2">
					<h2 className="text-base">Labels</h2>
				</div>
				<button onClick={AddLabel} id="addInputLabelButton" className="botonAgregar bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 w-40 rounded-lg">
					Add label
				</button>
			</div>
			<div className="main-label-body flex flex-col gap-2">
				{labels.current &&
					labels.current.map((lb: LabelType, index: number) => (
						<LabelBody key={index.toString() + Date.now().toString()} data={lb} index={index} onLabelChange={(t) => LabelTextChange(t, index)}>
							<LabelPosition position={{ X: lb.X, Y: lb.Y }} key={index * 100 + 1} onPostionChange={(p) => LabelPositionChange(p, index)} />
							<FontConfig
								fontConfig={{
									font: lb.font,
									fontValue: lb.fontValue ?? "Noto+Sans:regular",
									fontSize: lb.fontSize,
									fontWeight: lb.fontWeight,
									color: lb.color,
									outline: lb.outline,
									outlineSize: lb.outlineSize,
									outlineColor: lb.outlineColor,
									outlineOpacity: lb.outlineOpacity,
								}}
								onFontChange={(f, t) => LabelFontChange(f, index, t)}
								fonts={fonts}
							/>
							<LabelBackground backgroundConfig={{ background: lb.background, backgroundColor: lb.backgroundColor, backgroundOpacity: lb.backgroundOpacity }} onBackgroundChange={(b) => LabelBackgroundChange(b, index)} />
							<LabelDelete onDelete={() => LabelDeleteChange(index)} />
						</LabelBody>
					))}
			</div>
		</div>
	);
};
