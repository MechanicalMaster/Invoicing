"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Edit,
  FileText,
  Home,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  User,
  Calendar,
  Download,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import supabase from "@/lib/supabase"

// Example placeholder transactions data
const exampleTransactions = [
  {
    id: "INV-2023-001",
    date: new Date("2023-04-20"),
    amount: 45600,
    type: "Purchase",
    description: "Gold Necklace Set",
    items: [
      { name: "Gold Necklace", weight: "15g", price: 35000 },
      { name: "Matching Earrings", weight: "5g", price: 10600 },
    ],
    paymentMethod: "Card",
  },
  {
    id: "INV-2023-012",
    date: new Date("2023-02-15"),
    amount: 28500,
    type: "Purchase",
    description: "Diamond Ring",
    items: [{ name: "Diamond Ring", weight: "3g", price: 28500 }],
    paymentMethod: "Cash",
  },
  {
    id: "INV-2023-025",
    date: new Date("2023-01-20"),
    amount: 12800,
    type: "Purchase",
    description: "Silver Anklets",
    items: [{ name: "Silver Anklets", weight: "25g", price: 12800 }],
    paymentMethod: "UPI",
  }
]

interface Customer {
  id: string
  created_at: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  user_id: string
  identity_type: 'pan_card' | 'aadhaar_card' | 'others' | 'none'
  identity_reference: string | null
  identity_doc: string | null
  referred_by?: string | null
  referral_notes?: string | null
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useAuth();
  const router = useRouter();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Unwrap params
  useEffect(() => {
    params.then(p => setCustomerId(p.id));
  }, [params]);

  // Fetch customer data
  useEffect(() => {
    const fetchCustomer = async () => {
      if (!user || !customerId) return;

      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          toast({
            title: "Customer not found",
            description: "The requested customer could not be found.",
            variant: "destructive",
          });
          router.push('/customers');
          return;
        }

        setCustomer(data);
        setIsLoading(false);
      } catch (error: any) {
        toast({
          title: "Error loading customer",
          description: error.message || "Could not load customer data.",
          variant: "destructive",
        });
        router.push('/customers');
      }
    };

