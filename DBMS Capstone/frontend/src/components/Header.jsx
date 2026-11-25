
import { Search, Bell, ChevronDown } from "lucide-react"

export default function Header({ activePage, role, resident }) {
  const displayName =
    role === "Resident"
      ? resident?.name || "Resident"
      : role === "Secretary"
        ? "Secretary"
        : role === "Staff"
          ? "Staff"
          : "User"

  const displayRole =
    role === "Secretary"
      ? "Administrator"
      : role || "User"

  const initials = displayName
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="flex min-h-[84px] flex-wrap items-center justify-between gap-4 border-b border-[#f0e2dc] bg-white px-5 py-4 sm:px-8">
      <div>
        <p className="mb-1 text-xs font-medium text-[#806e69]">
          MySociety / {activePage}
        </p>

        <h2 className="text-xl font-bold text-[#332624]">
          {activePage}
        </h2>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <label className="hidden items-center gap-2 rounded-xl border border-[#f0e2dc] bg-[#fff7f3] px-3 py-2.5 md:flex">
          <Search size={17} className="text-[#806e69]" />

          <input
            type="search"
            placeholder="Search anything..."
            className="w-40 bg-transparent text-sm outline-none placeholder:text-[#a8958e] lg:w-52"
          />
        </label>

        <button
          aria-label="Notifications"
          className="relative rounded-xl p-2.5 text-[#806e69] hover:bg-[#fff0e9] hover:text-[#d9442f]"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#ef553b]" />
        </button>

        <div className="hidden h-9 w-px bg-[#f0e2dc] sm:block" />

        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffe1d5] text-sm font-bold text-[#8f2f24]">
            {initials}
          </div>

          <div className="hidden text-left sm:block">
            <p className="max-w-40 truncate text-sm font-semibold text-[#332624]">
              {displayName}
            </p>

            <p className="text-xs text-[#806e69]">
              {displayRole}
            </p>
          </div>

          <ChevronDown
            size={15}
            className="hidden text-[#806e69] sm:block"
          />
        </div>
      </div>
    </header>
  )
}
