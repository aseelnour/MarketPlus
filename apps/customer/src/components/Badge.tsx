export function Badge({ label }: { label: string }) {
  const colors: Record<string, string> = {
    Sale: "bg-red-500 text-white",
    Hot: "bg-orange-500 text-white",
    New: "bg-emerald-500 text-white",
    Trending: "bg-violet-600 text-white",
  };
  return (
    <span
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${colors[label] ?? "bg-primary text-primary-foreground"}`}
    >
      {label}
    </span>
  );
}
