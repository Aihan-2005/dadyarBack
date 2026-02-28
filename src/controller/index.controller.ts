import { NextFunction, Request, Response } from "express";

class IndexController {

  public index = (_req: Request, res: Response, _next: NextFunction) => {
    res.json({ success: true, message: "Yo" })
  }
}

export default IndexController;
