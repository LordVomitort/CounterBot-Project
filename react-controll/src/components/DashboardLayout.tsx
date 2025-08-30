import { NavLink, Outlet } from "react-router-dom";

export function DashboradLayout() {
	return (
		<div className="flex h-full">
			<nav className="w-64 bg-gray-600 p-4 space-y-2">
				<NavLink to="counters" end className={"block"}>
					Counters
				</NavLink>
			</nav>
			<main>
				<Outlet />
			</main>
		</div>
	);
}
