import { Link } from "react-router-dom";
import { FaHashtag } from "react-icons/fa";
import { FaHome } from "react-icons/fa";
import { HiOutlineCommandLine } from "react-icons/hi2";
import { RxLapTimer } from "react-icons/rx";
import { FaLayerGroup } from "react-icons/fa6";

export function NavBar() {
	return (
		<div className="fixed top-0 left-0 h-screen w-14 border-r-1 border-white/10 bg-panel-terciary text-white flex flex-col justify-between items-center py-6">
			<div className="flex flex-col gap-4">
				<Link to="/" className="hover:bg-gray-600 p-3 rounded" title="Home">
					<FaHome className="size-7" />
				</Link>
				<Link to="settings/counters" className="hover:bg-gray-600 p-3 rounded" title="Counters">
					<FaHashtag className="size-7" />
				</Link>
				<Link to="settings/commands" className="hover:bg-gray-600 p-3 rounded" title="Commands">
					<HiOutlineCommandLine className="size-7" />
				</Link>
				<Link to="settings/timer" className="hover:bg-gray-600 p-3 rounded" title="Timer">
					<RxLapTimer className="size-7" />
				</Link>
				<Link to="overlays/counters" className="hover:bg-gray-600 p-3 rounded" title="Counters Overlay">
					<FaLayerGroup className="size-7" />
				</Link>
			</div>
		</div>
		// <>
		// 	<nav className="navbar bg-gray-800 shadow-md p-4">
		// 		<div className="max-w-6x1 mx-auto flex justify-between items-center">
		// 			<div className="space-x-4 hidden md:flex">
		// 				<li>
		// 					<Link to={"/settings"}>Configuracion</Link>
		// 				</li>
		// 				<li>
		// 					<Link to={"settings/overlay/counters"}>Overlay</Link>
		// 				</li>
		// 			</div>
		// 		</div>
		// 	</nav>
		// </>
	);
}
