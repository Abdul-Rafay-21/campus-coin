import { createApp } from "./app.js";
import { getConfig } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { seedDefaultCategories } from "./services/categorySeeder.js";

async function start() {
  try {
    const config = getConfig();
    await connectDatabase(config.mongoUri);
    await seedDefaultCategories();
    createApp(config.clientUrls).listen(config.port, () => {
      console.log(`Campus Coin API running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

start();
