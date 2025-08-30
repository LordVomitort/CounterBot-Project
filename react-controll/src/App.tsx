import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { CounterOverlay } from "./pages/CounterOverlay";
import { CommandsPanel } from "./pages/CommandsPanel";
import { CountersPanel } from "./pages/CountersPanel";
import { TimerPage } from "./pages/TimerPage";
import { NavBar } from "./components/NavBar";

function App() {
	return (
		<>
			<Router>
				<NavBar />
				<main className="ml-14 p-4 min-h-screen">
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="settings/counters" element={<CountersPanel />} />
						<Route path="settings/commands" element={<CommandsPanel />} />
						<Route path="overlays/counters" element={<CounterOverlay />} />
						<Route path="settings/timer" element={<TimerPage />} />
					</Routes>
				</main>
			</Router>
		</>
	);
}

export default App;
