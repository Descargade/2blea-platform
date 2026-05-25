"use client";

export function TypingIndicator({ names }: { names: string[] }) {
  if (names.length === 0) return null;

  const text = names.length === 1
    ? `${names[0]} está escribiendo`
    : names.length === 2
      ? `${names[0]} y ${names[1]} están escribiendo`
      : `${names[0]} y ${names.length - 1} más están escribiendo`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-gray-500">
      <div className="flex gap-0.5">
        <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="italic">{text}</span>
    </div>
  );
}
