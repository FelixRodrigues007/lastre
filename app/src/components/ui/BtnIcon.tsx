import type { ReactNode } from "react";
import type { IconName } from "./Icon";
import { Icon } from "./Icon";
import "./btn-icon.css";

type BtnIconProps = {
  icon: IconName;
  children: ReactNode;
  size?: number;
};

export function BtnIcon({ icon, children, size = 15 }: BtnIconProps) {
  return (
    <span className="btn-icon">
      <span className="btn-icon__glyph" aria-hidden="true">
        <Icon name={icon} size={size} />
      </span>
      {children}
    </span>
  );
}
