import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function TermsAndConditionsPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-amber-800">Terms and Conditions</h1>
        <p className="text-lg text-muted-foreground">
          Please read these terms carefully before using Sethiya Gold
        </p>
      </div>

      <Card className="mb-8 transition-all hover:border-amber-300 hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-xl text-amber-800">Terms of Use</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-amber max-w-none">
          <p>
            Welcome to Sethiya Gold. By accessing or using our service, you agree to be bound by these Terms and Conditions.
            If you disagree with any part of these terms, you may not access the service.
          </p>

          <h3>1. License to Use</h3>
          <p>
            Sethiya Tech Solutions grants you a limited, non-exclusive, non-transferable license to use Sethiya Gold software
            for your jewelry business operations. This license is subject to these Terms and Conditions.
          </p>

          <h3>2. User Account</h3>
          <p>
            To access certain features of the service, you must register for an account. You are responsible for maintaining the 
            confidentiality of your account information and for all activities under your account. You agree to notify us immediately 
            of any unauthorized use of your account.
          </p>

          <h3>3. Data Privacy</h3>
          <p>
            Your use of the service is also governed by our Privacy Policy, which outlines how we collect, use, and protect your
            personal information and business data. By using Sethiya Gold, you consent to the data practices described in
            the Privacy Policy.
          </p>

          <h3>4. Subscription and Billing</h3>
          <p>
            Some features of Sethiya Gold require a paid subscription. Billing occurs according to the plan you select,
            and you agree to pay all fees associated with your subscription. We reserve the right to change subscription fees
            upon reasonable notice.
          </p>

          <h3>5. Acceptable Use</h3>
          <p>
            You agree not to:
          </p>
          <ul>
            <li>Use the service for any illegal purpose or in violation of any laws</li>
            <li>Violate the intellectual property rights of Ratna Tech Solutions or any third party</li>
            <li>Attempt to gain unauthorized access to any portion of the service</li>
            <li>Interfere with the proper working of the service</li>
            <li>Use the service to store or transmit malicious code</li>
          </ul>

          <h3>6. Termination</h3>
          <p>
            We may terminate or suspend your account and access to the service immediately, without prior notice, for conduct 
            that we determine violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
          </p>

          <h3>7. Limitation of Liability</h3>
          <p>
            To the maximum extent permitted by law, Ratna Tech Solutions shall not be liable for any indirect, incidental, 
            special, consequential, or punitive damages, including loss of profits, data, or business opportunities, resulting 
            from your use of the service.
          </p>

          <h3>8. Changes to Terms</h3>
          <p>
            We reserve the right to modify these terms at any time. We will provide notice of significant changes by posting the 
            new Terms on the service. Your continued use of the service after such modifications constitutes your acceptance of the revised Terms.
          </p>

          <h3>9. Governing Law</h3>
          <p>
            These Terms shall be governed by the laws of India, without regard to its conflict of law provisions. Any disputes 
            arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Mumbai, Maharashtra.
          </p>
        </CardContent>
      </Card>

      <Separator className="my-8 bg-amber-100" />

      <div className="rounded-lg bg-amber-50 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-amber-800">Questions About Our Terms?</h2>
            <p className="text-amber-700">
              If you have any questions about these terms, please contact our support team.
            </p>
          </div>
          <Button asChild className="bg-amber-600 hover:bg-amber-700">
            <Link href="/resources/contact-us">
              Contact Us
            </Link>
          </Button>
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