import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Hotel, Loader2 } from "lucide-react";

const HotelEnrollment = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    email: "",
    contact_number: "",
    total_rooms: "",
    rating: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("hotel").insert({
        name: formData.name,
        location: formData.location,
        email: formData.email,
        contact_number: formData.contact_number,
        total_rooms: parseInt(formData.total_rooms),
        rating: formData.rating ? parseFloat(formData.rating) : null
      });

      if (error) throw error;

      toast({
        title: "Hotel Registered Successfully!",
        description: "Your hotel has been enrolled in the system."
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hotel className="h-5 w-5" />
              Hotel Registration
            </CardTitle>
            <CardDescription>
              Register your hotel in the HotelCheck system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Hotel Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Grand Plaza Hotel"
                />
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Mumbai, Maharashtra"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="contact@hotel.com"
                />
              </div>

              <div>
                <Label htmlFor="contact_number">Contact Number *</Label>
                <Input
                  id="contact_number"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  required
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <Label htmlFor="total_rooms">Total Rooms *</Label>
                <Input
                  id="total_rooms"
                  name="total_rooms"
                  type="number"
                  value={formData.total_rooms}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="50"
                />
              </div>

              <div>
                <Label htmlFor="rating">Rating (Optional)</Label>
                <Input
                  id="rating"
                  name="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={handleChange}
                  placeholder="4.5"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Register Hotel
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HotelEnrollment;
