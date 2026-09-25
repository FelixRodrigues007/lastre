import { createServer } from "node:http";
import { handleAssetsRequest } from "./assets/http.js";
const port = Number(process.env.LASTRO_APP_API_PORT ?? 3001);
createServer(async (req, res) => {
  if (await handleAssetsRequest(req, res)) return;
  res.statusCode = 404;
  res.end("Assets API: /api/assets");
}).listen(port, process.env.LASTRO_APP_API_HOST ?? "127.0.0.1", () =>
  console.info(`Lastre Assets API: http://127.0.0.1:${port}`),
);
