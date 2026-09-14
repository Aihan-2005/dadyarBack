export interface AdminCreateLawyerInput {

  firstName: string;

  lastName: string;

  phone?: string;

  email?: string;

  password: string;

  specialization?: string;

  licenseNumber?: string;

  yearsOfExperience?: number;

  address?: string;

  bio?: string;

  skills?: string[];

  languages?: string[];

}