    fetchCustomer();
  }, [customerId, user, router]);

  const handleDeleteCustomer = async () => {
    if (!user || !customer) return;
    
    setIsDeleting(true);
    
    try {
      // Delete identity document from storage if it exists
      if (customer.identity_doc) {
        const urlParts = customer.identity_doc.split('/');
        const filePathParts = urlParts.slice(urlParts.indexOf('identity_docs') + 1);
        const existingFilePath = filePathParts.join('/');
        
        if (existingFilePath) {
          await supabase.storage
            .from('identity_docs')
            .remove([existingFilePath]);
        }
      }
      
      // Delete customer from database
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customer.id)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Customer deleted",
        description: "The customer has been successfully deleted.",
      });
      
      router.push('/customers');
    } catch (error: any) {
      toast({
        title: "Error deleting customer",
        description: error.message || "Failed to delete customer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex items-center gap-2 font-heading font-semibold">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl">Sethiya Gold</span>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p>Loading customer information...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (!customer) {
    return null;
  }

  const createdAt = new Date(customer.created_at);
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FileText className="h-6 w-6 text-primary" />
          <span className="text-xl">Ratna Invoicing</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </nav>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <Link href="/customers">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to Customers
            </Button>
          </Link>
          <h1 className="ml-4 text-xl font-semibold md:text-2xl">Customer Details</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Customer Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Avatar className="h-16 w-16 border border-muted">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xl">
                  {getInitials(customer.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{customer.name}</CardTitle>
                <CardDescription>
                  Customer since {createdAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{customer.address}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Identity Information</h3>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span>
                      {customer.identity_type === 'pan_card' ? 'PAN Card' : 
                       customer.identity_type === 'aadhaar_card' ? 'Aadhaar Card' : 
                       customer.identity_type === 'others' ? 'Other ID' : 'None'}
                      {customer.identity_reference && `: ${customer.identity_reference}`}
                    </span>
                  </div>
                  {customer.identity_doc && (
                    <div className="mt-2">
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border">
                        {customer.identity_doc.toLowerCase().endsWith('.pdf') ? (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <FileText className="h-16 w-16 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">PDF Document</p>
                          </div>
                        ) : (
                          <img
                            src={customer.identity_doc}
                            alt="Identity Document"
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <a href={customer.identity_doc} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="mt-2 w-full">
                          <Download className="mr-2 h-3 w-3" />
                          Download Document
                        </Button>
                      </a>
                    </div>
                  )}
                </div>

                {customer.referred_by && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Referral Information</h3>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span>Referred by: {customer.referred_by}</span>
                      </div>
                      {customer.referral_notes && (
                        <p className="text-sm text-muted-foreground">{customer.referral_notes}</p>
                      )}
                    </div>
                  </>
                )}

                <Separator />

                {customer.notes && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Notes</h3>
                    <p className="text-sm text-muted-foreground">{customer.notes}</p>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-4">
                  <Link href={`/customers/${customer.id}/edit`}>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Customer
                    </Button>
                  </Link>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Customer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this customer? This action cannot be undone and all associated data will be permanently removed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteCustomer}
                          disabled={isDeleting}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Transactions and Details */}
          <div className="space-y-6 md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Overview</CardTitle>
                <CardDescription>Transaction history and customer activity</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="transactions">
                  <TabsList className="mb-4">
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>

                  <TabsContent value="transactions" className="space-y-4">
                    <div className="rounded-md border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="py-3 pl-4 pr-3 text-left text-sm font-medium">Invoice</th>
                            <th className="px-3 py-3 text-left text-sm font-medium">Date</th>
                            <th className="px-3 py-3 text-left text-sm font-medium">Description</th>
                            <th className="px-3 py-3 text-right text-sm font-medium">Amount</th>
                            <th className="px-3 py-3 text-center text-sm font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {exampleTransactions.length > 0 ? (
                            exampleTransactions.map((transaction) => (
                              <tr key={transaction.id} className="border-b">
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium">{transaction.id}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                  {transaction.date.toLocaleDateString("en-IN", { dateStyle: "medium" })}
                                </td>
                                <td className="px-3 py-4 text-sm">{transaction.description}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium">
                                  ₹{transaction.amount.toLocaleString("en-IN")}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-center text-sm">
                                  <Link href={`/invoices/${transaction.id}`}>
                                    <Button variant="outline" size="sm">
                                      View
                                    </Button>
                                  </Link>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                                No transactions found for this customer.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Showing {exampleTransactions.length} transactions
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled>
                          Previous
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          Next
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="activity">
                    <div className="space-y-4">
                      {exampleTransactions.length > 0 ? (
                        exampleTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                              <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">
                                  Purchased {transaction.description} - ₹{transaction.amount.toLocaleString("en-IN")}
                                </p>
                                <span className="text-sm text-muted-foreground">
                                  {transaction.date.toLocaleDateString("en-IN", { dateStyle: "medium" })}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Invoice {transaction.id} - Paid via {transaction.paymentMethod}
                              </p>
                              <div className="mt-2">
                                <h4 className="text-xs font-medium text-muted-foreground">Items purchased:</h4>
                                <ul className="mt-1 space-y-1 text-sm">
                                  {transaction.items.map((item, index) => (
                                    <li key={index}>
                                      {item.name} ({item.weight}) - ₹{item.price.toLocaleString("en-IN")}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                          No activity found for this customer.
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="analytics">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              ₹{exampleTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString("en-IN")}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Across {exampleTransactions.length} transactions
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Average Purchase</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              ₹
                              {exampleTransactions.length > 0
                                ? Math.round(
                                    exampleTransactions.reduce((sum, t) => sum + t.amount, 0) /
                                      exampleTransactions.length,
                                  ).toLocaleString("en-IN")
                                : 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Per transaction</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Last Purchase</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {exampleTransactions.length > 0 ? (
                              <>
                                <div className="text-2xl font-bold">
                                  {exampleTransactions[0].date.toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </div>
                                <p className="text-xs text-muted-foreground">{exampleTransactions[0].description}</p>
                              </>
                            ) : (
                              <>
                                <div className="text-2xl font-bold">-</div>
                                <p className="text-xs text-muted-foreground">No purchases yet</p>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm font-medium">Purchase History</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[200px] w-full rounded-md bg-muted p-4 text-center">
                            <p className="pt-16 text-muted-foreground">Purchase history chart would appear here</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common actions for this customer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Link href="/create-invoice" className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90">Create New Invoice</Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full">
                    Schedule Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
