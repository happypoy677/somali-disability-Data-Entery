import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import peopleRouter from "./people";
import dashboardRouter from "./dashboard";
import backupsRouter from "./backups";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(peopleRouter);
router.use(dashboardRouter);
router.use(backupsRouter);

export default router;
