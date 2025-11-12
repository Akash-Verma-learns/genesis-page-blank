import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface QRCodeDisplayProps {
  data: string;
  guestName: string;
  stayId: string;
}

export const QRCodeDisplay = ({ data, guestName, stayId }: QRCodeDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, data, {
        width: 300,
        margin: 2,
        color: {
          dark: "#0891b2",
          light: "#ffffff"
        }
      });
    }
  }, [data]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `hotelcheck-qr-${stayId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <Card className="shadow-elevated">
      <CardHeader className="text-center">
        <CardTitle className="text-foreground">Your QR Credential</CardTitle>
        <CardDescription>
          Show this QR code at check-in and checkout
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="bg-white p-4 rounded-lg">
          <canvas ref={canvasRef} />
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold text-foreground">{guestName}</p>
          <p className="text-sm text-muted-foreground">Stay ID: {stayId.slice(0, 8)}</p>
        </div>
        <Button onClick={handleDownload} variant="outline" className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Download QR Code
        </Button>
      </CardContent>
    </Card>
  );
};