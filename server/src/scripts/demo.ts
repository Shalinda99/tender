import { prisma } from "../lib/prisma.js";
import { runShoppingScenario, runFreelancerScenario } from "../agents/orchestrator.js";

/**
 * Standalone demo runner. Prints the agent activity to the console and persists
 * everything to the DB (visible in the UI grid). Run with: npm run demo
 */
async function main() {
  console.log("\n=== Tender demo: agent-to-agent shopping ===\n");
  const shopping = await runShoppingScenario({ pace: 300 });
  console.log("Shopping outcome:", shopping);

  console.log("\n=== Tender demo: freelancer invoicing + payout ===\n");
  const freelancer = await runFreelancerScenario({ pace: 300 });
  console.log("Freelancer outcome:", freelancer);

  const txns = await prisma.transaction.count();
  console.log(`\nTotal transactions in ledger: ${txns}\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
