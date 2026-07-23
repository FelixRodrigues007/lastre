import { useLocaleContext } from "../../context/LocaleContext";
import "./sealed-rail-banner.css";

type SealedRailBannerProps = {
  /** True when the visitor arrived via `?rail=1` from the Marketplace rail. */
  emphasize?: boolean;
};

export function SealedRailBanner({ emphasize = false }: SealedRailBannerProps) {
  const { t } = useLocaleContext();

  return (
    <aside
      className={`sealed-rail-banner${emphasize ? " sealed-rail-banner--emphasized" : ""}`}
      aria-label={t("myassets.rail.bannerTitle")}
    >
      <p className="sealed-rail-banner__title mono-label">{t("myassets.rail.bannerTitle")}</p>
      <p className="sealed-rail-banner__body">{t("myassets.rail.bannerBody")}</p>
    </aside>
  );
}
