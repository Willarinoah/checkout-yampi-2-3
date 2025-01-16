import React from 'react';
import { Link as LinkIcon } from "lucide-react";

interface PreviewHeaderProps {
  customUrl: string;
}

export const PreviewHeader: React.FC<PreviewHeaderProps> = ({ customUrl }) => {
  return (
    <div className="bg-white backdrop-blur-lg rounded-lg p-3 flex items-center gap-2 border border-lovepink/30 animate-fade-in">
      <LinkIcon className="w-4 h-4 text-lovepink flex-shrink-0" />
      <p className="text-sm text-gray-900 truncate font-mono">{customUrl}</p>
    </div>
  );
};