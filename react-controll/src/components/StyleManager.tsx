import { Fragment, useEffect, useReducer, useRef, useState } from "react";
import { LabelManager, LabelType } from "./LabelManager";
import { HexToRGBA, RGBAToHex } from "./LabelBody";
import { FontType } from "./FontLoader";
import { Input, Switch } from "@headlessui/react";
import clsx from "clsx";

export type OverlayStyleType = {
	width: number;
	height: number;

	backgroundImgSrc?: string;
	backgroundImgProperties?: BgImgPropType;
	background: boolean;
	backgroundColor?: string;
	backgroundOpacity?: number;
	backgroundImage?: BgImgPropType;
	border: number;
	borderColor: string;
	borderRadius: number;
	labels: LabelType[];
};

export type BgImgPropType = {
	source: string | null;
	opacity?: number;
};
type ChildDataType = {
	width?: number;
	height?: number;
	background?: boolean;
	backgroundColor?: string;
	backgroundOpacity?: number;
	backgroundImage?: BgImgPropType;
	border?: number;
	borderColor?: string;
	borderRadius?: number;
};
export const StyleManager = () => {
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	const overlayStyle = useRef<OverlayStyleType>({
		width: 0,
		height: 0,
		background: false,
		backgroundColor: "#000000",
		backgroundOpacity: 1,
		border: 3,
		borderRadius: 0,
		borderColor: "#ffffff",
		labels: [],
	});
	// const [isLoading, setIsLoading] = useState(false);
	const labelsArray = useRef<LabelType[]>([]);

	const FontList = useRef<FontType[]>([]);

	const abortControllerRef = useRef<AbortController | null>(null);

	const handleChildData = (data: ChildDataType) => {
		overlayStyle.current = {
			...overlayStyle.current,
			width: data.width ?? overlayStyle.current.width,
			height: data.height ?? overlayStyle.current.height,
			background: data.background ?? overlayStyle.current.background,
			backgroundColor: data.backgroundColor ?? overlayStyle.current.backgroundColor ?? undefined,
			backgroundOpacity: data.backgroundOpacity ?? overlayStyle.current.backgroundOpacity ?? undefined,
			backgroundImage: data.backgroundImage ?? overlayStyle.current.backgroundImage ?? undefined,
			border: data.border ?? overlayStyle.current.border,
			borderColor: data.borderColor ?? overlayStyle.current.borderColor ?? undefined,
			borderRadius: data.borderRadius ?? overlayStyle.current.borderRadius ?? undefined,
		};
		SendData();
	};

	const SendData = () => {
		const _aux = {
			width: overlayStyle.current.width,
			height: overlayStyle.current.height,
			background: overlayStyle.current.background,
			backgroundColor: overlayStyle.current.backgroundColor ? HexToRGBA(overlayStyle.current.backgroundColor, overlayStyle.current.backgroundOpacity) : undefined,
			backgroundImage: overlayStyle.current.backgroundImage && overlayStyle.current.backgroundImage.source !== "" ? overlayStyle.current.backgroundImage : undefined,
			border: overlayStyle.current.border,
			borderColor: overlayStyle.current.border ? overlayStyle.current.borderColor : undefined,
			borderRadius: overlayStyle.current.border ? overlayStyle.current.borderRadius : undefined,
		};
		try {
			fetch("http://localhost:3000/modifyStyle", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(_aux),
			});
		} catch (e) {
			console.error("Error sending style data", e);
		}
	};
	useEffect(() => {
		const getStyle = async () => {
			abortControllerRef.current?.abort();
			abortControllerRef.current = new AbortController();

			// setIsLoading(true);
			try {
				const response = await fetch("http://localhost:3000/setControllOverlay", { signal: abortControllerRef.current?.signal });
				const data = await response.json();
				overlayStyle.current = data;
				const { hex, alpha } = RGBAToHex(data.backgroundColor);
				overlayStyle.current.backgroundColor = hex;
				overlayStyle.current.backgroundOpacity = alpha;
				labelsArray.current = data.labels;
				forceUpdate();
			} catch (e: unknown) {
				if (e instanceof Error && e.name === "AbortError") {
					return;
				}
				console.error("error fetch setControllOverlay", e);
			}
			// } finally {
			// 	setIsLoading(false);
			// }
		};

		fetch("http://localhost:3000/fontsList")
			.then((response) => response.json())
			.then((data) => {
				FontList.current = data;
			})
			.catch((er) => console.error("Error getting fonts", er));
		getStyle();
	}, []);

	return (
		<div className="h-fit bg-panel-primary flex flex-col w-full overflow-hidden p-1.5 justify-between gap-2 rounded-lg border-1 border-white/20">
			<SizeConfig size={{ width: overlayStyle.current.width, height: overlayStyle.current.height }} onReSize={handleChildData} />
			<BorderOverlay borderConfig={{ border: overlayStyle.current.border, borderColor: overlayStyle.current.borderColor, borderRadius: overlayStyle.current.borderRadius }} onBorderChange={handleChildData} />
			<BackgorundConfig
				backgroundConfig={{
					background: overlayStyle.current.background ?? true,
					backgroundColor: overlayStyle.current.backgroundColor ?? "#000000",
					backgroundOpacity: overlayStyle.current.backgroundOpacity ?? 1,
				}}
				onBackgroundChange={handleChildData}
			/>
			<LabelManager labelsData={overlayStyle.current.labels} fonts={FontList.current} />
			{/* <MediaBackgound bgImage={{ source: overlayStyle.current.backgroundImage?.source ?? null, opacity: 1 }} onBgImgChange={handleChildData} /> */}
		</div>
	);
};

