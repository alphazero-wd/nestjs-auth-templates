import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities';
import { CreateUserInput } from './dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getByEmail(email: string) {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user) return user;

    throw new NotFoundException('User with this email does not exist');
  }

  async create(createUserInput: CreateUserInput) {
    const newUser = this.usersRepository.create(createUserInput);
    await this.usersRepository.save(newUser);
    return newUser;
  }

  async setRefreshToken(refreshToken: string, userId: string) {
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.usersRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getById(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (user) return user;

    throw new NotFoundException('User with this id does not exist');
  }

  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.getById(userId);
    await this.verifyRefreshTokens(refreshToken, user.refreshToken);
    return user;
  }

  private async verifyRefreshTokens(
    refreshToken: string,
    hashedRefreshToken: string,
  ) {
    const isRefreshTokenMatching = await argon2.verify(
      hashedRefreshToken,
      refreshToken,
    );
    if (!isRefreshTokenMatching)
      throw new UnauthorizedException('Invalid refresh token');
  }

  async removeRefreshToken(userId: string) {
    return this.usersRepository.update(userId, {
      refreshToken: null,
    });
  }
}
