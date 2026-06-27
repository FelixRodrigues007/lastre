import type { ReactNode } from "react";

type PageHeaderProps = {
  kicker?: string;
  title: string;
  lead?: string;
  actions?: ReactNode;
};

export function PageHeader({ kicker, title, lead, actions }: PageHeaderProps) {
  return (
    <header className="page__head">
      {kicker ? <p className="page__kicker mono-label">{kicker}</p> : null}
      <div className="page__title-row">
        <h1 className="page__title">{title}</h1>
        {actions ? <div className="page__actions">{actions}</div> : null}
      </div>
      {lead ? <p className="page__lead">{lead}</p> : null}
    </header>
  );
}
