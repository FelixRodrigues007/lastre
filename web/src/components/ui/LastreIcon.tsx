import iconUrl from "@design-system/assets/lastre-icon-espectro.svg";

/** Proporção do vetor original: 150 × 143. */
const RATIO = 150 / 143;

type LastreIconProps = {
  /** Altura em px; a largura acompanha a proporção do vetor. */
  size?: number;
  className?: string;
};

/**
 * Ícone da Lastre — marca exportada do Figma (nó 69:917), servida direto de
 * design-system/assets para o arquivo seguir como fonte única. É multicolorida,
 * então não usa máscara CSS como o wordmark: renderiza com as cores próprias.
 */
export function LastreIcon({ size = 20, className }: LastreIconProps) {
  return (
    <img
      src={iconUrl}
      alt=""
      aria-hidden="true"
      width={Math.round(size * RATIO)}
      height={size}
      className={className}
      draggable={false}
    />
  );
}
