import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function RecentInvoices() {
  const invoices = [
    {
      id: "1",
      customer: "Rahul Sharma",
      amount: "₹12,450",
      date: "15/05/2023",
      status: "Paid",
      initials: "RS",
    },
    {
      id: "2",
      customer: "Priya Patel",
      amount: "₹8,790",
      date: "12/05/2023",
      status: "Pending",
      initials: "PP",
    },
    {
      id: "3",
      customer: "Amit Singh",
      amount: "₹23,900",
      date: "10/05/2023",
      status: "Paid",
      initials: "AS",
    },
    {
      id: "4",
      customer: "Neha Gupta",
      amount: "₹5,670",
      date: "05/05/2023",
      status: "Paid",
      initials: "NG",
    },
    {
      id: "5",
      customer: "Vikram Mehta",
      amount: "₹18,340",
      date: "01/05/2023",
      status: "Pending",
      initials: "VM",
    },
  ]

  return (
    <div className="space-y-8">
      {invoices.map((invoice) => (
        <div className="flex items-center" key={invoice.id}>
          <Avatar className="h-9 w-9 border border-amber-200">
            <AvatarFallback className="bg-amber-50 text-amber-900">{invoice.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{invoice.customer}</p>
            <p className="text-sm text-muted-foreground">{invoice.date}</p>
          </div>
          <div className="ml-auto font-medium">
            <span className={invoice.status === "Paid" ? "text-green-600" : "text-amber-600"}>{invoice.amount}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
