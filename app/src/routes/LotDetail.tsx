import { Navigate, useParams } from "react-router-dom";

/** Deep links from audit, chain, capture, etc. open the lot drawer on the queue. */
export function LotDetailRedirect() {
  const { assetId = "" } = useParams();
  return <Navigate to={`/lots?lot=${encodeURIComponent(assetId)}`} replace />;
}
