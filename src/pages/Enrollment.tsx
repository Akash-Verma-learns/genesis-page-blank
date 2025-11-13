import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle2, Loader2, Shield } from "lucide-react";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";

const Enrollment = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const [formData, setFormData] = useState({
    fname: "",
    mname: "",
    lname: "",
    dob: "",
    nationality: "India",
    address: "",
    emailID: "",
    main_phone: "",
    emergency_contacts: "",
    aadhaarNumber: "",
    hotelId: "",
    roomId: ""
  });

  useEffect(() => {
    const loadHotels = async () => {
      const { data } = await supabase.from("hotel").select("*");
      if (data) setHotels(data);
    };
    loadHotels();
  }, []);

  const loadRooms = async (hotelId: string) => {
    const { data } = await supabase
      .from("room")
      .select("*")
      .eq("hotelid", hotelId)
      .eq("availability_status", "Available");
    if (data) setRooms(data);
  };

  const validateStep1 = () => {
    if (!formData.fname || !formData.lname || !formData.dob || 
        !formData.emailID || !formData.main_phone || !formData.address) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.emailID)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }
    
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.main_phone.replace(/[^0-9]/g, ''))) {
      toast({
        title: "Invalid Phone",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (!formData.aadhaarNumber) {
      toast({
        title: "Missing Aadhaar",
        description: "Please enter your Aadhaar number",
        variant: "destructive"
      });
      return false;
    }
    
    const aadhaarRegex = /^[0-9]{12}$/;
    if (!aadhaarRegex.test(formData.aadhaarNumber.replace(/\s/g, ''))) {
      toast({
        title: "Invalid Aadhaar",
        description: "Aadhaar number must be 12 digits",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const sendOtp = () => {
    if (!validateStep2()) return;
    
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    setCurrentStep(3);
    
    toast({
      title: "OTP Sent",
      description: `Mock OTP sent to ${formData.main_phone}. Use: ${mockOtp}`,
    });
  };

  const verifyOtp = () => {
    if (otp === generatedOtp) {
      setOtpVerified(true);
      setCurrentStep(4);
      toast({
        title: "OTP Verified",
        description: "Identity verified successfully via DigiLocker",
      });
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.hotelId || !formData.roomId) {
      toast({
        title: "Missing Information",
        description: "Please select hotel and room",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("enrol", {
        body: {
          ...formData,
          aadhaarNumber: formData.aadhaarNumber.replace(/\s/g, ''),
          emergency_contacts: formData.emergency_contacts ? JSON.parse(formData.emergency_contacts) : {},
          digilockerData: {
            documentType: "Aadhaar",
            documentNumber: formData.aadhaarNumber.replace(/\s/g, ''),
            verified: otpVerified
          },
          hotelId: formData.hotelId,
          roomId: formData.roomId
        }
      });

      if (error) throw error;

      if (data.success) {
        setEnrollmentData(data);
        toast({
          title: "Enrollment Successful!",
          description: "Your QR credential has been generated.",
        });
      } else {
        throw new Error(data.error || "Enrollment failed");
      }
    } catch (error: any) {
      console.error('Enrollment error:', error);
      toast({
        title: "Enrollment Failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (enrollmentData) {
    return (
      <div className="min-h-screen bg-gradient-hero p-4">
        <div className="container mx-auto max-w-2xl py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success mb-4">
              <CheckCircle2 className="h-8 w-8 text-success-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Enrollment Complete!</h1>
            <p className="text-muted-foreground">
              Save your QR code and show it at check-in
            </p>
          </div>

          <QRCodeDisplay
            data={enrollmentData.credential}
            guestName={`${formData.fname} ${formData.lname}`}
            stayId={enrollmentData.stayId}
          />

          <div className="mt-6 flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link to="/reception">Go to Reception</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="container mx-auto max-w-3xl py-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Guest Enrollment - Step {currentStep} of 4
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Enter your personal information"}
              {currentStep === 2 && "Verify your identity with Aadhaar"}
              {currentStep === 3 && "Enter OTP sent to your phone"}
              {currentStep === 4 && "Select your hotel and room"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Personal Information</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="fname">First Name *</Label>
                      <Input
                        id="fname"
                        required
                        value={formData.fname}
                        onChange={(e) => setFormData({ ...formData, fname: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="mname">Middle Name</Label>
                      <Input
                        id="mname"
                        value={formData.mname}
                        onChange={(e) => setFormData({ ...formData, mname: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lname">Last Name *</Label>
                      <Input
                        id="lname"
                        required
                        value={formData.lname}
                        onChange={(e) => setFormData({ ...formData, lname: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dob">Date of Birth *</Label>
                      <Input
                        id="dob"
                        type="date"
                        required
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nationality">Nationality *</Label>
                      <Input
                        id="nationality"
                        required
                        value={formData.nationality}
                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emailID">Email *</Label>
                      <Input
                        id="emailID"
                        type="email"
                        required
                        value={formData.emailID}
                        onChange={(e) => setFormData({ ...formData, emailID: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="main_phone">Phone *</Label>
                      <Input
                        id="main_phone"
                        type="tel"
                        required
                        placeholder="10-digit number"
                        value={formData.main_phone}
                        onChange={(e) => setFormData({ ...formData, main_phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button type="button" onClick={() => {
                    if (validateStep1()) setCurrentStep(2);
                  }} className="w-full">
                    Continue to Identity Verification
                  </Button>
                </div>
              )}

              {/* Step 2: Aadhaar Verification */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">DigiLocker - Aadhaar Verification</h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Enter your Aadhaar number to verify your identity via DigiLocker
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
                    <Input
                      id="aadhaarNumber"
                      placeholder="XXXX XXXX XXXX"
                      required
                      maxLength={14}
                      value={formData.aadhaarNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                        setFormData({ ...formData, aadhaarNumber: formatted });
                      }}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="button" onClick={() => setCurrentStep(1)} variant="outline" className="flex-1">
                      Back
                    </Button>
                    <Button type="button" onClick={sendOtp} className="flex-1">
                      Send OTP
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: OTP Verification */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Verify OTP</h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      An OTP has been sent to {formData.main_phone}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Mock OTP: {generatedOtp}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="otp">Enter OTP *</Label>
                    <Input
                      id="otp"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="button" onClick={() => setCurrentStep(2)} variant="outline" className="flex-1">
                      Back
                    </Button>
                    <Button type="button" onClick={verifyOtp} disabled={otp.length !== 6} className="flex-1">
                      Verify OTP
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Hotel & Room Selection */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-foreground">Booking Details</h3>
                  <div>
                    <Label htmlFor="hotelId">Select Hotel *</Label>
                    <Select
                      value={formData.hotelId}
                      onValueChange={(value) => {
                        setFormData({ ...formData, hotelId: value, roomId: "" });
                        loadRooms(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a hotel" />
                      </SelectTrigger>
                      <SelectContent>
                        {hotels.map((hotel) => (
                          <SelectItem key={hotel.hotelid} value={hotel.hotelid}>
                            {hotel.name} - {hotel.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.hotelId && (
                    <div>
                      <Label htmlFor="roomId">Select Room *</Label>
                      <Select
                        value={formData.roomId}
                        onValueChange={(value) => setFormData({ ...formData, roomId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a room" />
                        </SelectTrigger>
                        <SelectContent>
                          {rooms.map((room) => (
                            <SelectItem key={room.roomid} value={room.roomid}>
                              Room {room.roomnumber} - {room.roomtype} (₹{room.pricepernight}/night)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button type="button" onClick={() => setCurrentStep(3)} variant="outline" className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading || !formData.hotelId || !formData.roomId}>
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Complete Enrollment
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Enrollment;
