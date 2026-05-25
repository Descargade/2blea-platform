"use client";

import { FileX2 } from "lucide-react";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-gray-500 mb-4">
        {icon ?? <FileX2 className="w-12 h-12" />}
      </div>
      <h3 className="text-lg font-medium text-gray-300 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-6 text-center max-w-md">{description}</p>}
      {action}
    </div>
  );
}
