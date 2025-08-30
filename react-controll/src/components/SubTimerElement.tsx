import { Input, Switch } from "@headlessui/react";
import clsx from "clsx";
import { Fragment, useEffect, useRef, useState } from "react";

export interface SubscriptionType {
	id: string;
	name: string;
	color: string;
	price: number;
	time: number;
	enabled: boolean;
}
export function SubTimerElement({ sub, onChange, enabled }: { sub: SubscriptionType; onChange: (time: number, enabled: boolean, id: string) => void; enabled: boolean }) {
	const [inputTime, setInputTime] = useState("00:00:00");
	const inputNumber = useRef(0);
	const [isEnabled, setIsEnabled] = useState(true);

	useEffect(() => {
		if (sub !== undefined) {
			setInputTime(() => formatSecondsToTime(sub.time));
			inputNumber.current = sub.time;
			setIsEnabled(() => sub.enabled);
		}
	}, [sub]);

	function formatPrice(p: number) {
		const integerPart = Math.floor(p / 1000);
		const remainder = p % 1000;
		if (remainder === 0) return integerPart.toString();

		let decimals = remainder.toString().padStart(3, "0");
		decimals = decimals.replace(/0+$/, "");
		return `${integerPart}.${decimals}`;
	}

	function formatSecondsToTime(p: number) {
		// si es cero
		if (p == 0) {
			return "00:00:00";
		}
		// si es menor a cero, devuelvo -hh:mm:ss
		if (p < 0) {
			return `-${Math.floor(-p / 3600)
				.toString()
				.padStart(2, "0")}:${Math.floor((-p / 60) % 60)
				.toString()
				.padStart(2, "0")}:${(-p % 60).toString().padStart(2, "0")}`;
		}
		// retorno normal hh:mm:ss
		return `${Math.floor(p / 3600)
			.toString()
			.padStart(2, "0")}:${Math.floor((p / 60) % 60)
			.toString()
			.padStart(2, "0")}:${(p % 60).toString().padStart(2, "0")}`;
	}

	function FormatTimeToSeconds(t: string) {
		// determino si es negativo
		const negative = t.startsWith("-");
		// const cleanTime = negative ? t.slice(1) : t;
		// const parts = cleanTime.split(":").map(Number).reverse();
		const parts = (negative ? t.slice(1) : t).split(":").map(Number).reverse();
		// calculo la cantidad de segundos y luego si es nagativo o no
		inputNumber.current = Math.floor(parts[0] + (parts[1] ?? 0) * 60 + (parts[2] ?? 0) * 3600);
		inputNumber.current = negative ? -inputNumber.current : inputNumber.current;
		// si no es un number lo igualo a 0
		if (isNaN(inputNumber.current)) inputNumber.current = 0;
	}

	// se ejecuta cuando se preciona enter o se quita el foco
	function HandleSummit(enbld: boolean) {
		// seteo el tiempo con los segundos calculados
		setInputTime(formatSecondsToTime(inputNumber.current));
		// envio los datos al componente padre
		onChange(inputNumber.current, enbld, sub.id);
	}

	return (
		<div className="flex flex-1 items-center justify-between gap-2">
			<div className="flex items-center">
				<Switch
					checked={isEnabled}
					onChange={(c) => {
						setIsEnabled(c);
						HandleSummit(c);
					}}
					as={Fragment}
				>
					{({ checked }) => (
						<button className={clsx("group inline-flex h-4 w-10 items-center rounded-full shadow-xl shadow-black/30", checked ? "bg-blue-600 " : "bg-white/10 ", "transition duration-500 ease-in-out")}>
							<span className={clsx("size-5 rounded-full bg-white", " transition duration-500 ease-in-out", checked ? "translate-x-5" : "translate-x-0")} />
						</button>
					)}
				</Switch>
			</div>
			<div className="flex w-full items-center justify-between border-1 border-white/20 p-2 px-2 rounded-[1.25rem] h-10" style={{ backgroundColor: sub.color }}>
				<p className="px-2">{sub.name}</p>
				<p className="px-2">
					{"$"}
					{formatPrice(sub.price)}
				</p>
			</div>
			<div>
				<Input
					className={clsx("input input-base text-center w-30", (!enabled || !isEnabled) && "border-rose-600/50")}
					onChange={(e) => {
						FormatTimeToSeconds(e.target.value);
						setInputTime(e.target.value);
					}}
					value={inputTime}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							// HandleSummit();
							e.currentTarget.blur();
						}
					}}
					onBlur={() => HandleSummit(isEnabled)}
				/>
			</div>
		</div>
	);
}