type SizeStyleType = {
	width: number;
	height: number;
};
export const SizeConfig = ({ size, onReSize }: { size: SizeStyleType; onReSize: (size: SizeStyleType) => void }) => {
	const [windowSize, setWindowSize] = useState<SizeStyleType>({ width: 0, height: 0 });

	useEffect(() => {
		if (size) {
			setWindowSize(() => size);
		}
	}, [size]);

	const ChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
		const _aux: SizeStyleType = {
			width: windowSize.width,
			height: windowSize.height,
		};
		switch (e.target.name) {
			case "slider-x":
				_aux.width = e.target.valueAsNumber;
				setWindowSize((pre) => ({ ...pre, width: e.target.valueAsNumber }));
				break;

			case "slider-y":
				_aux.height = e.target.valueAsNumber;
				setWindowSize((pre) => ({ ...pre, height: e.target.valueAsNumber }));
				break;
		}
		onReSize(_aux);
	};

	return (
		<div className="flex flex-col panel-secundary panel-transition shadow-xl shadow-black/40">
			<div className="items-center flex space-x-2 border-b-1 rounded-t-xl border-white/20 bg-white/5 px-2 p-1 m-0">
				<h2 className="font-normal text-base">Overlay size</h2>
			</div>
			<div className="flex items-center justify-center gap-2 p-2">
				<div className="slidecontainer flex items-center gap-1">
					<div className="items-center flex ">
						<h3 className="text-sm font-normal">Width:</h3>
					</div>
					<div className="flex items-center gap-1 ">
						<input type="range" className="slider shadow-xl shadow-black/30 accent-blue-600 w-40" id="widthSlider" min="1" max="500" value={windowSize.width} onChange={ChangeValue} name="slider-x" />

						<Input type="number" min={0} id="width" className="input input-base w-16" value={windowSize.width} onChange={ChangeValue} name="slider-x" />
					</div>

					<div className="items-center flex space-x-2">
						<h3 className="text-sm font-normal">px</h3>
					</div>
				</div>

				<div className="slidecontainer flex items-center gap-1">
					<div className="items-center flex space-x-2">
						<h3 className="text-sm font-normal">Height:</h3>
					</div>
					<div className="flex items-center gap-1">
						<input type="range" className="slider shadow-xl shadow-black/30 accent-blue-600 w-40" id="heightSlider" min="1" max="500" value={windowSize.height} onChange={ChangeValue} name="slider-y" />
						<Input type="number" min={0} id="height" className="input input-base w-16" value={windowSize.height} onChange={ChangeValue} name="slider-y" />
					</div>

					<div className="items-center flex space-x-2">
						<h3 className="text-sm font-normal">px</h3>
					</div>
				</div>
			</div>
		</div>
	);
};

