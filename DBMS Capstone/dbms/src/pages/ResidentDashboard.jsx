import { useEffect, useState } from "react"
import {
  Building2,
  Wallet,
  ClipboardList,
  CalendarDays,
  CalendarCheck,
  AlertCircle
} from "lucide-react"

const API_BASE = import.meta.env.VITE_API_URL

function ResidentDashboard({ resident }) {
  const [bills, setBills] = useState([])
  const [payments, setPayments] = useState([])
  const [complaints, setComplaints] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const money = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(Number(amount) || 0)

  const formatDate = (value) => {
    if (!value) return "—"

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return String(value)

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  }

  const getRows = (data) => {
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.data)) return data.data
    if (Array.isArray(data?.rows)) return data.rows
    return []
  }

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      setLoading(true)
      setError("")

      try {
        if (!resident?.id) {
          throw new Error("Please select a resident again.")
        }

        const endpoints = [
          { key: "bills", path: "/maintenance" },
          { key: "payments", path: "/payments" },
          { key: "complaints", path: "/complaints" },
          { key: "bookings", path: "/amenity-bookings" }
        ]

        const results = await Promise.all(
          endpoints.map(async ({ key, path }) => {
            const url = new URL(`${API_BASE}${path}`)
            url.searchParams.set("residentId", resident.id)

            const response = await fetch(url)

            if (!response.ok) {
              throw new Error(`Unable to load ${key}.`)
            }

            return [key, getRows(await response.json())]
          })
        )

        if (cancelled) return

        const data = Object.fromEntries(results)

        const residentApartmentId = resident.apartmentId
        const residentApartment = resident.apartment

        const ownBills = data.bills.filter((bill) => {
          if (bill.apartmentId != null && residentApartmentId != null) {
            return String(bill.apartmentId) === String(residentApartmentId)
          }

          if (bill.apartment != null && residentApartment != null) {
            return String(bill.apartment) === String(residentApartment)
          }

          return false
        })

        const billIds = new Set(
          ownBills.map((bill) => String(bill.id ?? bill.billId))
        )

        const ownPayments = data.payments.filter((payment) => {
          if (payment.residentId != null) {
            return String(payment.residentId) === String(resident.id)
          }

          if (payment.billId != null) {
            return billIds.has(String(payment.billId))
          }

          return false
        })

        const ownComplaints = data.complaints.filter(
          (complaint) =>
            String(complaint.residentId) === String(resident.id)
        )

        const ownBookings = data.bookings.filter(
          (booking) =>
            String(booking.residentId) === String(resident.id)
        )

        setBills(ownBills)
        setPayments(ownPayments)
        setComplaints(ownComplaints)
        setBookings(ownBookings)
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load your dashboard.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      cancelled = true
    }
  }, [resident?.id, resident?.apartmentId, resident?.apartment])

  const outstanding = bills.reduce(
    (sum, bill) =>
      sum + Math.max(0, Number(bill.outstandingBalance ?? bill.balance) || 0),
    0
  )

  const openComplaints = complaints.filter(
    (complaint) =>
      !["resolved", "closed"].includes(
        String(complaint.status).toLowerCase()
      )
  )

  const upcomingBookings = bookings.filter((booking) => {
    const status = String(booking.status).toLowerCase()
    const start = new Date(booking.startTime)

    return (
      !["cancelled", "completed"].includes(status) &&
      !Number.isNaN(start.getTime()) &&
      start >= new Date()
    )
  })

  const nextDueBill = bills
    .filter((bill) => Number(bill.outstandingBalance ?? bill.balance) > 0)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0]

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#f0e2dc] bg-white p-10 text-center text-[#806e69]">
        Loading your personal dashboard...
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#ffe3d8] via-[#fff0e9] to-[#fffaf7] p-6 sm:p-8">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#d9442f]">
            <Building2 size={14} />
            MY RESIDENT PORTAL
          </span>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#8f2f24] sm:text-3xl">
            Welcome back, {resident?.name || "Resident"}!
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#806e69]">
            Here is your personal overview of maintenance, payments,
            complaints and amenity bookings.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="rounded-xl bg-white/80 px-3 py-2 text-sm text-[#725b54]">
              <span className="text-xs">Your apartment</span>
              <p className="font-bold text-[#8f2f24]">
                {resident?.apartment || "Apartment not available"}
              </p>
            </div>

            <div className="rounded-xl bg-white/80 px-3 py-2 text-sm text-[#725b54]">
              <span className="text-xs">Resident ID</span>
              <p className="font-bold text-[#8f2f24]">
                {resident?.id}
              </p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Some dashboard data could not be loaded.</p>
              <p className="mt-1">{error}</p>
              <p className="mt-1">
                Check that the backend is running and the endpoints are available.
              </p>
            </div>
          </div>
        </div>
      )}

      <section>
        <h2 className="text-lg font-bold text-[#332624]">
          Your society at a glance
        </h2>
        <p className="mt-1 text-sm text-[#806e69]">
          Your personal records, not society-wide statistics.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[#f0e2dc] bg-white p-5">
            <Wallet className="text-[#d9442f]" size={22} />
            <p className="mt-4 text-sm text-[#806e69]">Outstanding balance</p>
            <p className="mt-1 text-2xl font-bold text-[#332624]">
              {money(outstanding)}
            </p>
          </div>

          <div className="rounded-2xl border border-[#f0e2dc] bg-white p-5">
            <CalendarDays className="text-[#d9442f]" size={22} />
            <p className="mt-4 text-sm text-[#806e69]">Next unpaid bill due</p>
            <p className="mt-1 text-lg font-bold text-[#332624]">
              {nextDueBill ? formatDate(nextDueBill.dueDate) : "No unpaid bills"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#f0e2dc] bg-white p-5">
            <ClipboardList className="text-[#d9442f]" size={22} />
            <p className="mt-4 text-sm text-[#806e69]">Open complaints</p>
            <p className="mt-1 text-2xl font-bold text-[#332624]">
              {openComplaints.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#f0e2dc] bg-white p-5">
            <CalendarCheck className="text-[#d9442f]" size={22} />
            <p className="mt-4 text-sm text-[#806e69]">Upcoming bookings</p>
            <p className="mt-1 text-2xl font-bold text-[#332624]">
              {upcomingBookings.length}
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#f0e2dc] bg-white">
        <div className="border-b border-[#f5e9e4] p-5">
          <h2 className="font-bold text-[#332624]">My maintenance bills</h2>
          <p className="mt-1 text-sm text-[#806e69]">
            Your bill amounts, late fees and remaining balances.
          </p>
        </div>

        {bills.length === 0 ? (
          <p className="p-5 text-sm text-[#806e69]">
            No maintenance bills were found for your apartment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-[#fff7f3] text-xs text-[#806e69]">
                <tr>
                  <th className="px-5 py-3">Billing month</th>
                  <th className="px-5 py-3">Bill amount</th>
                  <th className="px-5 py-3">Late fee</th>
                  <th className="px-5 py-3">Paid</th>
                  <th className="px-5 py-3">Outstanding</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr
                    key={bill.id ?? bill.billId}
                    className="border-t border-[#f5e9e4]"
                  >
                    <td className="px-5 py-4 text-[#332624]">
                      {bill.month
                        ? String(bill.month).slice(0, 7)
                        : bill.billingMonth
                          ? String(bill.billingMonth).slice(0, 7)
                          : "—"}
                    </td>
                    <td className="px-5 py-4">{money(bill.amount)}</td>
                    <td className="px-5 py-4">{money(bill.lateFee)}</td>
                    <td className="px-5 py-4">
                      {money(bill.totalPaid)}
                    </td>
                    <td className="px-5 py-4 font-semibold">
                      {money(bill.outstandingBalance ?? bill.balance)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        status={
                          bill.status ||
                          bill.effectiveStatus ||
                          "Pending"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-[#f0e2dc] bg-white">
          <div className="border-b border-[#f5e9e4] p-5">
            <h2 className="font-bold text-[#332624]">My recent payments</h2>
            <p className="mt-1 text-sm text-[#806e69]">
              Your maintenance payment records.
            </p>
          </div>

          {payments.length === 0 ? (
            <p className="p-5 text-sm text-[#806e69]">
              No payment records found.
            </p>
          ) : (
            <div className="divide-y divide-[#f5e9e4]">
              {payments.slice(0, 5).map((payment, index) => (
                <div
                  key={payment.id ?? payment.paymentId ?? index}
                  className="flex items-center justify-between gap-3 p-5"
                >
                  <div>
                    <p className="font-semibold text-[#332624]">
                      {money(payment.amount ?? payment.amountPaid)}
                    </p>
                    <p className="mt-1 text-xs text-[#806e69]">
                      {formatDate(payment.payDate ?? payment.paymentDate)}
                      {payment.method ? ` · ${payment.method}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={payment.status || "Pending"} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#f0e2dc] bg-white">
          <div className="border-b border-[#f5e9e4] p-5">
            <h2 className="font-bold text-[#332624]">My complaints</h2>
            <p className="mt-1 text-sm text-[#806e69]">
              Track the status of your reported issues.
            </p>
          </div>

          {complaints.length === 0 ? (
            <p className="p-5 text-sm text-[#806e69]">
              You have no complaints on record.
            </p>
          ) : (
            <div className="divide-y divide-[#f5e9e4]">
              {complaints.slice(0, 5).map((complaint, index) => (
                <div
                  key={complaint.id ?? complaint.complaintId ?? index}
                  className="p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#332624]">
                        {complaint.title}
                      </p>
                      <p className="mt-1 text-xs text-[#806e69]">
                        {complaint.category || "General"}
                        {complaint.createdDate
                          ? ` · ${formatDate(complaint.createdDate)}`
                          : ""}
                      </p>
                    </div>
                    <StatusBadge status={complaint.status || "Open"} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#f0e2dc] bg-white">
        <div className="border-b border-[#f5e9e4] p-5">
          <h2 className="font-bold text-[#332624]">My amenity bookings</h2>
          <p className="mt-1 text-sm text-[#806e69]">
            Your facility reservations and booking statuses.
          </p>
        </div>

        {bookings.length === 0 ? (
          <p className="p-5 text-sm text-[#806e69]">
            You have no amenity bookings on record.
          </p>
        ) : (
          <div className="divide-y divide-[#f5e9e4]">
            {bookings.slice(0, 5).map((booking, index) => (
              <div
                key={booking.id ?? booking.bookingId ?? index}
                className="flex flex-wrap items-center justify-between gap-3 p-5"
              >
                <div>
                  <p className="font-semibold text-[#332624]">
                    {booking.amenity || "Amenity booking"}
                  </p>
                  <p className="mt-1 text-xs text-[#806e69]">
                    {formatDate(booking.startTime)}
                    {booking.endTime
                      ? ` – ${formatDate(booking.endTime)}`
                      : ""}
                  </p>
                </div>
                <StatusBadge status={booking.status || "Pending"} />
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-center text-xs text-[#a8958e]">
        MySociety · Your personal society overview
      </p>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    Paid: "bg-[#fff0e9] text-[#c94a31]",
    Pending: "bg-[#fff1dd] text-[#ae5a20]",
    Overdue: "bg-[#fff0e9] text-[#c74232]",
    Open: "bg-[#fff3eb] text-[#b65b35]",
    "In Progress": "bg-[#fff0e9] text-[#d9442f]",
    Resolved: "bg-[#fff0e9] text-[#c94a31]",
    High: "bg-[#fff0e9] text-[#c74232]",
    Medium: "bg-[#fff1dd] text-[#ae5a20]",
    Low: "bg-[#fff0e9] text-[#d9442f]",
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  )
}

export default ResidentDashboard
