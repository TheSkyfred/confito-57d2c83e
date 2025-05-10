
import React from "react";
import { Check } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type JamStatus = "pending" | "approved" | "rejected";

interface StatusDropdownProps {
  currentStatus: string;
  onStatusChange: (status: JamStatus) => void;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  currentStatus,
  onStatusChange
}) => {
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "pending": return "En attente";
      case "approved": return "Approuvé";
      case "rejected": return "Rejeté";
      default: return "En attente";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved": return "bg-green-100 text-green-800 border-green-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`w-40 justify-start ${getStatusColor(currentStatus)}`}
        >
          {getStatusLabel(currentStatus)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-40">
        <DropdownMenuItem 
          onClick={() => onStatusChange("pending")}
          className="flex items-center justify-between"
        >
          En attente
          {currentStatus === "pending" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onStatusChange("approved")}
          className="flex items-center justify-between"
        >
          Approuvé
          {currentStatus === "approved" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onStatusChange("rejected")}
          className="flex items-center justify-between"
        >
          Rejeté
          {currentStatus === "rejected" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusDropdown;
