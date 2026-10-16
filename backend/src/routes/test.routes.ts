import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Test route is working!",
    timestamp: new Date().toISOString()
  });
});

router.get("/ping", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Test pong!",
    timestamp: new Date().toISOString()
  });
});

export default router;