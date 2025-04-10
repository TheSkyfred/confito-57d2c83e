
import React from "react";
import { Separator } from "@/components/ui/separator";

interface JamEditorHeaderProps {
  title: string;
  subtitle: string;
}

const JamEditorHeader: React.FC<JamEditorHeaderProps> = ({
  title,
  subtitle,
}) => {
  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-jam-raspberry">
        {title}
      </h1>
      <p className="text-muted-foreground mt-1">
        {subtitle}
      </p>
      <Separator className="mt-6" />
    </div>
  );
};

export default JamEditorHeader;
