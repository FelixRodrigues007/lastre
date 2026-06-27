import type { ReactNode } from "react";
import "./media-card.css";

type MediaCardProps = {
  image: string;
  alt: string;
  label?: string;
  title: string;
  body: ReactNode;
  featured?: boolean;
  footer?: ReactNode;
  className?: string;
};

/** Image-forward card — Awwwards editorial tile. */
export function MediaCard({
  image,
  alt,
  label,
  title,
  body,
  featured,
  footer,
  className = "",
}: MediaCardProps) {
  return (
    <article className={`media-card${featured ? " media-card--featured" : ""} ${className}`.trim()}>
      <div className="media-card__visual">
        <img className="media-card__img" src={image} alt={alt} loading="lazy" decoding="async" />
        <div className="media-card__scrim" aria-hidden="true" />
        {label ? <span className="media-card__label mono-label">{label}</span> : null}
      </div>
      <div className="media-card__body">
        <h3 className="media-card__title">{title}</h3>
        <div className="media-card__copy">{body}</div>
        {footer ? <footer className="media-card__footer">{footer}</footer> : null}
      </div>
    </article>
  );
}

type SplitMediaProps = {
  image: string;
  alt: string;
  children: ReactNode;
  reverse?: boolean;
};

export function SplitMedia({ image, alt, children, reverse }: SplitMediaProps) {
  return (
    <div className={`split-media${reverse ? " split-media--reverse" : ""}`}>
      <figure className="split-media__figure">
        <img className="split-media__img" src={image} alt={alt} loading="lazy" decoding="async" />
        <figcaption className="split-media__frame" aria-hidden="true" />
      </figure>
      <div className="split-media__content">{children}</div>
    </div>
  );
}
