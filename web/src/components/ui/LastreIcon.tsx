import iconUrl from "@design-system/assets/lastre-symbol-espectro.svg";

type LastreIconProps = {
  /** Lado da caixa em px; o símbolo é quadrado. */
  size?: number;
  className?: string;
};

/**
 * Símbolo da Lastre. O arquivo é gerado por design-system/scripts/build-symbol.mjs
 * a partir das retas de construção do nó 69:917 do Figma — caixa quadrada de 128,
 * marca centrada na própria bbox ocupando 112. É multicolorido, então não usa
 * máscara CSS como o wordmark: renderiza com as cores próprias.
 */
export function LastreIcon({ size = 20, className }: LastreIconProps) {
  return (
    <img
      src={iconUrl}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={className}
      draggable={false}
    />
  );
}
