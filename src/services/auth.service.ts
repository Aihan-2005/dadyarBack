import bcrypt from "bcrypt";
import { LawyerRepository } from "../repositories/lawyer.repository";
import { TokenService } from "./token.service";
import { CreateLawyerInput, LoginDTO } from "../interfaces/lawyer.interface";
import { HttpException } from "../exceptions/httpException";
import { MESSAGES } from "../constants/messages";
import { env } from "../config/env";
const LANGUAGE = env.LANGUAGE;

export class AuthService {
  private readonly tokenService = new TokenService();
  constructor(private readonly repo: LawyerRepository) {}

  // ----------------------- helpers ------------------------------
  private normalizeEmail(email?: string) {
    return email?.trim().toLowerCase();
  }

  private normalizePhone(phone?: string) {
    return phone?.trim();
  }

  private getLoginIdentifier(input: LoginDTO) {
    const email = this.normalizeEmail(input.email);
    const phone = this.normalizePhone(input.phone);

    if (!email && !phone)
      throw new HttpException(400, MESSAGES.noEmailNorPhone[LANGUAGE]);

    return { email, phone };
  }

  private comparePassword(inputPassword: string, userPassword: string) {
    return bcrypt.compare(inputPassword, userPassword);
  }

  private hash(str: string) {
    return bcrypt.hash(str, 12);
  }

  private async handelLawyerExsist(input: CreateLawyerInput) {
    const email = this.normalizeEmail(input.email);
    const phone = input.phone?.trim();

    if (!email && !phone) {
      throw new HttpException(400, MESSAGES.noEmailNorPhone[LANGUAGE]);
    }

    if (email) {
      const emailExsist = await this.repo.findByEmail(email);
      if (emailExsist)
        throw new HttpException(400, MESSAGES.emailExsist[LANGUAGE]);
    }

    if (phone) {
      const phoneExsist = await this.repo.findByPhone(phone);
      if (phoneExsist)
        throw new HttpException(400, MESSAGES.phoneExsist[LANGUAGE]);
    }

    if (!input.barLicenseNumber) return;

    const barExsist = await this.repo.findByBarLicence(
      input.barLicenseNumber.trim(),
    );

    if (barExsist) throw new HttpException(400, MESSAGES.barExsist[LANGUAGE]);
  }

  private normalizeData(input: CreateLawyerInput, password: string) {
    return {
      name: input.name.trim(),
      lastname: input.lastname.trim(),
      email: this.normalizeEmail(input.email),
      phone: input.phone?.trim(),
      password,
      barLicenseNumber: input.barLicenseNumber?.trim(),
      address: {
        province: input.address?.province?.trim(),
        city: input.address?.city?.trim(),
        fullAddress: input.address?.fullAddress?.trim(),
      },
      yearsOfExperience: input.yearsOfExperience,
      website: input.website?.trim(),
      bio: input.bio?.trim(),
      workExperiences: input.workExperiences ?? [],
      skills: input.skills ?? [],
      languages: input.languages ?? [],
    };
  }

  // ----------------------- Core -------------------------------
  public async login(input: LoginDTO) {
    // await this.handelLawyerDontExsist(input)
    // const user = (await this.getUser(input))!
    // const hashedPassword = await this.getUserPassword(user._id)
    const { email, phone } = this.getLoginIdentifier(input);
    const authUser = email
      ? await this.repo.findAuthByEmail(email)
      : await this.repo.findAuthByPhone(phone!);

    if (!authUser)
      throw new HttpException(401, MESSAGES.noUserWithEmailOrPhone[LANGUAGE]);

    const checkPassword = await this.comparePassword(
      input.password,
      authUser.password,
    );

    if (!checkPassword) {
      const errorMessage = email
        ? MESSAGES.emailorPasswordWrong[LANGUAGE]
        : MESSAGES.phoneOrPasswordWrong[LANGUAGE];
      throw new HttpException(401, errorMessage);
    }

    const userId = authUser._id.toString();

    const accessToken = this.tokenService.generateAccessToken(userId);
    const refreshToken = await this.tokenService.generateRefreshToken(userId);

    // NOTE: remove password before returning user
    const { password, ...safeUser } = authUser;

    return { user: safeUser, accessToken, refreshToken };
  }

  public async signup(input: CreateLawyerInput) {
    await this.handelLawyerExsist(input);

    const hashedPassword = await this.hash(input.password);

    const created = await this.repo.create(
      this.normalizeData(input, hashedPassword),
    );

    const userId = created._id.toString();
    const accessToken = this.tokenService.generateAccessToken(userId);
    const refreshToken = await this.tokenService.generateRefreshToken(userId);
    return { user: created, accessToken, refreshToken };
    // return created
  }

  public refresh(refreshToken: string) {
    return this.tokenService.rotateRefreshToken(refreshToken);
  }

  public logout(refreshToken: string) {
    return this.tokenService.revokeRefreshToken(refreshToken);
  }
}
