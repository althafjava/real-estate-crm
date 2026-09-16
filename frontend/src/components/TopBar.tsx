import type { ReactNode } from "react";

interface TopBarProps {
  title: string;
  meta?: string;
  action?: ReactNode;
}

export function TopBar({ title, meta, action }: TopBarProps) {
  return (
    <div className="topbar">
      <div>
        <h1>{title}</h1>
        {meta && <div className="topbar-meta">{meta}</div>}
      </div>
      {action}
    </div>
  );
}
