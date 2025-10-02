import { ArrowLeft, Monitor, Smartphone, Wifi, HardDrive, Shield, Zap } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function SystemRequirementsPage() {
  const requirements = {
    browsers: [
      { name: "Chrome", version: "90+", recommended: true },
      { name: "Firefox", version: "88+", recommended: false },
      { name: "Safari", version: "14+", recommended: false },
      { name: "Edge", version: "90+", recommended: false }
    ],
    mobile: [
      { name: "iOS Safari", version: "14+", recommended: true },
      { name: "Chrome Mobile", version: "90+", recommended: true },
      { name: "Samsung Internet", version: "14+", recommended: false }
    ],
    hardware: [
      { requirement: "Processor", minimum: "1.6 GHz dual-core", recommended: "2.4 GHz quad-core or better" },
      { requirement: "RAM", minimum: "4 GB", recommended: "8 GB or more" },
      { requirement: "Storage", minimum: "500 MB free space", recommended: "2 GB free space" },
      { requirement: "Display", minimum: "1024x768", recommended: "1920x1080 or higher" }
    ],
    network: [
      "Stable internet connection (minimum 1 Mbps)",
      "WebSocket support for real-time notifications",
      "HTTPS support for secure data transmission"
    ],
    security: [
      "TLS 1.2 or higher encryption",
      "Secure password requirements",
      "Two-factor authentication available",
      "Data encryption at rest and in transit"
    ]
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-amber-800">System Requirements</h1>
        <p className="text-lg text-muted-foreground">
          Technical specifications and browser compatibility for optimal Sethiya Gold performance
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Browser Requirements */}
        <Card className="transition-all hover:border-amber-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-amber-800">
              <Monitor className="mr-2 h-5 w-5" />
              Desktop Browser Compatibility
            </CardTitle>
            <CardDescription>
              Supported web browsers for desktop and laptop computers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requirements.browsers.map((browser) => (
                <div key={browser.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-medium">{browser.name}</span>
                    <span className="ml-2 text-sm text-muted-foreground">{browser.version}</span>
                  </div>
                  {browser.recommended && (
                    <Badge className="bg-amber-600 hover:bg-amber-700">Recommended</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mobile Browser Requirements */}
        <Card className="transition-all hover:border-amber-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-amber-800">
              <Smartphone className="mr-2 h-5 w-5" />
              Mobile Browser Compatibility
            </CardTitle>
            <CardDescription>
              Supported mobile browsers for tablets and smartphones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requirements.mobile.map((browser) => (
                <div key={browser.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-medium">{browser.name}</span>
                    <span className="ml-2 text-sm text-muted-foreground">{browser.version}</span>
                  </div>
                  {browser.recommended && (
                    <Badge className="bg-amber-600 hover:bg-amber-700">Recommended</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hardware Requirements */}
        <Card className="transition-all hover:border-amber-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-amber-800">
              <HardDrive className="mr-2 h-5 w-5" />
              Hardware Requirements
            </CardTitle>
            <CardDescription>
              Minimum and recommended hardware specifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requirements.hardware.map((hw, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{hw.requirement}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Minimum: </span>
                      <span>{hw.minimum}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Recommended: </span>
                      <span className="text-amber-700">{hw.recommended}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Network Requirements */}
        <Card className="transition-all hover:border-amber-300 hover:shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-amber-800">
              <Wifi className="mr-2 h-5 w-5" />
              Network Requirements
            </CardTitle>
            <CardDescription>
              Internet connectivity and security requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {requirements.network.map((req, index) => (
                <li key={index} className="flex items-start">
                  <div className="mr-2 mt-0.5 h-2 w-2 rounded-full bg-amber-600"></div>
                  <span className="text-sm">{req}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Security Features */}
      <div className="mt-8">
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center text-xl text-amber-800">
              <Shield className="mr-2 h-5 w-5" />
              Security & Performance Features
            </CardTitle>
            <CardDescription>
              Built-in security measures and performance optimizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold mb-2 text-amber-800">Security</h4>
                <ul className="space-y-1 text-sm">
                  {requirements.security.map((security, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-2 mt-0.5 h-2 w-2 rounded-full bg-amber-600"></div>
                      <span>{security}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-amber-800">Performance</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Responsive design for all screen sizes</li>
                  <li>• Optimized for touch and mouse interactions</li>
                  <li>• Progressive Web App capabilities</li>
                  <li>• Offline-capable for basic functions</li>
                  <li>• Automatic data synchronization</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Button variant="outline" asChild className="text-amber-700 hover:bg-amber-50 hover:text-amber-800">
          <Link href="/resources/documentation">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documentation
          </Link>
        </Button>
      </div>
    </>
  )
}
