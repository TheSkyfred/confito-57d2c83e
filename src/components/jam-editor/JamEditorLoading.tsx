
import React from "react";
import { Loader2 } from "lucide-react";

const JamEditorLoading: React.FC = () => {
  return (
    <div className="container flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
        <p>Chargement en cours...</p>
      </div>
    </div>
  );
};

export default JamEditorLoading;
