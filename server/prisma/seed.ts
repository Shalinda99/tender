import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Tender demo data...");

  // Clean slate (dev only)
  await prisma.approval.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.event.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.agent.deleteMany();

  // ── Agents ──────────────────────────────────────────────
  const butler = await prisma.agent.create({
    data: {
      name: "Pantry Butler",
      type: "buyer",
      owner: "The Rivera Household",
      avatar: "\uD83E\uDDFA",
      persona:
        "You manage a household's recurring supplies on a tight weekly budget. " +
        "You hunt for the best value, negotiate politely but firmly, and never exceed your spend caps.",
      wallet: { create: { paypalRef: "sb-ycwwq53248932@personal.example.com", balanceCached: 240 } },
      policy: {
        create: {
          perTxnCap: 100,
          dailyCap: 300,
          approvalThreshold: 20,
          categoryAllowList: JSON.stringify(["groceries", "household", "supplies", "appliances"]),
        },
      },
    },
  });

  const freelancer = await prisma.agent.create({
    data: {
      name: "Studio Manager",
      type: "manager",
      owner: "Nova Design Studio",
      avatar: "\uD83D\uDCBC",
      persona:
        "You run back-office finance for a freelance design studio. You invoice clients promptly, " +
        "chase late payments, and split revenue to subcontractors the moment a client pays.",
      wallet: { create: { paypalRef: "sb-8zign53249121@business.example.com", balanceCached: 1200 } },
      policy: {
        create: {
          perTxnCap: 500,
          dailyCap: 2000,
          approvalThreshold: 500,
          categoryAllowList: JSON.stringify(["services", "payouts"]),
        },
      },
    },
  });

  const freshCo = await prisma.agent.create({
    data: {
      name: "FreshCo Market",
      type: "seller",
      owner: "FreshCo Supplies Inc.",
      avatar: "\uD83C\uDFEA",
      persona:
        "You are a merchant agent for a grocery supplier. You start near list price but can discount " +
        "down to a hidden floor to win the sale. You never sell below your floor.",
      wallet: { create: { paypalRef: "sb-ycwwq53248932@personal.example.com", balanceCached: 0 } },
      policy: { create: { perTxnCap: 100000, dailyCap: 100000, approvalThreshold: 100000 } },
    },
  });

  const dailyGoods = await prisma.agent.create({
    data: {
      name: "DailyGoods Co",
      type: "seller",
      owner: "DailyGoods Co.",
      avatar: "\uD83D\uDED2",
      persona:
        "You are a competing merchant agent. You price aggressively to undercut rivals and win volume, " +
        "but protect a slim margin above your hidden floor.",
      wallet: { create: { paypalRef: "sb-ycwwq53248932@personal.example.com", balanceCached: 0 } },
      policy: { create: { perTxnCap: 100000, dailyCap: 100000, approvalThreshold: 100000 } },
    },
  });

  // ── Products (per seller) ───────────────────────────────
  const catalog: Array<[string, string, number, number, string]> = [
    // title, category, price, stock, floorMeta
    ["Organic Coffee Beans 1kg", "groceries", 24, 50, "18"],
    ["Whole Milk 2L (x6)", "groceries", 15, 80, "11"],
    ["Paper Towels 12-pack", "household", 22, 40, "16"],
    ["Dish Soap 1L", "household", 6, 120, "4"],
    ["Rice 5kg", "groceries", 18, 60, "13"],
    ["Laundry Detergent 3L", "supplies", 20, 35, "15"],
    // Mid-priced items — these settle above the butler's approval threshold,
    // so they trigger the human-in-the-loop approval flow in the demo.
    ["Robot Vacuum", "appliances", 85, 15, "60"],
    ["Air Purifier", "appliances", 70, 20, "50"],
  ];

  for (const seller of [freshCo, dailyGoods]) {
    for (const [title, category, price, stock, floor] of catalog) {
      const jitter = seller.id === dailyGoods.id ? -1.5 : 0; // DailyGoods undercuts slightly
      await prisma.product.create({
        data: {
          sellerAgentId: seller.id,
          title,
          category,
          price: Math.max(1, price + jitter),
          stock,
          metadata: JSON.stringify({ floor: Number(floor) + jitter }),
        },
      });
    }
  }

  // ── A couple of historical transactions so the grid isn't empty ──
  await prisma.transaction.create({
    data: {
      type: "order",
      amount: 19,
      status: "completed",
      buyer: butler.name,
      seller: dailyGoods.name,
      itemLabel: "Rice 5kg",
      paypalRef: "SANDBOX-ORD-1001",
    },
  });
  await prisma.transaction.create({
    data: {
      type: "invoice",
      amount: 850,
      status: "completed",
      buyer: "Acme Corp",
      seller: freelancer.name,
      itemLabel: "Logo & brand kit",
      paypalRef: "SANDBOX-INV-2001",
    },
  });

  await prisma.event.create({
    data: { type: "system", message: "Tender initialized with demo agents and catalog." },
  });

  console.log("Seed complete:");
  console.log("  Agents:", await prisma.agent.count());
  console.log("  Products:", await prisma.product.count());
  console.log("  Transactions:", await prisma.transaction.count());
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
