import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

const Dashboard = () => {
  const [stays, setStays] = useState<any[]>([]);

  useEffect(() => {
    const loadStays = async () => {
      const { data } = await supabase
        .from("staylog")
        .select("*, guest(*), hotel(*), room(*)")
        .order("created_at", { ascending: false });
      if (data) setStays(data);
    };
    loadStays();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="container mx-auto py-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Back to Home</Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Stay Management Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stays.map((stay) => (
                <Card key={stay.stayid}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{stay.guest.fname} {stay.guest.lname}</h3>
                        <p className="text-sm text-muted-foreground">{stay.hotel.name} - Room {stay.room.roomnumber}</p>
                      </div>
                      <StatusBadge status={stay.status} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;