import { useState } from "react";
import { CounterOverlayPreview } from "../components/CounterOverlayPreview";
import { StyleManager } from "../components/StyleManager";
import clsx from "clsx";
import { FcCheckmark } from "react-icons/fc";
import { Button } from "@headlessui/react";

export const CounterOverlay = () => {
	const [copy, setCopy] = useState(false);
	return (
		<div className="flex flex-col">
			<h1 className="text-2xl px-2 p-1">Counters Overlay</h1>
			<div className="h-full xl:flex-row gap-2 xl:gap-4 justify-between flex flex-col">
				<StyleManager />
				<div className="w-full flex flex-col xl:sticky xl:top-14  gap-4">
					<CounterOverlayPreview />
					<div className="bg-panel-primary h-[calc(15vh)] lg:top-[calc(85vh-1rem)] rounded-xl lg:sticky p-2">
						<div className="panel-secundary p-2 flex flex-col gap-2 h-full">
							<div className="flex justify-between items-center px-2">
								<span className="font-bold">Overlay URL</span>
								<div className="flex items-center gap-2">
									<FcCheckmark className={clsx("size-6 transition-opacity duration-500 opacity-0", copy && "opacity-100")} />
									<Button
										className={"rounded-xl px-4 p-1 bg-blue-700 hover:bg-blue-600"}
										onClick={() => {
											navigator.clipboard.writeText("http://localhost:3000/overlay.html");
											setCopy(true);
											setTimeout(() => setCopy(false), 8000);
										}}
									>
										Copy
									</Button>
								</div>
							</div>

							<div className="bg-stone-900 rounded-xl p-4 border-1 border-white/20">
								<span>http://localhost:3000/overlay.html</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
