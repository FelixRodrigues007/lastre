export type SiteCamera = {
  id: string;
  label: string;
  zone: string;
  posX: number;
  posY: number;
};

export function getSiteCameras(input: {
  isCarbon: boolean;
  label: string;
  assetId: string;
}): SiteCamera[] {
  const seed = input.assetId.length;

  if (!input.isCarbon) {
    return [
      { id: "pit", label: "Open pit · overview", zone: "Sector A", posX: 22 + (seed % 8), posY: 35 },
      { id: "processing", label: "Processing line", zone: "Plant", posX: 55, posY: 48 },
      { id: "gate", label: "Perimeter gate", zone: "North access", posX: 78, posY: 30 },
      { id: "seal", label: "Seal station", zone: "Dispatch", posX: 40, posY: 62 },
    ];
  }

  return [
    { id: "canopy", label: "Canopy monitoring", zone: "Plot 12", posX: 20, posY: 42 },
    { id: "array", label: "Array overview", zone: "Field B", posX: 62, posY: 38 },
    { id: "weather", label: "Weather station", zone: "Ridge", posX: 48, posY: 55 },
    { id: "ground", label: "Ground sensor cam", zone: "Base", posX: 72, posY: 50 },
  ];
}
