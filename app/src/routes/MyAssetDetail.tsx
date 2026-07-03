import { Navigate, useParams } from "react-router-dom";

export function MyAssetDetail() {
  const { assetId = "" } = useParams();

  if (!assetId) {
    return <Navigate to="/my-assets" replace />;
  }

  return <Navigate to={`/my-assets?asset=${encodeURIComponent(assetId)}`} replace />;
}
