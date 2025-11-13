import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import QRCode from "qrcode";

const Payment = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [billingData, setBillingData] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [paymentDetails, setPaymentDetails] = useState({
    upi_id: "",
    transactionref: "",
    cardtype: "",
    bank: "",
    txnid: ""
  });

  const billingId = searchParams.get("billingId");
  const stayId = searchParams.get("stayId");

  useEffect(() => {
    if (billingId) {
      fetchBillingData();
    }
  }, [billingId]);

  useEffect(() => {
    if (paymentMethod === "upi" && canvasRef.current && billingData) {
      const upiString = `upi://pay?pa=hotel@upi&pn=HotelCheck&am=${billingData.finalamount}&cu=INR&tn=Payment for Stay`;
      QRCode.toCanvas(canvasRef.current, upiString, {
        width: 200,
        margin: 2,
        color: { dark: "#0891b2", light: "#ffffff" }
      });
    }
  }, [paymentMethod, billingData]);

  const fetchBillingData = async () => {
    try {
      const { data, error } = await supabase
        .from("billing")
        .select("*")
        .eq("billingid", billingId)
        .single();

      if (error) throw error;
      setBillingData(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const paymentData: any = {
        billingid: billingId,
        amount: billingData.finalamount,
        method: paymentMethod,
        status: "Completed",
        paymentdate: new Date().toISOString()
      };

      if (paymentMethod === "upi") {
        paymentData.upi_id = paymentDetails.upi_id;
        paymentData.transactionref = paymentDetails.transactionref;
      } else if (paymentMethod === "creditcard") {
        paymentData.cardtype = paymentDetails.cardtype;
        paymentData.bank = paymentDetails.bank;
      } else if (paymentMethod === "netbanking") {
        paymentData.bank = paymentDetails.bank;
        paymentData.txnid = paymentDetails.txnid;
      }

      const { error } = await supabase.from("payment").insert(paymentData);

      if (error) throw error;

      toast({
        title: "Payment Successful!",
        description: "Your payment has been processed."
      });

      navigate(`/feedback?stayId=${stayId}`);
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!billingData) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
            <CardDescription>
              Complete your payment for the stay
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-semibold">₹{(billingData.finalamount / 1.18).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Tax (18%):</span>
                <span className="font-semibold">₹{billingData.tax}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total Amount:</span>
                <span>₹{billingData.finalamount}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label>Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi">UPI</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="creditcard" id="creditcard" />
                    <Label htmlFor="creditcard">Credit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="netbanking" id="netbanking" />
                    <Label htmlFor="netbanking">Net Banking</Label>
                  </div>
                </RadioGroup>
              </div>

              {paymentMethod === "upi" && (
                <div className="space-y-4">
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <canvas ref={canvasRef} />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    Scan QR code with any UPI app to pay
                  </p>
                  <div>
                    <Label htmlFor="upi_id">UPI ID *</Label>
                    <Input
                      id="upi_id"
                      value={paymentDetails.upi_id}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, upi_id: e.target.value })}
                      required
                      placeholder="yourname@upi"
                    />
                  </div>
                  <div>
                    <Label htmlFor="transactionref">Transaction Reference *</Label>
                    <Input
                      id="transactionref"
                      value={paymentDetails.transactionref}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, transactionref: e.target.value })}
                      required
                      placeholder="Enter UPI transaction ID"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "creditcard" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardtype">Card Type *</Label>
                    <Input
                      id="cardtype"
                      value={paymentDetails.cardtype}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, cardtype: e.target.value })}
                      required
                      placeholder="Visa/Mastercard/Amex"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank">Bank Name *</Label>
                    <Input
                      id="bank"
                      value={paymentDetails.bank}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, bank: e.target.value })}
                      required
                      placeholder="Bank name"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bank_nb">Bank Name *</Label>
                    <Input
                      id="bank_nb"
                      value={paymentDetails.bank}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, bank: e.target.value })}
                      required
                      placeholder="Select your bank"
                    />
                  </div>
                  <div>
                    <Label htmlFor="txnid">Transaction ID *</Label>
                    <Input
                      id="txnid"
                      value={paymentDetails.txnid}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, txnid: e.target.value })}
                      required
                      placeholder="Enter transaction ID"
                    />
                  </div>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Complete Payment
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment;
