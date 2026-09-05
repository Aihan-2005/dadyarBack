import bcrypt from "bcrypt";

export class PasswordUtils {
  constructor(private readonly PASSWORD_SALT_ROUNDS: number = 12) {}
  public hashPassword(password: string) {
    return bcrypt.hash(password, this.PASSWORD_SALT_ROUNDS);
  }

  public comparePassword(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
