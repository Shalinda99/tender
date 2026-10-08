import { Router } from "express";
import { healthRouter } from "./health.routes.js";
import { agentsRouter } from "./agents.routes.js";
import { productsRouter } from "./products.routes.js";
import { transactionsRouter } from "./transactions.routes.js";
import { approvalsRouter } from "./approvals.routes.js";
import { eventsRouter } from "./events.routes.js";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use("/agents", agentsRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/transactions", transactionsRouter);
apiRouter.use("/approvals", approvalsRouter);
apiRouter.use("/events", eventsRouter);
