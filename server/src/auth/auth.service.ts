import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as argon2 from 'argon2';
import { RegisterInput } from './dto';
import {
  PostgresErrorCode,
  PostgresUniqueContraint,
} from '../database/postgres-error-codes.enum';
import { JwtTokenPayload } from './interfaces';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerInput: RegisterInput) {
    const hashedPassword = await argon2.hash(registerInput.password);
    try {
      const createdUser = await this.usersService.create({
        ...registerInput,
        password: hashedPassword,
      });
      return createdUser;
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        if (error.message.includes(PostgresUniqueContraint.FirstColumn))
          throw new BadRequestException('Username already exists');
        if (error.message.includes(PostgresUniqueContraint.SecondColumn))
          throw new BadRequestException('Email already exists');
      }
      throw new InternalServerErrorException('Something went wrong');
    }
  }
  async validateLoginData(email: string, password: string) {
    try {
      const user = await this.usersService.getByEmail(email);
      await this.verifyPassword(password, user.password);
      return user;
    } catch (error) {
      throw new BadRequestException('Wrong email or password provided');
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await argon2.verify(
      hashedPassword,
      plainTextPassword,
    );
    if (!isPasswordMatching)
      throw new BadRequestException('Wrong password provided');
  }

  getJwtAccessCookie(userId: string) {
    const payload: JwtTokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: `${this.configService.get('JWT_ACCESS_EXPIRATION_TIME')}s`,
    });
    return `Access=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_ACCESS_EXPIRATION_TIME')}`;
  }

  getJwtRefreshCookie(userId: string) {
    const payload: JwtTokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: `${this.configService.get('JWT_REFRESH_EXPIRATION_TIME')}s`,
    });
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_REFRESH_EXPIRATION_TIME')}`;
    return {
      cookie,
      token,
    };
  }

  getLogoutCookies() {
    return [
      'Access=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ];
  }
}
