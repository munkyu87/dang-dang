import { getDb } from "@/db";
import { expireDue, processDueJobs } from "@/server/pipeline";

getDb();

async function tick() {
  expireDue();
  await processDueJobs();
}

void tick();
setInterval(() => {
  void tick();
}, 3000);
