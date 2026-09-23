import type { AnchorHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { buttonClassName, type ButtonProps } from "./Button";

type ActionLinkProps = (LinkProps | (AnchorHTMLAttributes<HTMLAnchorElement> & { to?: never })) & Pick<ButtonProps, "variant" | "size">;

/** Navigation with the same visual hierarchy as Button, retaining link semantics. */
export function ActionLink({ variant, size, className, ...props }: ActionLinkProps) {
  const classes = buttonClassName({ variant, size, className });
  if (props.to !== undefined) return <Link {...props as LinkProps} className={classes} />;
  return <a {...props as AnchorHTMLAttributes<HTMLAnchorElement>} className={classes} />;
}
