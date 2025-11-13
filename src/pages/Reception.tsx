import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, ScanLine } from "lucide-react";

const Reception = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [credential, setCredential] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("checkin", {
        body: { credential }
      });
      if (error) throw error;
      setResult(data);
      toast({ title: "Check-In Successful!", description: data.message });
    } catch (error: any) {
      toast({ title: "Check-In Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("checkout", {
        body: { credential }
      });
      if (error) throw error;
      setResult(data);
      toast({ title: "Checkout Initiated!", description: data.message });
      
      // Redirect to payment page with billing details
      if (data.success && data.data.billingId) {
        window.location.href = `/payment?billingId=${data.data.billingId}&stayId=${data.data.stayId}`;
      }
    } catch (error: any) {
      toast({ title: "Checkout Failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Back to Home</Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="h-5 w-5" />
              Reception Station
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="checkin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="checkin">Check-In</TabsTrigger>
                <TabsTrigger value="checkout">Checkout</TabsTrigger>
              </TabsList>
              <TabsContent value="checkin" className="space-y-4">
                <Label>Guest QR Credential</Label>
                <Input placeholder="Paste QR credential" value={credential} onChange={(e) => setCredential(e.target.value)} />
                <Button onClick={handleCheckIn} disabled={loading || !credential} className="w-full">
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Process Check-In
                </Button>
              </TabsContent>
              <TabsContent value="checkout" className="space-y-4">
                <Label>Guest QR Credential</Label>
                <Input placeholder="Paste QR credential" value={credential} onChange={(e) => setCredential(e.target.value)} />
                <Button onClick={handleCheckOut} disabled={loading || !credential} className="w-full">
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Process Checkout
                </Button>
              </TabsContent>
            </Tabs>

            {result && (
              <Card className="mt-6 bg-muted/50">
                <CardContent className="pt-6">
                  <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reception;