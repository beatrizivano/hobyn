import { buildApp } from "./app.js";
import { env } from "./infra/env.js";

const app = buildApp();

app.listen(env.port, "0.0.0.0", () => {
  console.info(`API ouvindo na porta ${env.port}.`);
});
