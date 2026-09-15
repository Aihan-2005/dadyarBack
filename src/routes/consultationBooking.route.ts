import {
  Router,
} from "express";

import {
  cancelBooking,
  clientBookings,
  createBooking,
  lawyerBookings,
  updateStatus,
} from "../controllers/consultationBooking.controller";

import type {
  Route,
} from "../interfaces/route.interface";

import requireAuth, {
  requireActiveLawyer,
  requireRole,
} from "../middlewares/auth.middleware";


export class ClientConsultationBookingRoute
  implements Route {

  public readonly path =
    "/client/bookings";

  public readonly router =
    Router();


  constructor() {
    this.initializeMiddlewares();

    this.initializeRoutes();
  }


  private initializeMiddlewares(): void {
    this.router.use(
      requireAuth,

      requireRole(
        "CLIENT",
      ),
    );
  }


  private initializeRoutes(): void {

    
    this.router.post(
      "/",

      createBooking,
    );


    

    this.router.get(
      "/",

      clientBookings,
    );


   
    
    this.router.patch(
      "/:id/cancel",

      cancelBooking,
    );
  }
}


export class LawyerConsultationBookingRoute
  implements Route {

  public readonly path =
    "/lawyer/bookings";

  public readonly router =
    Router();


  constructor() {
    this.initializeMiddlewares();

    this.initializeRoutes();
  }


  private initializeMiddlewares(): void {
    this.router.use(
      requireAuth,

      requireRole(
        "LAWYER",
      ),

      requireActiveLawyer,
    );
  }


  private initializeRoutes(): void {
  
    
    this.router.get(
      "/",

      lawyerBookings,
    );


  
    
    this.router.patch(
      "/:id/status",

      updateStatus,
    );
  }
}

