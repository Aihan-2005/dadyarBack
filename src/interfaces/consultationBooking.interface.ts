import {
  ConsultationType,
  ConsultationBookingStatus,
} from "../constants/consultationBooking.constants";


export interface IConsultationBooking {
  clientId:
    string;

  lawyerId:
    string;


    
  availabilityId?:
    string | null;

  type:
    ConsultationType;

 
    
  startsAt?:
    Date | null;

  endsAt?:
    Date | null;


    
  date:
    string;

  time:
    string;

  description?:
    string;

  status:
    ConsultationBookingStatus;

  createdAt?:
    Date;

  updatedAt?:
    Date;
}