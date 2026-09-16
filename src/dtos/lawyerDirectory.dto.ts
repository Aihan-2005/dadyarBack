import type {
  Education,
  LawyerRecord,
  WorkExperience,
} from "../interfaces/lawyer.interface";

import type {
  UserRecord,
} from "../interfaces/user.interface";


export interface ClientLawyerPlacementDTO {
  lawyerId:
    string;

  isFeatured:
    boolean;

  displayOrder:
    number;

  addedAt:
    | string
    | null;
}


export interface LawyerDirectoryEducationDTO {
  id:
    string;

  degree:
    string;

  field:
    string;

  university:
    string;

  year:
    string;
}


export interface LawyerDirectoryExperienceDTO {
  id:
    string;

  title:
    string;

  company:
    string;

  startYear:
    string;

  endYear:
    string;

  description:
    string;
}


export interface LawyerDirectoryDTO {
  id:
    string;

  firstName:
    string;

  lastName:
    string;

  fullName:
    string;

  phone:
    | string
    | null;

  email:
    | string
    | null;

  specialization:
    string;

  licenseNumber:
    string;

  yearsOfExperience:
    number;

  website:
    | string
    | null;

  address:
    string;

  bio:
    string;

  education:
    LawyerDirectoryEducationDTO[];

  experience:
    LawyerDirectoryExperienceDTO[];

  skills:
    string[];

  languages:
    string[];

  isFeatured:
    boolean;

  displayOrder:
    number;

  publishedAt:
    | string
    | null;
}


function toISOString(
  value:
    unknown,
): string | null {
  if (
    value instanceof
    Date
  ) {
    return value.toISOString();
  }


  if (
    typeof value ===
    "string"
  ) {
    const date =
      new Date(
        value,
      );


    if (
      !Number.isNaN(
        date.getTime(),
      )
    ) {
      return date.toISOString();
    }
  }


  return null;
}


function mapEducation(
  item:
    Education,
): LawyerDirectoryEducationDTO {
  return {
    id:
      item._id?.toString() ??
      "",

    degree:
      item.degree ??
      "",

    field:
      item.field ??
      "",

    university:
      item.university ??
      "",

    year:
      item.year ??
      "",
  };
}


function mapExperience(
  item:
    WorkExperience,
): LawyerDirectoryExperienceDTO {
  return {
    id:
      item._id?.toString() ??
      "",

    title:
      item.title,

    company:
      item.company,

    startYear:
      item.startYear,

    endYear:
      item.endYear,

    description:
      item.description ??
      "",
  };
}


export function toClientLawyerPlacementDTO(
  lawyer:
    LawyerRecord,
): ClientLawyerPlacementDTO {
  return {
    lawyerId:
      lawyer._id.toString(),

    isFeatured:
      lawyer.clientDirectory
        ?.isFeatured ??
      false,

    displayOrder:
      lawyer.clientDirectory
        ?.displayOrder ??
      0,

    addedAt:
      toISOString(
        lawyer.clientDirectory
          ?.publishedAt,
      ),
  };
}


export function toLawyerDirectoryDTO(
  lawyer:
    LawyerRecord,

  user:
    UserRecord,
): LawyerDirectoryDTO {
  return {
    id:
      lawyer._id.toString(),

    firstName:
      lawyer.firstName,

    lastName:
      lawyer.lastName,

    fullName:
      `${lawyer.firstName} ${lawyer.lastName}`.trim(),

    /*
     * فقط شماره عمومی پروفایل.
     * شماره login حساب هیچ‌وقت expose نمی‌شود.
     */
    phone:
      lawyer.contactPhone ??
      null,

    email:
      user.email ??
      null,

    specialization:
      lawyer.specialization ??
      "",

    licenseNumber:
      lawyer.licenseNumber ??
      "",

    yearsOfExperience:
      lawyer.yearsOfExperience ??
      0,

    website:
      lawyer.website ??
      null,

    address:
      lawyer.address ??
      "",

    bio:
      lawyer.bio ??
      "",

    education:
      (
        lawyer.education ??
        []
      ).map(
        mapEducation,
      ),

    experience:
      (
        lawyer.experience ??
        []
      ).map(
        mapExperience,
      ),

    skills:
      (
        lawyer.skills ??
        []
      ).map(
        (
          skill,
        ) =>
          skill.name,
      ),

    languages: [
      ...(
        lawyer.languages ??
        []
      ),
    ],

    isFeatured:
      lawyer.clientDirectory
        ?.isFeatured ??
      false,

    displayOrder:
      lawyer.clientDirectory
        ?.displayOrder ??
      0,

    publishedAt:
      toISOString(
        lawyer.clientDirectory
          ?.publishedAt,
      ),
  };
}

