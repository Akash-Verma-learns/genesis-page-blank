import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, ScanLine, LayoutDashboard, Hotel } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Hotel className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">HotelCheck</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Contactless Hotel Check-In
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience seamless check-in and checkout inspired by DigiYatra. 
            Pre-enroll, scan your QR, and enjoy your stay.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Link to="/enrollment" className="group">
            <Card className="h-full transition-all hover:shadow-elevated hover:-translate-y-1 cursor-pointer">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <UserPlus className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-foreground">Guest Enrollment</CardTitle>
                <CardDescription>
                  Register and verify your identity with DigiLocker before arrival
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Start Enrollment
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/reception" className="group">
            <Card className="h-full transition-all hover:shadow-elevated hover:-translate-y-1 cursor-pointer">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <ScanLine className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-foreground">Reception Station</CardTitle>
                <CardDescription>
                  Scan QR codes for instant check-in and checkout processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Open Station
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/dashboard" className="group">
            <Card className="h-full transition-all hover:shadow-elevated hover:-translate-y-1 cursor-pointer">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-foreground">Dashboard</CardTitle>
                <CardDescription>
                  View and manage all bookings, stays, and hotel operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  View Dashboard
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-16 max-w-3xl mx-auto space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-foreground">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-foreground">Pre-Enrollment</h3>
                  <p className="text-sm text-muted-foreground">
                    Verify your identity using DigiLocker, capture a selfie, and receive your secure QR credential
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-foreground">Quick Check-In</h3>
                  <p className="text-sm text-muted-foreground">
                    Scan your QR at the reception or kiosk for instant verification and room assignment
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-foreground">Fast Checkout</h3>
                  <p className="text-sm text-muted-foreground">
                    Scan your QR again at checkout for automatic billing and payment processing
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-foreground">Hotel Partners</CardTitle>
              <CardDescription>
                Register your hotel to join the HotelCheck network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/hotel-enrollment">
                <Button className="w-full" size="lg">
                  <Hotel className="h-5 w-5 mr-2" />
                  Register Your Hotel
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;