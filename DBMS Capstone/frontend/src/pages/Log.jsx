import { useCallback, useEffect, useMemo, useState } from "react"
import { Search, RefreshCw, ClipboardList, Clock, LogOut } from "lucide-react"

const API_BASE = import.meta.env.VITE_API_URL

function formatDateTime(value) {
    if (!value) return "—"

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return "—"

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    })
}

function StatusBadge({ status }) {
    const styles = {
        Inside: "bg-orange-50 text-orange-700",
        "Checked Out": "bg-slate-100 text-slate-600"
    }


    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || "bg-amber-50 text-amber-700"
                }`}
        >
            {status || "Unknown"}
        </span>
    )
}

export default function Log() {
    const [logs, setLogs] = useState([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [lastUpdated, setLastUpdated] = useState(null)
    const [checkingOutId, setCheckingOutId] = useState(null)
    const [actionError, setActionError] = useState("")

    const fetchLogs = useCallback(async () => {
        setLoading(true)
        setError("")

        try {
            const response = await fetch(`${API_BASE}/security-logs`)

            if (!response.ok) {
                throw new Error("Unable to fetch security logs.")
            }

            const data = await response.json()

            if (!Array.isArray(data)) {
                throw new Error("Unexpected response from the security log API.")
            }

            setLogs(data)
            setLastUpdated(new Date())
        } catch (err) {
            setError(err.message || "Could not connect to the backend.")
        } finally {
            setLoading(false)
        }
    }, [])

    const handleCheckOut = async (log) => {
        if (checkingOutId !== null) return

        const confirmed = window.confirm(
            `Check out ${log.visitorName || "this visitor"}?`
        )

        if (!confirmed) return

        setCheckingOutId(log.id)
        setActionError("")

        try {
            const response = await fetch(
                `${API_BASE}/security-logs/${log.id}/check-out`,
                {
                    method: "PATCH"
                }
            )

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || "Unable to check out visitor.")
            }

            await fetchLogs()
        } catch (err) {
            setActionError(err.message || "Checkout failed.")
            await fetchLogs()
        } finally {
            setCheckingOutId(null)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    const filteredLogs = useMemo(() => {
        const query = search.trim().toLowerCase()

        if (!query) return logs

        return logs.filter((log) =>
            [
                log.id,
                log.visitorId,
                log.visitorName,
                log.visitorPhone,
                log.residentName,
                log.apartment,
                log.staffId,
                log.purpose,
                log.remarks,
                log.visitorStatus
            ].some((value) =>
                String(value ?? "").toLowerCase().includes(query)
            )
        )
    }, [logs, search])

    const insideCount = logs.filter(
        (log) => log.visitorStatus === "Inside" && !log.exitTime
    ).length

    const checkedOutCount = logs.filter(
        (log) => log.exitTime !== null && log.exitTime !== undefined
    ).length

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff0e9] text-[#ef553b]">
                            <ClipboardList size={23} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-[#8f2f24]">
                                Security Log
                            </h1>
                            <p className="mt-1 text-sm text-[#806e69]">
                                View visitor entries and check out visitors who are still inside.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={fetchLogs}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#eedbd3] bg-white px-4 py-2.5 text-sm font-semibold text-[#8f2f24] transition hover:bg-[#fff0e9] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>
            </div>

            {actionError && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                    {actionError}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#f0e2dc] bg-white p-5 shadow-sm">
                    <p className="text-sm text-[#806e69]">Total Log Records</p>
                    <p className="mt-2 text-3xl font-bold text-[#8f2f24]">
                        {logs.length}
                    </p>
                </div>

                <div className="rounded-2xl border border-[#f0e2dc] bg-white p-5 shadow-sm">
                    <p className="text-sm text-[#806e69]">Currently Inside</p>
                    <p className="mt-2 text-3xl font-bold text-orange-700">
                        {insideCount}
                    </p>
                </div>

                <div className="rounded-2xl border border-[#f0e2dc] bg-white p-5 shadow-sm">
                    <p className="text-sm text-[#806e69]">Checked Out</p>
                    <p className="mt-2 text-3xl font-bold text-slate-600">
                        {checkedOutCount}
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-[#f0e2dc] bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-3 border-b border-[#f0e2dc] p-5 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="font-bold text-[#49332e]">
                            Visitor Activity History
                        </h2>

                        <p className="mt-1 text-xs text-[#a8958e]">
                            {lastUpdated
                                ? `Last refreshed ${lastUpdated.toLocaleTimeString("en-IN")}`
                                : "Waiting for records"}
                        </p>
                    </div>

                    <label className="flex items-center gap-2 rounded-xl border border-[#f0e2dc] bg-[#fff7f3] px-3 py-2.5">
                        <Search size={17} className="text-[#806e69]" />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search logs..."
                            className="w-full bg-transparent text-sm outline-none placeholder:text-[#a8958e] sm:w-56"
                        />
                    </label>
                </div>

                {error && (
                    <div className="m-5 rounded-xl border border-red-100 bg-red-50 p-4">
                        <p className="text-sm text-red-700">{error}</p>

                        <button
                            onClick={fetchLogs}
                            className="mt-2 text-sm font-semibold text-red-700 underline"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {loading && logs.length === 0 ? (
                    <div className="p-12 text-center text-sm text-[#806e69]">
                        Loading security logs...
                    </div>
                ) : !error && filteredLogs.length === 0 ? (
                    <div className="p-12 text-center">
                        <Clock
                            size={30}
                            className="mx-auto mb-3 text-[#a8958e]"
                        />

                        <p className="font-semibold text-[#49332e]">
                            No security logs found
                        </p>

                        <p className="mt-1 text-sm text-[#806e69]">
                            {search
                                ? "Try a different search term."
                                : "Visitor entry records will appear here."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1200px] text-left text-sm">
                            <thead className="bg-[#fff7f3] text-xs uppercase tracking-wide text-[#806e69]">
                                <tr>
                                    <th className="px-5 py-4">Log ID</th>
                                    <th className="px-5 py-4">Visitor</th>
                                    <th className="px-5 py-4">Resident / Apartment</th>
                                    <th className="px-5 py-4">Purpose</th>
                                    <th className="px-5 py-4">Entry Time</th>
                                    <th className="px-5 py-4">Exit Time</th>
                                    <th className="px-5 py-4">Staff ID</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Remarks</th>
                                    <th className="px-5 py-4">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#f5e9e4]">
                                {filteredLogs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="transition hover:bg-[#fff7f3]"
                                    >
                                        <td className="px-5 py-4 font-semibold text-[#8f2f24]">
                                            #{log.id}
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-[#49332e]">
                                                {log.visitorName || "—"}
                                            </p>
                                            <p className="mt-1 text-xs text-[#806e69]">
                                                {log.visitorPhone || "No phone"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="text-[#49332e]">
                                                {log.residentName || "—"}
                                            </p>
                                            <p className="mt-1 text-xs text-[#806e69]">
                                                {log.apartment || "—"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 text-[#725b54]">
                                            {log.purpose || "—"}
                                        </td>

                                        <td className="px-5 py-4 whitespace-nowrap text-[#725b54]">
                                            {formatDateTime(log.entryTime)}
                                        </td>

                                        <td className="px-5 py-4 whitespace-nowrap text-[#725b54]">
                                            {formatDateTime(log.exitTime)}
                                        </td>

                                        <td className="px-5 py-4 text-[#725b54]">
                                            {log.staffId ?? "—"}
                                        </td>

                                        <td className="px-5 py-4">
                                            <StatusBadge status={log.visitorStatus} />
                                        </td>

                                        <td className="max-w-48 px-5 py-4 text-[#725b54]">
                                            <span className="line-clamp-2">
                                                {log.remarks || "—"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            {log.visitorStatus === "Inside" && !log.exitTime ? (
                                                <button
                                                    onClick={() => handleCheckOut(log)}
                                                    disabled={checkingOutId !== null}
                                                    className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#ef553b] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#d9442f] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <LogOut size={14} />
                                                    {checkingOutId === log.id ? "Checking out..." : "Check Out"}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-[#a8958e]">Completed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="border-t border-[#f0e2dc] px-5 py-3 text-xs text-[#a8958e]">
                    Showing {filteredLogs.length} of {logs.length} records · Read-only audit view
                </div>
            </div>
        </div>
    )
}
