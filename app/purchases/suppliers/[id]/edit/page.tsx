"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Building } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import supabase from "@/lib/supabase"
import { Tables } from "@/lib/database.types"

type Supplier = Tables<"suppliers">

export default function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [supplierId, setSupplierId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  })

  // Unwrap params
  useEffect(() => {
    params.then(p => setSupplierId(p.id));
  }, [params]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
      toast({
        title: "Authentication required",
        description: "Please log in to edit a supplier",
        variant: "destructive",
      })
      return
    }

    if (user && supplierId) {
      fetchSupplier()
    }
  }, [user, authLoading, supplierId])

  const fetchSupplier = async () => {
    if (!supplierId) return;
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("id", supplierId)
        .eq("user_id", user!.id)
        .single()

      if (error) throw error

      if (!data) {
        toast({
          title: "Supplier not found",
          description: "The requested supplier does not exist or you don't have access to it",
          variant: "destructive",
        })
        router.push("/purchases?tab=suppliers")
        return
      }

      setFormData({
        name: data.name || "",
        contact_person: data.contact_person || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        notes: data.notes || "",
      })
    } catch (error: any) {
      console.error("Error fetching supplier:", error)
      toast({
        title: "Error loading supplier",
        description: error.message || "An error occurred while loading supplier details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to update a supplier",
        variant: "destructive",
      })
      return
    }

    if (!formData.name.trim()) {
      toast({
        title: "Required field missing",
        description: "Supplier name is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from("suppliers")
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", supplierId)
        .eq("user_id", user.id)

      if (error) throw error

      toast({
        title: "Supplier updated successfully",
        description: `${formData.name} has been updated`,
      })

      router.push(`/purchases/suppliers/${supplierId}`)
    } catch (error: any) {
      console.error("Error updating supplier:", error)
      toast({
        title: "Error updating supplier",
        description: error.message || "An error occurred while updating the supplier",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-6 p-6 md:gap-8 md:p-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Edit Supplier</h1>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="grid gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* Basic Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Basic Information</CardTitle>
                  <CardDescription>Edit the supplier's contact information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">
                        Supplier Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter supplier name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contact_person">Contact Person</Label>
                      <Input
                        id="contact_person"
                        name="contact_person"
                        placeholder="Enter name of contact person"
                        value={formData.contact_person}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter supplier email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="Enter supplier phone number"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Additional Information</CardTitle>
                  <CardDescription>Edit more details about the supplier</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        placeholder="Enter supplier address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        placeholder="Add any additional notes about this supplier"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supplier Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Supplier Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4 rounded-md border p-4 bg-muted/50">
                    <Building className="mt-0.5 h-5 w-5 text-primary" />
                    <div className="text-sm">
                      <p>
                        Supplier information is used across your account to help you manage your inventory and purchases.
                      </p>
                      <p className="mt-2">
                        Changes made here will be reflected in all associated purchase invoices.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/purchases/suppliers/${supplierId}`)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  )
} 