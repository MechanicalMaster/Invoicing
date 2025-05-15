import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function ContactUsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-amber-800">Contact Us</h1>
        <p className="text-lg text-muted-foreground">
          Get in touch with our team for any questions or support needs
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="transition-all hover:border-amber-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-amber-800">Our Information</CardTitle>
            <CardDescription>Reach out to us through these channels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start">
              <Mail className="mr-3 h-5 w-5 text-amber-600" />
              <div>
                <h3 className="font-medium">Email Us</h3>
                <p className="text-sm text-muted-foreground">support@ratnainvoicing.com</p>
                <p className="text-sm text-muted-foreground">sales@ratnainvoicing.com</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="mr-3 h-5 w-5 text-amber-600" />
              <div>
                <h3 className="font-medium">Call Us</h3>
                <p className="text-sm text-muted-foreground">+91 1234 567890 (Support)</p>
                <p className="text-sm text-muted-foreground">+91 9876 543210 (Sales)</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin className="mr-3 h-5 w-5 text-amber-600" />
              <div>
                <h3 className="font-medium">Visit Us</h3>
                <p className="text-sm text-muted-foreground">
                  Ratna Tech Solutions<br />
                  123 Jewelers Lane, Diamond District<br />
                  Mumbai, Maharashtra 400001<br />
                  India
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:border-amber-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-amber-800">Send Us a Message</CardTitle>
            <CardDescription>We'll get back to you as soon as possible</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="rounded-lg bg-amber-50 p-6 text-center">
              <h3 className="mb-2 text-lg font-medium text-amber-800">Contact Form Coming Soon</h3>
              <p className="text-amber-700">
                We're working on a contact form to make it easier for you to reach us. 
                In the meantime, please use the contact information provided.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-10 bg-amber-100" />

      <div className="rounded-lg bg-amber-50 p-6">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold text-amber-800">Office Hours</h2>
          <p className="mb-4 text-amber-700">Our support team is available during the following hours:</p>
          <div className="mx-auto max-w-md">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-l bg-amber-100 p-2 font-medium text-amber-800">Monday - Friday</div>
              <div className="rounded-r bg-white p-2 text-gray-700">9:00 AM - 6:00 PM IST</div>
              <div className="rounded-l bg-amber-100 p-2 font-medium text-amber-800">Saturday</div>
              <div className="rounded-r bg-white p-2 text-gray-700">10:00 AM - 4:00 PM IST</div>
              <div className="rounded-l bg-amber-100 p-2 font-medium text-amber-800">Sunday & Holidays</div>
              <div className="rounded-r bg-white p-2 text-gray-700">Closed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button variant="outline" asChild className="text-amber-700 hover:bg-amber-50 hover:text-amber-800">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </>
  )
}