type BackgroundConfigType = {
	background: boolean;
	backgroundColor: string;
	backgroundOpacity: number;
};
export const BackgorundConfig = ({ backgroundConfig, onBackgroundChange }: { backgroundConfig: BackgroundConfigType; onBackgroundChange: (data: BackgroundConfigType) => void }) => {
	const [bgConfig, setBgConfig] = useState<BackgroundConfigType>({
		background: false,
		backgroundColor: "#000000",
		backgroundOpacity: 0,
	});

	useEffect(() => {
		if (backgroundConfig) {
			setBgConfig((pre) => ({ ...pre, ...backgroundConfig }));
		}
	}, [backgroundConfig]);

	const ChangeValue = (value: string, fromName: string) => {
		const _aux: BackgroundConfigType = {
			background: bgConfig.background,
			backgroundColor: bgConfig.backgroundColor,
			backgroundOpacity: bgConfig.backgroundOpacity,
		};
		switch (fromName) {
			case "background":
				_aux.background = !_aux.background;
				setBgConfig((pre) => ({ ...pre, background: !pre.background }));
				break;
			case "background-color":
				_aux.backgroundColor = value;
				setBgConfig((pre) => ({ ...pre, backgroundColor: value }));
				break;
			case "background-opacity":
				_aux.backgroundOpacity = Number(value);
				setBgConfig((pre) => ({ ...pre, backgroundOpacity: Number(value) }));
				break;
		}
		onBackgroundChange(_aux);
	};
	//
	return (
		<>
			<div className="flex flex-col gap-1 panel-secundary panel-transition shadow-xl shadow-black/40">
				<div className="items-center flex space-x-2 border-b-1 rounded-t-xl border-white/20 p-1 pl-2 bg-white/5">
					<h3 className="font-normal text-base">Background</h3>
				</div>
				<div className="flex items-center justify-between pl-4 pr-4 p-2">
					<div className="flex items-center space-x-2">
						<h2 className="text-sm font-normal">Background</h2>
					</div>
					<Switch checked={bgConfig.background} onChange={(b: boolean) => ChangeValue(b.toString(), "background")} as={Fragment}>
						{({ checked }) => (
							<button className={clsx("group inline-flex h-4 w-10 items-center rounded-full shadow-xl shadow-black/30", checked ? "bg-blue-600 " : "bg-white/10 ", "transition duration-500 ease-in-out")}>
								<span className={clsx("size-5 rounded-full bg-white", " transition duration-500 ease-in-out", checked ? "translate-x-5" : "translate-x-0")} />
							</button>
						)}
					</Switch>
				</div>
				<div className={clsx("flex flex-col transition-all duration-500 overflow-hidden", bgConfig.background ? "opacity-100 max-h-24" : "opacity-0 max-h-0")}>
					<div className={"separator !mx-4"} />
					<div className={"gap-1.5 flex flex-col px-1 p-2 pl-6 pr-3 overflow-hidden transition-all duration-500 "}>
						{/* Background color */}
						<div className="flex items-center w-full justify-between">
							<div className="flex items-center space-x-2">
								<h2 className="text-sm font-normal">Backgound color</h2>
							</div>
							<div className="flex items-center gap-1">
								<input
									className={clsx("rounded-full border-1 w-8 h-8 shadow-xl shadow-black/30")}
									type="color"
									id="labelColorPicker"
									value={bgConfig.backgroundColor ?? "#000000"}
									onChange={(e) => ChangeValue(e.target.value, e.target.name)}
									name="background-color"
								/>
								<Input className="input input-base w-20" type="text" value={bgConfig.backgroundColor ?? "#000000"} onChange={(e) => ChangeValue(e.target.value, e.target.name)} name="background-color" />
							</div>
						</div>
						<div className={"separator !mr-1"} />
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
									value={bgConfig.backgroundOpacity ?? 1}
									onChange={(e) => ChangeValue(e.target.value, e.target.name)}
									name="background-opacity"
								/>
								<input type="number" className="input input-base w-16" min="0" max="1" step={0.01} value={bgConfig.backgroundOpacity ?? 1} onChange={(e) => ChangeValue(e.target.value, e.target.name)} name="background-opacity" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

type BgImageConfigType = {
	backgroundImage: BgImgPropType;
};
export const MediaBackgound = ({ bgImage, onBgImgChange }: { bgImage: BgImgPropType; onBgImgChange: (data: BgImageConfigType) => void }) => {
	const [bgImg, setBgImg] = useState<BgImgPropType>({ source: null, opacity: 1 });
	const fileList = useRef<string[]>([]);

	useEffect(() => {
		try {
			fetch("http://localhost:3000/media/list")
				.then((response) => response.json())
				.then((data) => {
					if (data) fileList.current = data;
				});
		} catch (e) {
			console.error("Error getting file list", e);
			throw new Error("Connexion error");
		}
		if (bgImage) {
			if (bgImage.source && fileList.current.includes(bgImage.source)) {
				setBgImg(() => bgImage);
			} else {
				setBgImg(() => ({ source: null, opacity: 1 }));
			}
		}
	}, [bgImage]);

	const ChangeSelector = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setBgImg((pre) => ({ ...pre, source: e.target.value }));

		const _aux: BgImageConfigType = {
			backgroundImage: {
				source: e.target.value,
				opacity: 1,
			},
		};
		onBgImgChange(_aux);
	};

	return (
		<div className="flex flex-col border-1 border-white/20 bg-panel-secundary hover:bg-white/8 rounded-lg p-2 gap-1">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<h2 className="text-sm font-normal">Select background image</h2>
				</div>
				<div className="flex items-center">
					<select name="" id="" className="rounder-lg bg-slate-800 hover:bg-slate-700 border" value={bgImg.source ?? ""} onChange={ChangeSelector}>
						<option className="rounded-lg" value="">
							Ninguno
						</option>
						{fileList.current.map((file) => (
							<option className="rounded-lg" value={file} key={file}>
								{file}
							</option>
						))}
					</select>
				</div>
			</div>

			{bgImg.source && bgImg.source !== "" && <img src={`http://localhost:3000/media/${bgImg.source}`} alt="Seleccionado" className="w-fit max-h-40 rounded-lg" />}
		</div>
	);
};

type BorderConfigType = {
	border: number;
	borderColor: string;
	borderRadius: number;
};
export const BorderOverlay = ({ borderConfig, onBorderChange }: { borderConfig: BorderConfigType; onBorderChange: (data: BorderConfigType) => void }) => {
	const [bdConfig, setBdConfig] = useState<BorderConfigType>({ border: 0, borderColor: "#000000", borderRadius: 0 });
	useEffect(() => {
		if (borderConfig) {
			setBdConfig(() => ({ ...borderConfig }));
		}
	}, [borderConfig]);

	const ChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
		const _aux: BorderConfigType = {
			border: bdConfig.border,
			borderColor: bdConfig.borderColor,
			borderRadius: bdConfig.borderRadius,
		};

		switch (e.target.name) {
			case "border-size":
				_aux.border = e.target.valueAsNumber;
				setBdConfig((pre) => ({ ...pre, border: e.target.valueAsNumber }));
				break;

			case "border-color":
				_aux.borderColor = e.target.value;
				setBdConfig((pre) => ({ ...pre, borderColor: e.target.value }));
				break;

			case "border-radius":
				_aux.borderRadius = e.target.valueAsNumber;
				setBdConfig((pre) => ({ ...pre, borderRadius: e.target.valueAsNumber }));
		}
		onBorderChange(_aux);
	};
	return (
		<>
			<div className="panel-secundary panel-transition gap-1 flex flex-col shadow-xl shadow-black/40">
				<div className="border-b-1 rounded-t-xl border-white/20 bg-white/5 px-2 p-1">
					<h3 className="font-normal text-base">Border config</h3>
				</div>
				<div className="flex flex-col pl-4 pr-3 p-2 gap-1.5 justify-between">
					<div className="flex items-center justify-between">
						<div className="flex items-center ">
							<h2 className="text-sm font-normal">Border size</h2>
						</div>
						<div className="flex items-start gap-1">
							<Input type="number" min={0} className="input input-base w-16" value={bdConfig.border} onChange={ChangeValue} name="border-size" />
						</div>
					</div>
					<div className={"separator"} />
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<h2 className="text-sm font-normal">Border color</h2>
						</div>
						<div className="flex items-center gap-1">
							<input className="rounded-full border-1 w-8 h-8 shadow-xl shadow-black/30" type="color" id="labelColorPicker" value={bdConfig.borderColor ?? "#000000"} onChange={ChangeValue} name="border-color" />
							<Input className="input input-base w-20" type="text" value={bdConfig.borderColor ?? "#000000"} onChange={ChangeValue} name="border-color" />
						</div>
					</div>
					<div className={"separator"} />
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<h2 className="text-sm font-normal">Border radius</h2>
						</div>
						<div className="flex items-center gap-1">
							<Input className="input input-base w-16" type="number" min={0} value={bdConfig.borderRadius ?? 0} onChange={ChangeValue} name="border-radius" />
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
