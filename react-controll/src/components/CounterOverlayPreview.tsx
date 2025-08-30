import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import clsx from "clsx";
import { ReactNode, useEffect, useReducer, useRef, useState } from "react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";

interface BackgroundPreviewType {
	mode: string;
	value: string;
}

interface OverlayStyle {
	width: number;
	height: number;
	background: boolean;
	backgroundColor?: string;
	border: number;
	borderRadius: number;
	borderColor: string;
}

interface LabelType {
	label: string;
	X: number;
	Y: number;
	font: string;
	fontSize: number;
	color: string;
	fontWeight?: string;
	outline: boolean;
	outlineSize?: number;
	outlineColor?: string;
	background: boolean;
	backgroundColor?: string;
}
const modes: BackgroundPreviewType[] = [
	{ mode: "#fcfcfc", value: "Light" },
	{ mode: "#1c1c24", value: "Dark" },
];
export function CounterOverlayPreview() {
	const [backgroundPreview, setBackgroundPreview] = useState<BackgroundPreviewType>(modes[0]);

	const [overlayStyle, setOverlayStyle] = useState<OverlayStyle>({
		width: 100,
		height: 100,
		background: false,
		border: 0,
		borderRadius: 0,
		borderColor: "#000000",
	});
	const [labelList, setLabelList] = useState<LabelType[]>([]);
	const [labelText, setLabelText] = useState<string[]>([]);
	const [counters, setCounters] = useState<Record<string, number>>({});

	useEffect(() => {
		const eventSource = new EventSource("http://localhost:3000/overlay/counters/preview");
		eventSource.onmessage = (evnt) => {
			const evento = JSON.parse(evnt.data);
			switch (evento.type) {
				case "counters": {
					setCounters(() => evento.data);
					break;
				}
				case "style":
					setOverlayStyle(() => evento.data);
					break;
				case "labels": {
					setLabelList(() => evento.data);
					break;
				}
			}
		};

		return () => {
			eventSource.close();
		};
	}, []);

	useEffect(() => {
		// console.log("useefect");
		if (counters && labelList) {
			// console.log(labelList);
			let labels: string[] = [];
			labels = labelList.map((l) => Interpolate(l.label, counters) ?? "");
			setLabelText(labels);
		}
	}, [counters, labelList]);

	function Interpolate(text: string, counterList: Record<string, number>) {
		if (!text) return;
		const template = text.replace(/(\r\n|\n|\r)/gm, " ");
		// console.log("template", template);
		return template.replace(/\{(\w+)\}/g, (match, key: string) => {
			// console.log("match key", match, key);
			if (Object.prototype.hasOwnProperty.call(counterList, key)) {
				return String(counterList[key]);
			}
			return match;
		});
	}
	function ChangeBackground(value: BackgroundPreviewType) {
		setBackgroundPreview(() => value);
	}

	return (
		<div className="bg-panel-primary border-1 border-white/20 rounded-xl w-full h-[calc(75vh)] flex flex-col p-2 lg:sticky lg:top-14 gap-2">
			<div className="flex justify-between items-center">
				<h2 className="font-bold text-lg px-2">Preview</h2>
				<div className="flex items-center gap-2">
					<h3 className="text-base">Background</h3>
					<Listbox as={"div"} value={backgroundPreview} onChange={(v) => ChangeBackground(v)}>
						<div className="relative">
							<ListboxButton className={clsx("flex items-center justify-between min-w-40 input input-base p-2 pr-4 text-end text-sm/6 ")}>
								<FiChevronDown className="group pointer-events-none  size-5 " aria-hidden="true" />
								{backgroundPreview.value}
							</ListboxButton>
							<ListboxOptions
								className={clsx("rounded-xl  border-1 border-white/20 backdrop-blur-xs min-w-40 p-1 flex flex-col gap-1", backgroundPreview.mode == "#fcfcfc" ? "bg-panel-terciary/80" : "bg-panel-terciary/40")}
								anchor={{ to: "bottom end", gap: "6px" }}
								as="div"
							>
								{modes.map((m) => (
									<ListboxOption value={m} key={m.mode}>
										{({ focus, selected }) => (
											<div className={clsx("flex justify-between items-center px-1 rounded-lg", focus && "bg-white/20", selected && "bg-white/10")}>
												<FiChevronRight className={clsx(!selected && "invisible")} />
												<p className="px-1">{m.value}</p>
											</div>
										)}
									</ListboxOption>
								))}
							</ListboxOptions>
						</div>
					</Listbox>
				</div>
			</div>
			<div className={clsx("rounded-xl h-full flex items-center justify-center")} style={{ backgroundColor: backgroundPreview.mode }}>
				<div
					className="bg-amber-600"
					style={{
						width: overlayStyle.width,
						height: overlayStyle.height,
						borderWidth: `${overlayStyle.border}px`,
						borderColor: overlayStyle.borderColor,
						borderRadius: `${overlayStyle.borderRadius}px`,
						backgroundColor: overlayStyle.background ? overlayStyle.backgroundColor : "rgba(0,0,0,0)",
					}}
				>
					<svg width={overlayStyle.width} height={overlayStyle.height}>
						{labelList &&
							labelList.length > 0 &&
							labelList.map((l, index) => (
								<SvgText key={l.label} label={l} index={index}>
									{labelText[index]}
								</SvgText>
							))}
					</svg>
				</div>
			</div>
		</div>
	);
}

interface Font {
	family: string;
	weight: string;
}
function SvgText({ children, label, index }: { children: ReactNode; label: LabelType; index: number }) {
	const textRef = useRef<SVGTextElement | null>(null);
	const [bbox, setBbox] = useState<DOMRect | null>(null);
	const [, forceUpdate] = useReducer((x) => x + 1, 0);
	const [font, setFont] = useState<Font>({
		family: "Noto Sans JP",
		weight: "regular",
	});

	useEffect(() => {
		if (label.font) {
			const fontFamily = label.font.replace(/ /g, "+");
			const linkId = `LabelFont-${index}`;
			let link = document.getElementById(linkId) as HTMLLinkElement | null;

			if (!link) {
				link = document.createElement("link");
				link.id = linkId;
				link.rel = "stylesheet";
				document.head.appendChild(link);
			}

			link.href = `https://fonts.googleapis.com/css?family=${fontFamily}:${label.fontWeight ?? "400"}`;

			setFont((f) => ({ ...f, family: label.font, weight: label.fontWeight ?? "regular" }));

			document.fonts.ready.then(() => {
				if (textRef.current) {
					setBbox(textRef.current.getBBox());
					forceUpdate();
				}
			});
		}
	}, [label.font, label.fontWeight, index]);

	useEffect(() => {
		if (textRef.current) {
			setBbox(textRef.current.getBBox());
			forceUpdate();
		}
	}, [label, label.fontSize, label.label, children]);
	return (
		<g>
			{label.background && bbox && <rect x={bbox.x - 5} y={bbox.y - 5} width={bbox.width + 10} height={bbox.height + 10} fill={label.backgroundColor} />}
			<text
				ref={textRef}
				x={label.X}
				y={label.Y}
				fontFamily={font.family}
				fontWeight={font.weight}
				fill={label.color}
				fontSize={label.fontSize}
				stroke={label.outline ? label.outlineColor : "none"}
				strokeWidth={label.outline ? (label.outlineSize ?? 0) / 10 : 0}
				dominantBaseline="auto"
			>
				{children}
			</text>
		</g>
	);
}
