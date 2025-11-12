import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, User } from "lucide-react";

interface StatusBadgeProps {
  status: "Enrolled" | "Checked-In" | "Checked-Out" | "Cancelled";
  className?: string;
}

export const StatusBadge = ({ status, className = "" }: StatusBadgeProps) => {
  const statusConfig = {
    "Enrolled": {
      icon: User,
      variant: "secondary" as const,
      label: "Enrolled",
      color: ""
    },
    "Checked-In": {
      icon: CheckCircle2,
      variant: "default" as const,
      label: "Checked In",
      color: "bg-success text-success-foreground"
    },
    "Checked-Out": {
      icon: CheckCircle2,
      variant: "outline" as const,
      label: "Checked Out",
      color: ""
    },
    "Cancelled": {
      icon: XCircle,
      variant: "destructive" as const,
      label: "Cancelled",
      color: ""
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.color} ${className}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
};