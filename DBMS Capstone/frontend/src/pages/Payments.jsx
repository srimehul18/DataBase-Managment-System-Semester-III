
import ModulePage from "./ModulePage"


const columns = [
  { key: "id", label: "Payment ID" },
  { key: "resident", label: "Resident" },
  { key: "billId", label: "Bill ID" },
  { key: "payDate", label: "Payment Date", date: true },
  { key: "amount", label: "Amount" },
  { key: "method", label: "Method" },
  { key: "status", label: "Status", status: true },
  {
    key: "paymentProofUrl",
    label: "Payment Proof",
    render: (value) =>
      value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#ef553b] hover:text-[#d9442f] hover:underline"
        >
          View Proof
        </a>
      ) : (
        <span className="text-[#a8958e]">
          Not uploaded
        </span>
      )
  }
]


export default function Payments({ role, resident }) {
  return (
    <ModulePage
      title="Payments"
      description="Review payment records, methods and transaction statuses."
      apiEndpoint="/payments"
      columns={columns}
      searchKeys={[
        "id",
        "resident",
        "billId",
        "payDate",
        "amount",
        "method",
        "referenceNo",
        "status"
      ]}
      addLabel="Record Payment"
      role={role}
      resident={resident}
      allowAdd={role === "Secretary" || role === "Resident"}
      allowEdit={role === "Secretary" || role === "Resident"}
      allowDelete={role === "Secretary"}
      allowUploadProof={
        role === "Secretary" || role === "Resident"
      }
      fields={[
        {
          key: "billId",
          label: "Bill ID",
          type: "number",
          placeholder: "Enter an existing Bill ID"
        },
        {
          key: "payDate",
          label: "Payment Date",
          type: "date"
        },
        {
          key: "amount",
          label: "Amount",
          type: "number",
          placeholder: "Enter payment amount"
        },
        {
          key: "method",
          label: "Payment Method",
          options: [
            "UPI",
            "Cash",
            "Bank Transfer",
            "Card",
            "Cheque"
          ]
        },
        {
          key: "referenceNo",
          label: "Reference Number",
          required: false,
          placeholder: "Optional transaction reference"
        },
        {
          key: "status",
          label: "Status",
          options: [
            "Successful",
            "Pending",
            "Failed",
            "Refunded"
          ]
        }
      ]}
    />
  )
}
