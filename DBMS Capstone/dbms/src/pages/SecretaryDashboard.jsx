import { useEffect, useMemo, useState } from "react"
import {
  Building2,
  Users,
  Wallet,
  ClipboardList,
  ArrowUpRight,
  ArrowDownRight,
  Clock3,
  CheckCircle2
} from "lucide-react"
import StatCard from "../components/StatCard"

const API_BASE = import.meta.env.VITE_API_URL

function StatusBadge({ status }) {
  const normalized = String(status || "Pending")
  const styles = {
    Paid: "bg-[#fff0e9] text-[#c94a31]",
    Successful: "bg-[#fff0e9] text-[#c94a31]",
    Pending: "bg-[#fff1dd] text-[#ae5a20]",
    Overdue: "bg-[#fff0e9] text-[#c74232]",
    Failed: "bg-[#fff0e9] text-[#c74232]",
    Refunded: "bg-gray-100 text-gray-600",
    Open: "bg-[#fff3eb] text-[#b65b35]",
    "In Progress": "bg-[#fff0e9] text-[#d9442f]",
    Resolved: "bg-[#fff0e9] text-[#c94a31]",
    Closed: "bg-[#fff0e9] text-[#c94a31]",
    High: "bg-[#fff0e9] text-[#c74232]",
    Medium: "bg-[#fff1dd] text-[#ae5a20]",
    Low: "bg-[#fff0e9] text-[#d9442f]"
  }

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[normalized] || "bg-gray-100 text-gray-600"}`}>
      {normalized}
    </span>
  )
}

function getRows(result) {
  if (Array.isArray(result)) return result
  if (Array.isArray(result?.data)) return result.data
  if (Array.isArray(result?.rows)) return result.rows
  return []
}

function getId(row) {
  return row.id ?? row.billId ?? row.paymentId ?? row.complaintId ?? row.apartmentId ?? row.residentId
}

function getBillMonth(bill) {
  const value = bill.billingMonth ?? bill.month ?? bill.billing_month
  return value ? String(value).slice(0, 7) : ""
}

function getPaymentDate(payment) {
  return payment.payDate ?? payment.paymentDate ?? payment.payment_date ?? payment.date
}

function getPaymentAmount(payment) {
  return Number(payment.amount ?? payment.amountPaid ?? payment.amount_paid ?? 0) || 0
}

function getPaymentStatus(payment) {
  return String(payment.status ?? "Pending").toLowerCase()
}

function isSuccessful(payment) {
  return ["successful", "paid"].includes(getPaymentStatus(payment))
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(amount) || 0)
}

function formatDate(value) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  })
}

export default function SecretaryDashboard() {
  const [data, setData] = useState({
    apartments: [],
    residents: [],
    maintenance: [],
    payments: [],
    complaints: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      setLoading(true)
      setError("")

      try {
        const resources = [
          ["apartments", "/apartments"],
          ["residents", "/residents"],
          ["maintenance", "/maintenance"],
          ["payments", "/payments"],
          ["complaints", "/complaints"]
        ]

        const entries = await Promise.all(
          resources.map(async ([key, path]) => {
            const response = await fetch(`${API_BASE}${path}`)
            if (!response.ok) throw new Error(`Unable to load ${key}`)
            return [key, getRows(await response.json())]
          })
        )

        if (!cancelled) setData(Object.fromEntries(entries))
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load dashboard data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDashboard()
    return () => {
      cancelled = true
    }
  }, [])

  const currentDate = new Date()
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`
  const monthLabel = currentDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  })

  const metrics = useMemo(() => {
    const monthBills = data.maintenance.filter((bill) => getBillMonth(bill) === currentMonth)
    const monthBillIds = new Set(monthBills.map((bill) => String(getId(bill))))

    const successfulPaymentsThisMonth = data.payments.filter((payment) => {
      const date = getPaymentDate(payment)
      return isSuccessful(payment) && date && String(date).slice(0, 7) === currentMonth
    })

    const totalBilled = monthBills.reduce((sum, bill) => {
      const amount = Number(bill.amount) || 0
      const lateFee = Number(bill.lateFee ?? bill.late_fee) || 0
      return sum + amount + lateFee
    }, 0)

    const totalCollected = successfulPaymentsThisMonth.reduce(
      (sum, payment) => sum + getPaymentAmount(payment),
      0
    )

    const outstanding = monthBills.reduce((sum, bill) => {
      const balance = bill.outstandingBalance ?? bill.outstanding_balance ?? bill.balance
      if (balance != null) return sum + Math.max(0, Number(balance) || 0)

      const billId = String(getId(bill))
      const paid = data.payments
        .filter((payment) => String(payment.billId ?? payment.bill_id) === billId && isSuccessful(payment))
        .reduce((total, payment) => total + getPaymentAmount(payment), 0)

      return sum + Math.max(0, (Number(bill.amount) || 0) + (Number(bill.lateFee ?? bill.late_fee) || 0) - paid)
    }, 0)

    const openComplaints = data.complaints.filter(
      (complaint) => !["resolved", "closed"].includes(String(complaint.status).toLowerCase())
    )

    const complaintBreakdown = [
      {
        label: "Open",
        count: data.complaints.filter((item) => String(item.status).toLowerCase() === "open").length,
        color: "#dd7748"
      },
      {
        label: "In Progress",
        count: data.complaints.filter((item) => String(item.status).toLowerCase() === "in progress").length,
        color: "#ef553b"
      },
      {
        label: "Resolved",
        count: data.complaints.filter((item) => String(item.status).toLowerCase() === "resolved").length,
        color: "#e57945"
      }
    ]

    const recentPayments = [...data.payments]
      .sort((a, b) => new Date(getPaymentDate(b) || 0) - new Date(getPaymentDate(a) || 0))
      .slice(0, 4)

    return {
      monthBills,
      totalBilled,
      totalCollected,
      outstanding,
      openComplaints,
      complaintBreakdown,
      recentPayments,
      collectionPercent: totalBilled > 0 ? Math.min(100, Math.round((totalCollected / totalBilled) * 100)) : 0,
      monthBillIds
    }
  }, [data, currentMonth])

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#f0e2dc] bg-white p-10 text-center text-[#806e69]">
        Loading society dashboard...
      </div>
    )
  }

  const stats = [
    {
      title: "Total Apartments",
      value: data.apartments.length.toLocaleString("en-IN"),
      subtitle: "Registered apartments",
      icon: Building2,
      accent: "teal"
    },
    {
      title: "Registered Residents",
      value: data.residents.length.toLocaleString("en-IN"),
      subtitle: "Owners and tenants",
      icon: Users,
      accent: "green"
    },
    {
      title: "Maintenance Collected",
      value: formatMoney(metrics.totalCollected),
      subtitle: "Successful payments this month",
      icon: Wallet,
      accent: "aqua"
    },
    {
      title: "Open Complaints",
      value: metrics.openComplaints.length.toLocaleString("en-IN"),
      subtitle: "Unresolved complaints",
      icon: ClipboardList,
      accent: "mint"
    }
  ]

  return (
    <div className="space-y-7">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}. Check that the backend is running and the API endpoints are available.
        </div>
      )}

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#ffe3d8] via-[#fff0e9] to-[#fffaf7] p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#d9442f]">
            <span className="h-2 w-2 rounded-full bg-[#ef553b]" />
            SOCIETY OVERVIEW
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#8f2f24] sm:text-3xl">
            Welcome back, Secretary!
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#806e69]">
            Here is the latest overview of your community, maintenance collection and resident requests.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-xs font-medium text-[#725b54]">
              <CheckCircle2 size={15} className="text-[#ef553b]" />
              Society portal active
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 text-xs font-medium text-[#725b54]">
              <Clock3 size={15} className="text-[#ef553b]" />
              {currentDate.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-8 -top-16 h-64 w-64 rounded-full border-[32px] border-white/40" />
        <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full bg-[#ffc8b5]/40" />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#332624]">Society at a glance</h2>
          <p className="mt-1 text-sm text-[#806e69]">A live summary of your community.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#f0e2dc] bg-white p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-[#332624]">Maintenance collection</h2>
              <p className="mt-1 text-sm text-[#806e69]">Current-month bills and successful payments</p>
            </div>
            <span className="rounded-lg bg-[#fff0e9] px-3 py-1.5 text-xs font-semibold text-[#d9442f]">{monthLabel}</span>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-[#fffaf7] p-4">
              <p className="text-xs text-[#806e69]">Total billed</p>
              <p className="mt-2 text-2xl font-bold text-[#332624]">{formatMoney(metrics.totalBilled)}</p>
            </div>
            <div className="rounded-xl bg-[#fff0e9] p-4">
              <p className="text-xs text-[#8f5540]">Collected this month</p>
              <p className="mt-2 text-2xl font-bold text-[#c94a31]">{formatMoney(metrics.totalCollected)}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-[#c94a31]">
                <ArrowUpRight size={14} /> {metrics.collectionPercent}% of billed amount
              </p>
            </div>
            <div className="rounded-xl bg-[#fff1dd] p-4">
              <p className="text-xs text-[#806e69]">Outstanding</p>
              <p className="mt-2 text-2xl font-bold text-[#ae5a20]">{formatMoney(metrics.outstanding)}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-[#ae5a20]">
                <ArrowDownRight size={14} /> Remaining on current-month bills
              </p>
            </div>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-xs">
              <span className="font-medium text-[#725b54]">Collection progress</span>
              <span className="font-bold text-[#d9442f]">{metrics.collectionPercent}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#f0e2dc]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#ef553b] to-[#ff9a68]"
                style={{ width: `${metrics.collectionPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#f0e2dc] bg-white p-5">
          <h2 className="font-bold text-[#332624]">Complaint status</h2>
          <p className="mt-1 text-sm text-[#806e69]">Current database breakdown</p>
          <div className="mt-6 space-y-5">
            {metrics.complaintBreakdown.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-[#806e69]">{item.label}</span>
                  <span className="font-bold text-[#332624]">{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#f5e9e4]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${data.complaints.length ? (item.count / data.complaints.length) * 100 : 0}%`,
                      backgroundColor: item.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-[#fffaf7] p-3 text-xs leading-5 text-[#806e69]">
            {data.complaints.length} complaints recorded in the database.
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 2xl:grid-cols-5">
        <div className="overflow-hidden rounded-2xl border border-[#f0e2dc] bg-white 2xl:col-span-3">
          <div className="flex items-center justify-between border-b border-[#f5e9e4] p-5">
            <div>
              <h2 className="font-bold text-[#332624]">Recent payments</h2>
              <p className="mt-1 text-xs text-[#806e69]">Latest maintenance transactions</p>
            </div>
            <span className="rounded-lg bg-[#fff0e9] px-3 py-2 text-xs font-semibold text-[#d9442f]">
              {metrics.recentPayments.length} records
            </span>
          </div>
          {metrics.recentPayments.length === 0 ? (
            <p className="p-5 text-sm text-[#806e69]">No payment records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-[#fff7f3] text-xs text-[#806e69]">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Resident</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 font-semibold">Amount</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentPayments.map((payment, index) => (
                    <tr key={getId(payment) ?? index} className="border-t border-[#f5e9e4] hover:bg-[#fff7f3]">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#332624]">
                          {payment.resident ?? payment.residentName ?? payment.name ?? `Resident ${payment.residentId ?? ""}`}
                        </p>
                        <p className="mt-1 text-xs text-[#a8958e]">
                          {payment.apartment ?? payment.apartmentNo ?? payment.apartmentNumber ?? "Apartment not provided"}
                          {` · ${getId(payment) ?? "—"}`}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-xs text-[#806e69]">{formatDate(getPaymentDate(payment))}</td>
                      <td className="px-5 py-4 font-semibold text-[#332624]">{formatMoney(getPaymentAmount(payment))}</td>
                      <td className="px-5 py-4"><StatusBadge status={payment.status ?? "Pending"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#f0e2dc] bg-white 2xl:col-span-2">
          <div className="border-b border-[#f5e9e4] p-5">
            <h2 className="font-bold text-[#332624]">Recent complaints</h2>
            <p className="mt-1 text-xs text-[#806e69]">Issues reported by residents</p>
          </div>
          {data.complaints.length === 0 ? (
            <p className="p-5 text-sm text-[#806e69]">No complaints have been recorded.</p>
          ) : (
            <div className="divide-y divide-[#f5e9e4]">
              {[...data.complaints].slice(-5).reverse().map((complaint, index) => (
                <div key={getId(complaint) ?? index} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#332624]">
                        {complaint.title ?? complaint.subject ?? complaint.description ?? "Resident complaint"}
                      </p>
                      <p className="mt-1 text-xs text-[#806e69]">
                        {getId(complaint) ?? "—"} · {complaint.apartment ?? complaint.apartmentNo ?? complaint.apartmentNumber ?? "Apartment not provided"}
                      </p>
                    </div>
                    <StatusBadge status={complaint.priority ?? "Medium"} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-[#806e69]">{complaint.category ?? "General"}</span>
                    <StatusBadge status={complaint.status ?? "Open"} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <p className="text-center text-xs text-[#a8958e]">MySociety dashboard · Live data from your database</p>
    </div>
  )
}
