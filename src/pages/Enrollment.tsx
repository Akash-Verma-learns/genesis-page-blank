import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Camera, CheckCircle2, Loader2 } from "lucide-react";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";

const Enrollment = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

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
    digilockerDocType: "Aadhaar",
    hotelId: "",
    roomId: ""
  });

  // Load hotels on mount
  useState(() => {
    const loadHotels = async () => {
      const { data } = await supabase.from("hotel").select("*");
      if (data) setHotels(data);
    };
    loadHotels();
  });

  const loadRooms = async (hotelId: string) => {
    const { data } = await supabase
      .from("room")
      .select("*")
      .eq("hotelid", hotelId)
      .eq("availability_status", "Available");
    if (data) setRooms(data);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const captureSelfie = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setSelfie(dataUrl);
        // Stop camera
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setCameraActive(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call enrollment edge function
      const { data, error } = await supabase.functions.invoke("enrol", {
        body: {
          ...formData,
          emergency_contacts: formData.emergency_contacts ? JSON.parse(formData.emergency_contacts) : {},
          digilockerData: {
            documentType: formData.digilockerDocType,
            documentLink: null,
            issueDate: null,
            expiryDate: null
          },
          hotelId: formData.hotelId,
          roomId: formData.roomId,
          selfieBase64: selfie
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
            <CardTitle className="text-foreground">Guest Enrollment</CardTitle>
            <CardDescription>
              Complete your pre-arrival registration and receive your QR credential
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
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
                      value={formData.main_phone}
                      onChange={(e) => setFormData({ ...formData, main_phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* DigiLocker Mock */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Identity Verification (Mock DigiLocker)</h3>
                <div>
                  <Label htmlFor="digilockerDocType">Document Type</Label>
                  <Select
                    value={formData.digilockerDocType}
                    onValueChange={(value) => setFormData({ ...formData, digilockerDocType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aadhaar">Aadhaar Card</SelectItem>
                      <SelectItem value="PAN">PAN Card</SelectItem>
                      <SelectItem value="Passport">Passport</SelectItem>
                      <SelectItem value="DrivingLicense">Driving License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Selfie Capture */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Capture Selfie</h3>
                {!selfie && !cameraActive && (
                  <Button type="button" onClick={startCamera} variant="outline" className="w-full">
                    <Camera className="h-4 w-4 mr-2" />
                    Start Camera
                  </Button>
                )}
                {cameraActive && (
                  <div className="space-y-2">
                    <video ref={videoRef} autoPlay className="w-full rounded-lg" />
                    <Button type="button" onClick={captureSelfie} className="w-full">
                      Capture Photo
                    </Button>
                  </div>
                )}
                {selfie && (
                  <div className="space-y-2">
                    <img src={selfie} alt="Selfie" className="w-full rounded-lg" />
                    <Button type="button" onClick={() => { setSelfie(null); startCamera(); }} variant="outline" className="w-full">
                      Retake Photo
                    </Button>
                  </div>
                )}
              </div>

              {/* Hotel & Room Selection */}
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
              </div>

              <Button type="submit" className="w-full" disabled={loading || !selfie}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Complete Enrollment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Enrollment;