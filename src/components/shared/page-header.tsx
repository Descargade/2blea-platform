"use client";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">{title}</h1>
        {description && <p className="text-gray-400 text-sm">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
