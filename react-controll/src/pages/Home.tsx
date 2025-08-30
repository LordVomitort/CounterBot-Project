import counters_panel from "../assets/counters-panel.png";
import counters_stats from "../assets/counters-stats.png";
import access_panel from "../assets/access-panel.png";
import timer_panel from "../assets/timer-panel.png";
import donothon_stats from "../assets/donothon-stats.png";
import counters_overlay from "../assets/counters-overlay.png";
import labels_editor from "../assets/labels-editor.png";
import { HashLink } from "react-router-hash-link";

export function Home() {
	return (
		<div className="flex flex-col gap-2">
			<h1>Welcome</h1>
			<div className="border-1 border-white/20 rounded-xl p-2 bg-panel-secundary">
				<span className="font-bold text-2xl px-4 pb-2">Important</span>
				<p>
					This software is a test version and a work in progress. If you encounter a bug or have any suggestions for changes or features, you can send me a DM on my{" "}
					<a className="text-blue-400 hover:underline" href="https://fansly.com/LordVomitort" target="_blank" rel="noopener noreferrer">
						Fansly
					</a>{" "}
					or{" "}
					<a className="text-blue-400 hover:underline" href="https://discord.com/users/478319727236612106" target="_blank" rel="noopener noreferrer">
						Discord
					</a>{" "}
					(LordVomitort) (I may respond faster on Discord).
				</p>
				<p>The interface or features present may change in future versions. Since English is not my first language, the translation might not be 100% accurate.</p>
				<p>I will appreciate your feedback.</p>
			</div>
			<div className="flex flex-col-reverse xl:flex-row gap-2">
				<div className="flex flex-col gap-2 border-1 border-white/20 bg-panel-secundary rounded-xl p-2 xl:w-2/3 w-full">
					<h1 className="text-xl font-bold">User Guide</h1>
					<div className="flex flex-col panel-terciary bg-neutral-900 p-2 font-light">
						<h2 className="font-black text-3xl">Table of Contents</h2>
						{/* indice */}
						<ul className="text-xl font-semibold pl-8 ">
							<li>
								<HashLink smooth to="#introduction" className="hover:text-blue-500 underline">
									1. Introduction
								</HashLink>
								<div className="pl-4 text-sm">
									<ul>
										<li>
											<HashLink className="hover:text-blue-500 underline" smooth to={"#fansly-connexion"}>
												1.2 Connecting to Fansly
											</HashLink>
										</li>
										<li>
											<HashLink className="hover:text-blue-500 underline" smooth to={"#restoring"}>
												1.3 Resetting All Data
											</HashLink>
										</li>
									</ul>
								</div>
							</li>
							<li>
								<HashLink className="underline hover:text-blue-500" smooth to="#counters">
									2. Counters
								</HashLink>
								<div className="text-sm pl-4">
									<ul>
										<li>
											<HashLink className="hover:text-blue-500 underline" smooth to={"#counting-system"}>
												2.1 Counting System and storage
											</HashLink>
										</li>
										<li>
											<HashLink className="hover:text-blue-500 underline" smooth to={"#counters-config"}>
												2.2 Counters configuration
											</HashLink>

											<div className="pl-4">
												<ul>
													<li>
														<HashLink className="hover:text-blue-500 underline" smooth to={"#counters-management"}>
															2.2.1 Counters management (Left panel)
														</HashLink>
													</li>
													<li>
														<HashLink className="hover:text-blue-500 underline" smooth to={"#counters-stats"}>
															2.2.2 Counters Stats (Right panel)
														</HashLink>
													</li>
												</ul>
											</div>
										</li>
									</ul>
								</div>
							</li>
							<li>
								<HashLink className="hover:text-blue-500 underline" smooth to="#counters-overlay">
									3. Counters Overlay
								</HashLink>
								<div className="text-sm pl-4">
									<ul>
										<li>
											<HashLink className="hover:text-blue-500 underline" smooth to={"#appearance"}>
												3.1 Appearance options
											</HashLink>
										</li>
										<li>
											<HashLink className="hover:text-blue-500 underline" smooth to={"#labels-aditor"}>
												3.2 Labels editor
											</HashLink>
										</li>
										<li>
											<HashLink className="hover:text-blue-500 underline" smooth to={"#overlay"}>
												3.3 OBS Overlay
											</HashLink>
										</li>
									</ul>
								</div>
							</li>
							<li>
								<HashLink className="hover:text-blue-500 underline" smooth to="#commands">
									4. Commands
								</HashLink>
								<div className="text-sm pl-4">
									<ul>
										<li>
											<HashLink className="hover:text-blue-500 underline" smooth to={"#into-commands"}>
												4.1 Introduction - Using commands
											</HashLink>
										</li>
										<li>
											<HashLink className="hover:text-blue-500 underline" smooth to={"#commands-reference"}>
												4.2 Commands reference
											</HashLink>
											<div className="pl-4">
												<ul>
													<li>
														<HashLink className="hover:text-blue-500 underline" smooth to={"#counters-related"}>
															4.2.1 Counters related commands
														</HashLink>
													</li>
													<li>
														<HashLink className="hover:text-blue-500 underline" smooth to={"#session-related"}>
															4.2.2 Session related commands
														</HashLink>
													</li>
													<li>
														<HashLink className="hover:text-blue-500 underline" smooth to={"#info-related"}>
															4.2.3 Info related commands
														</HashLink>
													</li>
													<li>
														<HashLink className="hover:text-blue-500 underline" smooth to={"#timer-related"}>
															4.2.4 Timer related commands
														</HashLink>
													</li>
												</ul>
											</div>
										</li>
										<li>
											<HashLink className="hover:text-blue-500 underline" smooth to={"#access-modes"}>
												4.3 Commands access modes
											</HashLink>
											<div className="pl-4">
												<ul>
													<li>
														<HashLink className="hover:text-blue-500 underline" smooth to={"#modes-list"}>
															4.3.1 Modes list
														</HashLink>
													</li>
													<li>
														<HashLink className="hover:text-blue-500 underline" smooth to={"#setting-allowed"}>
															4.3.2 Setting up the allowed and blocked lists
														</HashLink>
													</li>
													<li>
														<HashLink className="hover:text-blue-500 underline" smooth to={"#config-lists"}>
															4.3.3 How to configure the lists
														</HashLink>
													</li>
												</ul>
											</div>
										</li>
									</ul>
								</div>
							</li>
							<li>
								<HashLink className="hover:text-blue-500 underline" smooth to="#timer-chapter">
									5. Timer
								</HashLink>
								<div className="text-sm pl-4">
									<ul>
										<li>
											<HashLink className="hover:text-blue-500 underline" smooth to={"#timer-control"}>
												5.1 Controls & Configuration (Left panel)
											</HashLink>
											<div className="pl-4">
												<ul>
													<li>
														<HashLink className="hover:text-blue-500 underline" smooth to={"#start-duration"}>
															5.1.1 Start duration
														</HashLink>
													</li>
													<li>
														<HashLink className="hover:text-blue-500 underline" smooth to={"#triggers"}>
															5.1.2 Triggers - Time Additions
														</HashLink>
													</li>
												</ul>
											</div>
										</li>
										<li>
											<HashLink className="hover:text-blue-500 underline" smooth to={"#donothon-stats"}>
												5.2 Donothon stats (Right panel)
											</HashLink>
										</li>
										<li>
											<HashLink className="hover:text-blue-500 underline" smooth to={"#timer-overlay"}>
												5.3 Timer Overlay
											</HashLink>
										</li>
									</ul>
								</div>
							</li>
						</ul>

						{/* secciones */}

						{/* introduccion */}
						<div className="pt-4">
							<h2 id="introduction" className="font-black text-4xl">
								1. Introduction
							</h2>
							<div className="p-2 pl-8">
								<p>
									This software allows you to manage your custom counters, donothon timer and overlays and use them in your live stream. <br />
									Also, store your stats, calculate records and totals in real time
								</p>
							</div>
							<div className="p-2 pl-8" id="fansly-connexion">
								<h2 className="font-bold text-3xl">1.2 Connecting to Fansly</h2>
								<p>
									To connect this tool with Fansly, simply open the Streaming Panel in the Fansly Creator section. (
									<a className="text-blue-400 hover:underline" href="https://fansly.com/creator/streaming" target="_blank" rel="noopener noreferrer">
										https://fansly.com/creator/streaming
									</a>
									) <br />
									If the panel is already open, just refresh the page and the connection will be established automatically.
								</p>
							</div>
							<div className="p-2 pl-8">
								<h2 className="font-black text-2xl" id="restoring">
									1.3 Resetting All Data
								</h2>
								<p>If you ever need to completely erase all stored data and restore the program to its factory state, follow these steps:</p>
								<ul className="list-decimal list-inside">
									<li>Go to the installation folder of the program.</li>
									<li>
										Delete the following items:
										<div className="p-2 pl-8">
											<ul className="list-disc list-inside">
												<li>
													<span className="font-semibold">
														The <span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">db</span> folder and all its contents:
													</span>{" "}
													This folder contains session data, counters, and related information.
												</li>
												<li>
													<span className="font-semibold">
														The <span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">overlayConfig.json</span> file:
													</span>{" "}
													This file stores the overlay configuration.
												</li>
												<li>
													<span className="font-semibold">
														The <span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">config.json</span> file:
													</span>{" "}
													This file contains other program settings.
												</li>
											</ul>
										</div>
									</li>
								</ul>
								<p>After removing these files and folders, the next time you start the program it will recreate them with default, factory settings.</p>
							</div>
						</div>

						{/* Counters */}
						<div id="counters">
							<h2 className="font-black text-4xl">2. Counters</h2>
							<div id="counters-system" className="p-2 pl-8 space-y-2 font-light">
								<h3 className="font-black text-3xl" id="counting-system">
									2.1 Counting System and storage
								</h3>
								<p>
									The Counters work with a session-based saving system, similarto using days in a calendar. Each session records the activity of all counters, allowing the system to calculate{" "}
									<span className="font-semibold italic">totals</span> and <span className="font-semibold italic">records</span> (both global and monthly) for each counter individually.
								</p>
								<p>To use any counter command, an active session is required, wich can be started in two ways:</p>
								<ul className="list-disc list-inside">
									<li>
										<span className="font-bold">Start a new session</span>: all counters set to cero.
									</li>
									<li>
										<span className="font-bold">Continue the previous session</span>: loads all values stored in the last session.
									</li>
								</ul>
								<p>This approach ensures that your data is organized chronologically and that statistics can be tracked over time.</p>
							</div>
							<div className="p-2 pl-8 space-y-2">
								<h3 className="font-black text-3xl" id="counters-config">
									2.2 Counters configuration
								</h3>
								<p>The interface if divided into two panels:</p>
								<h3 className="font-semibold text-xl" id="counters-management">
									2.2.1 Counters management (Left panel)
								</h3>
								<p>Here you can create new counters, edit their properties, or delete them.</p>
								<img src={counters_panel} alt="Counters Panel" className="w-200 h-fit" />
								<div className="pl-6 p-2">
									<span className="font-bold">Fields</span>
									<ul className="list-disc list-inside">
										<li>
											<span className="font-bold">Counter name</span>: Unique and mandatory. Used in commands and accessible in overlays.
										</li>
										<li>
											<span className="font-bold">Shortcut</span>: Optional. Must be unique if set. Works as a quick reference for commands.
										</li>
										<li>
											<span className="font-bold">Variables</span>: Each counter generates variables automatically, combining its name with a suffix that indicates the type of value.
											<div className="px-6">
												<span className="font-semibold">Example:</span>
												<ul className="list-disc list-inside space-y-1 pl-6">
													<li>
														<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">counterTotal:</span> total global value of <span className="italic">counter</span>.
													</li>
													<li>
														<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">counterMonthTotal:</span> total of the current month for <span className="italic">counter</span>.
													</li>
												</ul>
											</div>
										</li>
									</ul>
								</div>
								<p>
									All editable values can be changed in real time. Counters can be added or deleted instantly.
									<br />
									<span className="font-semibold">Note:</span> The first counter cannot be deleted, as it is the default counter.
								</p>
								<br />
								<h3 className="font-semibold text-xl" id="counters-stats">
									2.2.2 Counters Stats (Right panel)
								</h3>
								<p>
									This panel shows the <span className="font-semibold italic">basic stats</span> of each counter and its associated variables.
								</p>
								<img src={counters_stats} alt="Counters Stats" className="w-200 h-fit" />
								<ul className="list-disc list-inside">
									<li>Values update in real time.</li>
									<li>Provides a quick overview of totals and session progress.</li>
									<li>A complete statistics viewer will be implemented in a future version.</li>
								</ul>
							</div>
						</div>
						<div id="counters-overlay">
							<h2 className="font-black text-4xl">3. Counters Overlay</h2>
							<div className="p-2 pl-8 space-y-2">
								<p>
									The Counters Overlay Editor is a simple tool to configure the visual appearance of the counters overlay. Use it to set the overlay dimensions, border appearance and background options. The labels editor is under
									this section.
								</p>
								<img src={counters_overlay} alt="Counters Overlay Editor" className="w-200 h-fit" />
								<p>Changes made in the editor are applied immediately to the overlay preview and the overlay URL.</p>
								<div className="p-2  space-y-2">
									<h3 className="font-bold text-2xl" id="appearance">
										3.1 Appearance options
									</h3>
									<div className="grid grid-cols-[15rem_auto] space-y-4">
										<span className="font-semibold">Overlay Size</span>{" "}
										<p>
											Defines the width and height of the overlay window. <br />
											<span className="italic">Note: This is purely visual, it does not affect how labels or counters are stored.</span>
										</p>
										<span className="font-semibold">Border</span>
										<div>
											<p>In this section you can configure:</p>
											<ul className="list-disc list-inside">
												<li>
													<span className="font-semibold">Size:</span> thickness of the border in pixels
												</li>
												<li>
													<span className="font-semibold">Color:</span> via color picker or hex code
												</li>
												<li>
													<span className="font-semibold">Radius:</span> corner roundness in pixels
												</li>
											</ul>
										</div>
										<span className="font-semibold">Background</span>
										<div>
											<p>In this section you can configure:</p>
											<ul className="list-disc list-inside">
												<li>
													<span className="font-semibold">Background toggle:</span> enables or disables the overlay background.
												</li>
												<li>
													<span className="font-semibold">Color:</span> choose the fill color.
												</li>
												<li>
													<span className="font-semibold">Transparency/Opacity:</span> adjust how transparent or solid the background appears.
												</li>
											</ul>
										</div>
									</div>
								</div>
								<div className="py-2 space-y-2">
									<h3 className="font-bold text-2xl" id="labels-aditor">
										3.2 Labels editor
									</h3>
									<p>
										The <span className="italic font-semibold">label editor</span> allows you to add text elements to the overlay. Each label you create will be displayed directly in the overlay and can include both plain text and{" "}
										<span className="italic font-semibold">dynamic variables</span>.
									</p>
									<img src={labels_editor} alt="Labels Editor" className="w-200 h-fit" />
									<div className="grid grid-cols-[15rem_auto] space-y-4">
										<span className="font-semibold">Dynamic variables</span>
										<div className="space-y-1">
											<p>
												Labels support the use of variables (see section 2.2.1 Counters management). Variables must be written inside curly brackets{" "}
												<span className="whitespace-pre-wrap bg-neutral-700 px-1.5 py-0.5 rounded-lg">{"{  }"}</span>. Their values update automatically while the overlay is active.
											</p>
											<span>Example</span>
											<div className="bg-neutral-950 rounded-lg p-4">times {"{counter}/{counterTotal}"}</div>
											<span>This will show both the current count and the total.</span>
										</div>
										<span className="font-semibold">Adding a label</span>
										<p>
											To add a new label, click the <span className="font-semibold">Add label</span> button. A new entry will be created in the list, which you can then edit.
										</p>
										<span className="font-semibold">Editing a label</span>
										<p>
											Each label can be customized with the text or variables you want to display. Simply click <span className="font-semibold">Edit</span>, modify the content, and the overlay will update instantly.
										</p>
										<span className="font-semibold">Label Style editor</span>
										<p>
											The label style editor lets you customize how each label looks and behaves inside the overlay. You can adjust its position, choose fonts, colors, and sizes, enable outlines for better readability, and add a
											background with customizable color and opacity. These options allow you to adapt the labels to fit the overall style of your stream.
										</p>
										<span className="font-semibold">Delete label</span>
										<p>Located at the bottom of the editor. This permanently removes the selected label from the overlay. Use it carefully, as deleted labels cannot be restored automatically.</p>
									</div>
								</div>
								<div>
									<h3 className="font-bold text-2xl" id="overlay">
										3.3 OBS Overlay
									</h3>
									<div className="pl-8 p-2">
										<h3 className="font-semibold text-xl">How to connect the overlay in OBS</h3>
										<ul className="list-decimal list-inside space-y-1">
											<li>
												In <span className="font-semibold">OBS</span>, add a <span className="font-semibold">Browser Source</span>.
											</li>
											<li>
												In the <span className="font-semibold">URL</span> field, copy the link displayed below the <span className="font-semibold">Overlay Preview</span> next to the{" "}
												<span className="font-semibold">Overlay Editor</span>
											</li>
											<li>
												Check the option “<span className="font-semibold">Refresh browser when scene becomes active</span>”.
											</li>
											<li>
												Click <span className="font-semibold">OK</span> to confirm.
											</li>
										</ul>
										<p>Your counters overlay will now be visible in your scene.</p>
									</div>
								</div>
							</div>
						</div>
						<div id="commands">
							<h2 className="font-black text-4xl">4. Commands</h2>
							<div className="p-2 pl-8 space-y-2 font-light">
								<h3 className="font-black text-3xl" id="into-commands">
									4.1 Introduction - Using commands
								</h3>
								<p>
									Commands can be used to interact with counters and other functions in real time.
									<br />
									They are through the chat by typing a special prefix {"("}
									<span className="bg-neutral-700 rounded-lg p-0.5 px-1.5">!</span>
									{")"} followed by the commands name (and optional parameters).
									<br />
									If a <span className="italic font-semibold">shortcut</span> exists, it can be used instead of the full command name.
								</p>
								<div className="">
									<span className="font-semibold">Example:</span>
									<ul className="list-disc list-inside space-y-1 pl-6">
										<li>
											Typing <span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">!count</span> or <span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">!c</span> (without parameters) will increase the default counter
											by 1.
										</li>
										<li>
											Typing <span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">!startTimer</span> will start the donothon timer if it is enabled.
										</li>
									</ul>
								</div>
								<p>
									In the next section {"("}
									<span className="italic font-semibold">Commands reference</span>
									{")"}, you will find the complete list of available commands with their description and usage.
								</p>
							</div>
							<div className="p-2 pl-8 space-y-2 font-light">
								<h3 className="font-black text-3xl" id="commands-reference">
									4.2 Commands reference
								</h3>
								<div className="p-2 pl-6 space-y-2">
									<h3 className="font-semibold text-xl" id="counters-related">
										4.2.1 Counters related commands
									</h3>
									<p>
										These commands are used to iteract with or modify the values of the counters.
										<br />
										They affect the actual value of each counter specified and compute their realted values, as the global total, monthly record, etc.
									</p>
									<ul className="list-disc list-inside space-y-1">
										<li>
											<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">!count {"[<counterName|shortcut> <amount>]"}... [--continue]</span>
											<p className="font-semibold p-1 pl-7">
												Shortcut: <span className="font-light bg-neutral-700 px-1.5 py-0.5 rounded-lg">!c</span>
											</p>

											<div className="pl-7 p-2 space-y-2">
												<span className="font-semibold">Parameters</span>
												<ul className="list-disc list-inside space-y-1">
													<li>
														<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">{"<counterName|shortcut>"}</span> The name or shortcut of the counter to modify.
													</li>
													<li>
														<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">{"<amount>"}</span> The number to add (can be positive or negative).
													</li>
													<li>
														<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">{"..."}</span> You can specify multiple groups of{" "}
														<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">{"<counterName|shortcut>"}</span>.
													</li>
													<li>
														<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">{"--continue"}</span> Optional flag. When provided, if theres is no active session, the system will continue counting from the last
														session. If not provided the system will create a new session.{" "}
													</li>
												</ul>
												<h3 className="font-semibold">Description</h3>
												<p>
													Updates one or more counters by adding the specified amounts. <br />
													If no parameters are provided, the command will act on the <span className="italic font-semibold">default counter</span> with a value of{" "}
													<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">+1</span>. <br />
													If a counter is provided but no <span className="italic font-semibold">amount</span> is specified, it will use <span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">+1</span> as default value.
												</p>
												<h3 className="font-semibold">Example</h3>
												<div className="bg-neutral-950 rounded-lg p-4 grid grid-cols-[15rem_auto] gap-y-6">
													<p className="whitespace-pre-wrap font-normal">!count c 2 counter2</p>
													<p>
														<span className="font-light italic">It will increase the value of "counter" (c) by 2 and the value of counter2 by 1.</span>
													</p>
													<p>!c</p>
													<p>
														<span className="font-light italic">Since no params are provided it will increace the default counter by 1.</span>
													</p>
												</div>
											</div>
										</li>
										<li>
											<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">!set {"[<counterName|shortcut> <amount>]"}... [--new]</span>
											<div className="pl-7 p-2 space-y-2">
												<span className="font-semibold">Parameters</span>
												<ul className="list-disc list-inside space-y-1">
													<li>
														<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">{"<counterName|shortcut>"}</span> The name or shortcut of the counter to modify.
													</li>
													<li>
														<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">{"<amount>"}</span> The number to set (only positive numbers).
													</li>
													<li>
														<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">{"..."}</span> You can specify multiple groups of{" "}
														<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">{"<counterName|shortcut>"}</span>.
													</li>
													<li>
														<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">{"--new"}</span> Optional flag. When provided, if theres is no active session, the system will create a new session. If not provided the
														system will continue from the last session.
													</li>
												</ul>
												<h3 className="font-semibold">Description</h3>
												<p>
													Sets the actual value of one or more counters. <br />
													If no parameters are provided, the command will act on the <span className="italic font-semibold">default counter</span> with a value of{" "}
													<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">1</span>. <br />
													If a counter is provided but no <span className="italic font-semibold">amount</span> is specified, it will use <span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">1</span> as default value.
												</p>
												<h3 className="font-semibold">Example</h3>
												<div className="bg-neutral-950 rounded-lg p-4 grid grid-cols-[15rem_auto]">
													<p className="whitespace-pre-wrap font-normal">!set c 23 counter2 0</p>
													<p>
														<span className="font-light italic">
															It will set the value of "counter" (<span className="bg-neutral-700 px-1.5 rounded-lg">c</span>) to 23 and the value of "counter2" to 0.
														</span>
													</p>
												</div>
											</div>
										</li>
									</ul>
								</div>
								{/*  */}
								<div className="p-2 pl-6 space-y-2">
									<h3 className="font-semibold text-xl" id="session-related">
										4.2.2 Session related commands
									</h3>
									<p>These commands are used to start a session manually.</p>
									<ul className="list-disc list-inside space-y-1">
										<li>
											<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">!continue</span>

											<div className="pl-7 p-2 space-y-2">
												<h3 className="font-semibold">Description</h3>
												<p>
													Will set the last session as active and load all it's counters values and. <br />
													No parameters are needed.
												</p>
											</div>
										</li>
										<li>
											<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">!newsession</span>
											<div className="pl-7 p-2 space-y-2">
												<h3 className="font-semibold">Description</h3>
												<p>
													It will start a new session with all actual counter values to 0. <br />
													No parameters are needed.
												</p>
											</div>
										</li>
									</ul>
								</div>
								<div className="p-2 pl-6 space-y-2">
									<h3 className="font-semibold text-xl" id="info-related">
										4.2.3 Info related commands
									</h3>
									<p>These commands are used to show information as a message on the chat.</p>
									<ul className="list-disc list-inside space-y-1">
										<li>
											<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">!counterlist</span>
											<p className="font-semibold p-1 pl-7">
												Shortcut: <span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg font-light">!cl</span>
											</p>

											<div className="pl-7 p-2 space-y-2">
												<h3 className="font-semibold">Description</h3>
												<p>
													It shows the list of counters with their respective shortcuts. <br />
													No parameters are needed.
												</p>
											</div>
										</li>
										<li>
											<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">!commandlist</span>
											<p className="font-semibold p-1 pl-7">
												Shortcut: <span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg font-light">!cml</span>
											</p>
											<div className="pl-7 p-2 space-y-2">
												<h3 className="font-semibold">Description</h3>
												<p>
													It shows the list of available commands with their respective shortcuts and descriptions. <br />
													No parameters are needed.
												</p>
											</div>
										</li>
									</ul>
								</div>
								<div className="p-2 pl-6 space-y-2">
									<h3 className="font-semibold text-xl" id="timer-related">
										4.2.4 Timer related commands
									</h3>
									<p>These commands are used to manage the donothon timer.</p>
									<ul className="list-disc list-inside space-y-1">
										<li>
											<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">!startTimer</span>
											<p className="font-semibold p-1 pl-7">
												Shortcut: <span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg font-light">!startT</span>
											</p>

											<div className="pl-7 p-2 space-y-2">
												<h3 className="font-semibold">Description</h3>
												<p>
													This command will start the donothon timer, but only if the timer is enabled. <br />
													No parameters are needed.
												</p>
											</div>
										</li>
										<li>
											<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">!stopTimer</span>
											<p className="font-semibold p-1 pl-7">
												Shortcut: <span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg font-light">!stopT</span>
											</p>
											<div className="pl-7 p-2 space-y-2">
												<h3 className="font-semibold">Description</h3>
												<p>
													Used for stopping the timer. <br />
													No parameters are needed.
												</p>
											</div>
										</li>
										<li>
											<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">!enableTimer</span>

											<div className="pl-7 p-2 space-y-2">
												<h3 className="font-semibold">Description</h3>
												<p>
													Enables the donothon timer, allowing the remaining time to be modified and activating the corresponding triggers. <br />
													No parameters are needed.
												</p>
											</div>
										</li>
										<li>
											<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">!disableTimer</span>

											<div className="pl-7 p-2 space-y-2">
												<h3 className="font-semibold">Description</h3>
												<p>
													Disables the donothon timer, preventing triggers from being activated and stops the timer if it is running. <br />
													No parameters are needed.
												</p>
											</div>
										</li>
										<li>
											<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">!addTime {"<seconds>"}</span>

											<div className="pl-7 p-2 space-y-2">
												<span className="font-semibold">Parameters</span>
												<ul className="list-disc list-inside space-y-1">
													<li>
														<span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">{"<seconds>"}</span> (<span className="font-semibold">Required</span>) The number of seconds to add to the remaining time (can be
														positive or negative).
													</li>
												</ul>
												<h3 className="font-semibold">Description</h3>
												<p>
													This command takes the specified number of <span className="italic font-semibold ">seconds</span> and adds them to the timer’s current remaining time.
												</p>
												<h3 className="font-semibold">Example</h3>
												<div className="bg-neutral-950 rounded-lg p-4 grid grid-cols-[15rem_auto] gap-y-6">
													<p className="whitespace-pre-wrap font-normal">!addTime 600</p>
													<p>
														<span className="font-light italic">It will add 600 seconds (10 minutes) to the remaining time.</span>
													</p>
													<p>!addTime -60</p>
													<p>
														<span className="font-light italic">It will substract 60 seconds from the remaining time.</span>
													</p>
												</div>
											</div>
										</li>
									</ul>
								</div>
							</div>
							<div className="p-2 pl-8 space-y-2 font-light">
								<h3 className="font-black text-3xl" id="access-modes">
									4.3 Commands access modes
								</h3>
								<div className="font-light p-2 pl-8 space-y-2">
									<h3 className="font-semibold text-xl">Introduction</h3>
									<p>
										The access mode system determines who is allowed to use commands in the chat. <br />
										Currently, this setting is applied globally for all commands. In future versions, it will be possible to configure access levels for each individual command.
									</p>
									<img src={access_panel} alt="Access Panel" className="w-200 h-fit" />
									<h3 className="font-semibold text-xl" id="modes-list">
										4.3.1 Modes list
									</h3>
									<ul className="list-disc  space-y-1 pl-5">
										<li>
											<span className="font-semibold">Streamer:</span> Only the <span className="italic font-semibold">channel owner (Streamer)</span> can use the commands.
										</li>
										<li>
											<span className="font-semibold">Moderators:</span> Only the <span className="italic font-semibold">streamer</span> and their <span className="italic font-semibold">moderators</span> can use the commands
										</li>
										<li>
											<span className="font-semibold">Custom + Mods:</span> The streamer, their moderators, and the users in the <span className="italic font-semibold">allowed list</span> can use the commands. <br />
											<span className="font-semibold">Important:</span> any user included in the blocked list will not be able to use commands, even if they are a moderator.
										</li>
										<li>
											<span className="font-semibold">Custom only:</span> Only the streamer and the users explicitly included in the <span className="italic font-semibold">allowed list</span> can use the commands.
										</li>
										<li>
											<span className="font-semibold">All:</span> Everyone in the chat can use the commands. <br />
											<span className="font-bold">This option carries risk and should be used carefully by the channel owner.</span>
										</li>
									</ul>
									<div className="space-y-2">
										<h3 className="font-bold text-xl" id="setting-allowed">
											4.3.2 Setting up the allowed and blocked lists
										</h3>
										<p>
											The <span className="italic font-semibold">allowed list</span> and <span className="italic font-semibold">blocked list</span> let you fine-tune which users can access commands when using the{" "}
											<span className="italic">Custom + Mods</span> or <span className="italic">Custom only</span> modes.
										</p>
										<div className="space-y-2 pl-4">
											<p>
												<span className="font-semibold">Allowed List:</span> Users in this list are explicitly granted permission to use commands (depending on the active mode). <br />
											</p>
											<p>
												<span className="font-semibold">Blocked List:</span> Users in this list are explicitly denied permission to use commands. This restriction applies even if the user is a{" "}
												<span className="italic font-semibold">moderator</span>.
											</p>
										</div>
										<div className="space-y-2">
											<h3 className="font-bold text-xl" id="config-lists">
												4.3.3 How to configure the lists
											</h3>
											<ul className="list-decimal pl-4">
												<li>Click inside the required field and type the username you want to add.</li>
												<li>
													Press Enter to confirm the entry. <br />
													Each confirmed username will appear as a separate tag inside the field.
												</li>
											</ul>
											<ul className="pl-4 list-decimal">
												<li>
													To remove a user, click the <span className="font-bold">X</span> next to their tag.
												</li>
											</ul>
											<p>The changes are applied automatically; no restart is required.</p>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div id="timer-chapter">
							<h2 className="font-black text-3xl">5. Donothon Timer</h2>
							<p className="p-2 pl-8">
								The Donothon Timer is a stream mechanic that adds interactivity to your broadcast by increasing (or decreasing) the remaining time based on events (triggers) such as new followers, tips, subscriptions, etc. <br />
								Use it to create donation-driven time extensions, community goals, and other dynamic on-stream mechanics.
							</p>
							<div className="p-2 pl-8">
								<h3 className="font-black text-2xl" id="timer-control">
									5.1 Controls & Configuration (Left panel)
								</h3>
								<div className="p-2 pl-8 space-y-2">
									<p>This panel contains the primary controls for operating the timer</p>
									<img src={timer_panel} alt="Donothon Timer" className="w-200 h-fit" />
									<div className="grid grid-cols-[15rem_auto] space-y-2">
										<span className="font-semibold">Enable Timer</span>
										<p>
											Turns the Donothon features on/off. When off, <span className="italic font-semibold">time-changing triggers</span> will not take effect, and the timer will stop.
										</p>
										<span className="font-semibold">Start/Stop</span>

										<p>
											<span className="italic font-semibold">Starts</span> or <span className="italic font-semibold">pauses</span> the Donothon Timer.
										</p>
										<span className="font-semibold">Reset</span>
										<p>
											Sets the timer back to the configured <span className="italic font-semibold">Start duration</span>.
										</p>
										<span className="font-semibold">Add timer quick-buttons</span>
										<p>Quick access buttons for common adjustments (for example, +1hr, -1min, + 10sec).</p>
									</div>
									<div className="space-y-2">
										<h3 className="font-bold text-xl" id="start-duration">
											5.1.1 Start duration
										</h3>
										<p>
											This field difines the baseline duration time when the timer is reset. <br />
											<span className="font-semibold">Example:</span> if Start duration is <span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg">00:10:00</span>, pressing Reset sets the timer to 10 minutes.
										</p>
									</div>
									<div className="space-y-2">
										<h3 className="font-bold text-xl" id="triggers">
											5.1.2 Triggers - Time Additions
										</h3>
										<p>
											Below the basic controls you will find the Triggers section. Each trigger type has a global enable and per-item settings (enable + time to add). Triggers only act when both the global trigger is enabled and
											the timer itself is enabled.
										</p>
										<div className="grid grid-cols-[15rem_auto] space-y-6">
											<span className="font-semibold">New Followers Trigger</span>
											<p>
												Adds time when <span className="italic font-semibold">new followers</span> are detected.
											</p>
											<span className="font-semibold">Tips Trigger</span>
											<p>
												When a <span className="italic font-semibold">donation</span> or <span className="italic font-semibold">tip</span> is received, this option adds extra time to the timer. The value field defines how many
												seconds are added for each dollar donated. <br />
												<span className="font-semibold">Example:</span> If the value is set to 60 seconds, every $1 tip will add 60 seconds to the timer. A $10 tip will add 600 seconds.
											</p>
											<span className="font-semibold">Subscriptions (Subs) Triggers</span>
											<div className="space-y-2">
												<p>
													This option adds extra time to the timer when someone <span className="italic font-semibold">subscribes</span>. <br />
													You can set a different amount of time for each subscription tier.
												</p>
												<span>This section includes the following controls:</span>
												<ul className="list-disc list-inside">
													<li>
														<span className="font-semibold">Global enable:</span> Turns the entire Subs trigger group on or off.{" "}
													</li>
													<li>
														<span className="font-semibold">Only subs shared in chat:</span> When enabled, only subscriptions that appear in the chat will be counted.
													</li>
													<li>
														<span className="font-semibold">Individual enable:</span> Lets you turn on or off each tier separately.
													</li>
													<li>
														<span className="font-semibold">Time field:</span> Defines how many seconds are added for that tier.
													</li>
												</ul>
											</div>
											<span className="font-semibold">Goals Triggers</span>
											<div className="space-y-2">
												<p>
													This trigger adds extra time to the timer when a goal is completed. <br />
													If the goal amount is later increased (for example, from 10 to 20), the trigger can fire again once the new goal is reached.
												</p>
												<span>This section includes the following controls:</span>
												<ul className="list-disc list-inside">
													<li>
														<span className="font-semibold">Global enable:</span> Activates or deactivates all goal triggers.
													</li>
													<li>
														<span className="font-semibold">Individual enable:</span> Lets you turn on or off each goal separately.
													</li>
													<li>
														<span className="font-semibold">Time field:</span> Defines how many seconds are added when that goal is completed.
													</li>
												</ul>
											</div>
											<span className="font-semibold">Counters Triggers</span>
											<div className="space-y-2">
												<p>This trigger adds extra time to the timer when units are added to a counter</p>
												<span>This section includes the following controls:</span>
												<ul className="list-disc list-inside">
													<li>
														<span className="font-semibold">Global enable:</span> Activates or deactivates all counters triggers.
													</li>
													<li>
														<span className="font-semibold">Individual enable:</span> Lets you turn on or off each counter separately.
													</li>
													<li>
														<span className="font-semibold">Time field:</span> Defines how many seconds are added per unit increased.
													</li>
												</ul>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="p-2 pl-8">
								<h3 className="font-black text-2xl" id="donothon-stats">
									5.2 Donothon stats (Right panel)
								</h3>
								<div className="p-2 pl-8 space-y-2">
									<p>
										This section provides a summary of the current donothon, displaying basic statistics of each trigger achieved during its extension. <br />
										In future updates, a more advanced statistics explorer will be available, allowing you to view detailed information for each item as well as data from past donothons.
									</p>
									<p>
										To start a new donothon from scratch, simply click the <span className="bg-neutral-700 px-1.5 py-0.5 rounded-lg font-light">New stats page</span> button.
									</p>
									<img src={donothon_stats} alt="Donothon Stats" className="w-200 h-fit" />
								</div>
							</div>
							<div className="p-2 pl-8">
								<h3 className="font-black text-2xl" id="timer-overlay">
									5.3 Timer Overlay
								</h3>
								<div className="p-2 pl-8 space-y-2">
									<p>
										Currently, only a basic overlay for the donothon timer is available. <br />
										This overlay displays the remaining time, as well as visual effects when a trigger is activated.
									</p>
									<h3 className="font-bold text-xl">How to connect the overlay in OBS</h3>
									<ul className="list-decimal list-inside space-y-1">
										<li>
											In <span className="font-semibold">OBS</span>, add a <span className="font-semibold">Browser Source</span>.
										</li>
										<li>
											In the <span className="font-semibold">URL</span> field, copy the link displayed below the <span className="font-semibold">Donothon Stats panel</span>.
										</li>
										<li>
											Check the option <span className="font-semibold">“Refresh browser when scene becomes active”</span>.
										</li>
										<li>Click OK to confirm.</li>
									</ul>
									<p>Your donothon timer overlay will now be visible in your scene.</p>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="flex flex-col gap-2 border-1 border-white/20 bg-panel-secundary rounded-xl p-2 xl:w-1/3 w-full">
					<h2 className="text-xl font-bold">Ideas and plans I have for future features</h2>
					<div className="flex flex-col panel-terciary bg-neutral-900 p-2">
						<ul className="list-disc list-inside space-y-2">
							<li>Automated new update available notification system.</li>
							<li>Complete counters stats viewer and editor.</li>
							<li>Complete detailed stats for donothon.</li>
							<li>Options to share your stats and Discord bot (possible).</li>
							<li>Unified overlay and fully customisable widgets system.</li>
							<li>More commands and auto messages.</li>
							<li>Customisable commands.</li>
							<li>Integration with streamdecks.</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
