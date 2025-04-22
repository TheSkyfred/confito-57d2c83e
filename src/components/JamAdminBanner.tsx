
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface JamAdminBannerProps {
  jamId: string;
}

const JamAdminBanner: React.FC<JamAdminBannerProps> = ({ jamId }) => {
  return (
    <div className="bg-slate-800 text-white py-2 px-4">
      <div className="container flex items-center justify-between">
        <span className="text-sm">Mode administrateur</span>
        <Button variant="ghost" size="sm" asChild className="text-white hover:text-white">
          <Link to={`/admin/jams/edit/${jamId}`}>
            <Settings className="h-4 w-4 mr-2" />
            Gérer cette confiture
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default JamAdminBanner;
