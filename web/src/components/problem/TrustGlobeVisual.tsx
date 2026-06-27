import { MEDIA } from "../../site-media";

/** Editorial still — global data flow without proof of origin. */
export function TrustGlobeVisual() {
  return (
    <div className="trust-globe" aria-hidden="true">
      <div className="trust-globe__stage">
        <img
          className="trust-globe__photo"
          src={MEDIA.depthBack}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
        />
        <div className="trust-globe__veil" />

        <blockquote className="trust-globe__callout">
          <p>
            Physical readings flow worldwide — yet almost none carry{" "}
            <strong>proof of origin</strong>.
          </p>
        </blockquote>
      </div>
    </div>
  );
}
