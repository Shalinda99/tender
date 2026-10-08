import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/async-handler.js";

export const productsRouter = Router();

productsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const products = await prisma.product.findMany({
      include: { sellerAgent: { select: { id: true, name: true } } },
      orderBy: { title: "asc" },
    });
    res.json(products);
  })
);
