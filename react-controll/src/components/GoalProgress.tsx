export function GoalProgress({ progress }: { progress: number }) {
	return <div className="absolute h-full bg-[#2699f7]" style={{ width: `${progress}%` }} />;
}
