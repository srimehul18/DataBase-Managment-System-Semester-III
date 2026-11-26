
import { useEffect, useState } from "react"
import { CreditCard, LoaderCircle } from "lucide-react"
import ModulePage from "./ModulePage"

const API_BASE = import.meta.env.VITE_API_URL

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

const columns = [
  { key: "id", label: "Bill ID" },
  { key: "apartment", label: "Apartment" },
  { key: "resident", label: "Resident" },
  { key: "month", label: "Billing Month" },
  { key: "amount", label: "Bill Amount" },
  { key: "lateFee", label: "Late Fee" },
  { key: "totalPaid", label: "Total Paid" },
  { key: "outstandingBalance", label: "Outstanding Balance" },
  { key: "overpaymentAmount", label: "Overpayment" },
  { key: "dueDate", label: "Due Date", date: true },
  { key: "status", label: "Calculated Status", status: true }
]

const getApartmentId = (apartment) =>
  apartment.id ?? apartment.apartmentId ?? apartment.apartment_id

const getResidentApartmentId = (resident) =>
  resident.apartmentId ?? resident.apartment_id

const getApartmentLabel = (apartment) =>
  apartment.apartmentNumber ??
  apartment.apartmentNo ??
  apartment.flatNumber ??
  apartment.flat_no ??
  apartment.name ??
  `Apartment ${getApartmentId(apartment)}`

const createMonthOptions = () => {
  const options = []
  const currentDate = new Date()
  currentDate.setDate(1)

  for (let offset = -6; offset <= 6; offset++) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + offset,
      1
    )

    const value = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0")
    ].join("-")

    const label = date.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric"
    })

    options.push({ label, value })
  }

  return options
}

export default function Maintenance({ role, resident }) {
  const isSecretary = role === "Secretary"
  const isResident = role === "Resident"

  const [apartments, setApartments] = useState([])
  const [residents, setResidents] = useState([])
  const [apartmentError, setApartmentError] = useState("")
  const [payingBillId, setPayingBillId] = useState(null)
  const [paymentMessage, setPaymentMessage] = useState("")
  const [paymentError, setPaymentError] = useState("")

  useEffect(() => {
    if (!isSecretary) return

    const fetchDropdownData = async () => {
      try {
        const [apartmentResponse, residentResponse] = await Promise.all([
          fetch(`${API_BASE}/apartments`),
          fetch(`${API_BASE}/residents`)
        ])

        const apartmentData = await apartmentResponse.json()
        const residentData = await residentResponse.json()

        if (!apartmentResponse.ok) {
          throw new Error("Unable to load apartments.")
        }

        if (!residentResponse.ok) {
          throw new Error("Unable to load residents.")
        }

        setApartments(
          Array.isArray(apartmentData) ? apartmentData : []
        )

        setResidents(
          Array.isArray(residentData) ? residentData : []
        )

        setApartmentError("")
      } catch (error) {
        setApartmentError(
          error.message || "Unable to load apartment information."
        )
      }
    }

    fetchDropdownData()
  }, [isSecretary])

  const apartmentOptions = apartments.map((apartment) => {
    const apartmentId = getApartmentId(apartment)

    const apartmentResidents = residents.filter(
      (item) =>
        String(item.apartment).trim().toLowerCase() ===
        String(apartment.apartment).trim().toLowerCase()
    )

    const residentNames = apartmentResidents
      .map((item) => item.name)
      .filter(Boolean)

    const residentLabel = residentNames.length
      ? residentNames.join(", ")
      : "No resident listed"

    return {
      label: `${apartment.apartment} (ID: ${apartmentId}) — ${residentLabel}`,
      value: String(apartmentId)
    }
  })

  const fields = [
    {
      key: "apartmentId",
      label: "Apartment — Resident",
      options: apartmentOptions,
      placeholder: "Select an apartment"
    },
    {
      key: "month",
      label: "Billing Month",
      options: createMonthOptions(),
      placeholder: "Select billing month"
    },
    {
      key: "amount",
      label: "Bill Amount",
      type: "number",
      placeholder: "Enter maintenance amount"
    }
  ]

  async function handlePayNow(bill) {
    if (!resident?.id) {
      setPaymentError("Resident information is missing. Please log in again.")
      return
    }

    if (payingBillId !== null) return

    setPaymentError("")
    setPaymentMessage("")
    setPayingBillId(bill.id)

    try {
      const scriptLoaded = await loadRazorpayScript()

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay Checkout. Please try again.")
      }

      // Create the order on the backend.
      const orderResponse = await fetch(
        `${API_BASE}/payments/razorpay/order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            billId: bill.id,
            residentId: resident.id
          })
        }
      )

      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(
          orderData.message || "Unable to create payment order."
        )
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "MySociety",
        description: `Maintenance Bill #${bill.id}`,
        order_id: orderData.orderId,

        handler: async function (response) {
          try {
            const verifyResponse = await fetch(
              `${API_BASE}/payments/razorpay/verify`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(response)
              }
            )

            const verifyData = await verifyResponse.json()

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.message || "Payment verification failed."
              )
            }

            setPaymentMessage("Payment successful and verified!")
            window.location.reload()
          } catch (error) {
            setPaymentError(
              error.message || "Unable to verify payment."
            )
            setPayingBillId(null)
          }
        },

        prefill: {
          name: resident.name || ""
        },

        theme: {
          color: "#ef553b"
        },

        modal: {
          ondismiss: function () {
            setPayingBillId(null)
          }
        }
      }

      const checkout = new window.Razorpay(options)

      checkout.on("payment.failed", function (response) {
        setPaymentError(
          response.error?.description ||
          "Payment failed. Please try again."
        )
        setPayingBillId(null)
      })

      checkout.open()
    } catch (error) {
      setPaymentError(
        error.message || "Unable to start Razorpay Checkout."
      )
      setPayingBillId(null)
    }
  }

  const maintenanceColumns = isResident
    ? [
        ...columns,
        {
          key: "payAction",
          label: "Payment",
          render: (_, row) => {
            const outstanding = Number(row.outstandingBalance || 0)
            const isPaying = payingBillId === row.id

            if (outstanding <= 0) {
              return (
                <span className="text-sm font-medium text-green-700">
                  Paid
                </span>
              )
            }

            return (
              <button
                type="button"
                onClick={() => handlePayNow(row)}
                disabled={payingBillId !== null}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#ef553b] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#d9442f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPaying ? (
                  <>
                    <LoaderCircle size={14} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={14} />
                    Pay Now
                  </>
                )}
              </button>
            )
          }
        }
      ]
    : columns

  return (
    <div>
      {apartmentError && (
        <p className="mb-3 text-sm text-red-600" role="alert">
          {apartmentError}
        </p>
      )}

      {paymentMessage && (
        <p
          className="mb-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700"
          role="status"
        >
          {paymentMessage}
        </p>
      )}

      {paymentError && (
        <p
          className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {paymentError}
        </p>
      )}

      <ModulePage
        title="Maintenance"
        description="Track monthly maintenance bills, payments and outstanding dues."
        apiEndpoint="/maintenance"
        columns={maintenanceColumns}
        searchKeys={[
          "id",
          "apartment",
          "resident",
          "month",
          "status"
        ]}
        addLabel="Generate Bill"
        role={role}
        resident={resident}
        allowAdd={isSecretary}
        allowEdit={isSecretary}
        allowDelete={isSecretary}
        fields={fields}
      />
    </div>
  )
}
