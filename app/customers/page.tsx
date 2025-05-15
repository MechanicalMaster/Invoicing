"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PlusCircle, Search, FileText, Home, Filter, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CustomerCard } from "@/app/customers/customer-card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import supabase from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  // Fetch customers from Supabase
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setCustomers(data || []);
      } catch (error: any) {
        toast({
          title: "Error loading customers",
          description: error.message || "Could not load customers. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [user]);

  // Filter and search customers
  const filteredCustomers = customers.filter(customer => {
    // Apply search filter
    if (searchQuery && !customer.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Apply category filter
    if (filter === "referred" && !customer.referred_by) {
      return false;
    }

    return true;
  });

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Customer Management</h1>
            <p className="text-muted-foreground">Manage your customer relationships and information</p>
          </div>
          <Link href="/customers/add">
            <Button className="bg-primary hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search customers..." 
                className="pl-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" title="Filter">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" title="Sort">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Select 
              value={filter} 
              onValueChange={setFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Filter by</SelectLabel>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="recent">Recent Customers</SelectItem>
                  <SelectItem value="referred">Referred Customers</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>
          <TabsContent value="grid" className="space-y-4">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="ml-2">Loading customers...</p>
              </div>
            ) : filteredCustomers.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCustomers.map((customer) => (
                  <CustomerCard 
                    key={customer.id} 
                    customer={{
                      id: customer.id,
                      name: customer.name,
                      phone: customer.phone || "",
                      email: customer.email || "",
                      address: customer.address || "",
                      identityType: customer.identity_type,
                      identityNumber: customer.identity_reference || "",
                      referredBy: customer.referred_by,
                      createdAt: new Date(customer.created_at),
                      // Mock last transaction data
                      lastTransaction: {
                        id: "INV-XXXX-XXX",
                        date: new Date(),
                        amount: 0,
                        type: "N/A",
                        description: "No transaction data"
                      }
                    }} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed">
                <p className="text-muted-foreground">No customers found</p>
                <Link href="/customers/add" className="mt-2">
                  <Button variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-3 w-3" />
                    Add Your First Customer
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
          <TabsContent value="table">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 pl-4 pr-3 text-left text-sm font-medium">Name</th>
                    <th className="px-3 py-3 text-left text-sm font-medium">Contact</th>
                    <th className="px-3 py-3 text-left text-sm font-medium">ID Type</th>
                    <th className="px-3 py-3 text-left text-sm font-medium">Created At</th>
                    <th className="px-3 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center">
                        <div className="flex items-center justify-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                          <p className="ml-2">Loading customers...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b">
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                          <div className="font-medium">{customer.name}</div>
                          {customer.referred_by && <div className="text-xs text-muted-foreground">Referred by {customer.referred_by}</div>}
                        </td>
                        <td className="px-3 py-4 text-sm">
                          <div>{customer.phone || "N/A"}</div>
                          <div className="text-muted-foreground">{customer.email || "N/A"}</div>
                        </td>
                        <td className="px-3 py-4 text-sm">
                          {customer.identity_type === 'pan_card' ? 'PAN Card' : 
                           customer.identity_type === 'aadhaar_card' ? 'Aadhaar Card' : 
                           customer.identity_type === 'others' ? 'Other ID' : 'None'}
                          {customer.identity_reference && `: ${customer.identity_reference}`}
                        </td>
                        <td className="px-3 py-4 text-sm">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Link href={`/customers/${customer.id}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                            <Link href={`/customers/${customer.id}/edit`}>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">
                        No customers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
