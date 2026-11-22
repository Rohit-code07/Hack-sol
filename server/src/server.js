import { closeDb } from "./config/database.js";
import { env } from "./config/env.js";
import { createApp } from "./app.js";

const SHUTDOWN_SIGNALS = ["SIGINT", "SIGTERM"];

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`KrishiSetu API running on port ${env.PORT}`);
});

function shutdown() {
  server.close(() => {
    closeDb();
    process.exit(0);
  });
}

for (const signal of SHUTDOWN_SIGNALS) {
  process.on(signal, shutdown);
}