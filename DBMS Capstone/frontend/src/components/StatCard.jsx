
export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "teal",
}) {
  const themes = {
    teal: {
      icon: "bg-[#fff0e9] text-[#ef553b]",
      line: "bg-[#ef553b]",
    },
    green: {
      icon: "bg-[#fff0e9] text-[#c94a31]",
      line: "bg-[#c94a31]",
    },
    aqua: {
      icon: "bg-[#fff3eb] text-[#b65b35]",
      line: "bg-[#b65b35]",
    },
    mint: {
      icon: "bg-[#fff3e6] text-[#c96a2d]",
      line: "bg-[#c96a2d]",
    },
  };

  const theme = themes[accent] || themes.teal;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#f0e2dc] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#806e69]">
            {title}
          </p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight text-[#332624]">
            {value}
          </h3>
          <p className="mt-2 text-xs text-[#a8958e]">{subtitle}</p>
        </div>

        {Icon && (
          <div className={`rounded-xl p-3 ${theme.icon}`}>
            <Icon size={23} />
          </div>
        )}
      </div>

      <div className={`absolute bottom-0 left-0 h-1 w-full ${theme.line} opacity-70`} />
    </div>
  );
}
