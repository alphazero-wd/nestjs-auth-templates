import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from '../users/entities';
import { MyContext } from './interfaces';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, JwtRefreshGuard, LocalAuthGuard } from './guards';
import { LoginInput, RegisterInput } from './dto';
import { UsersService } from '../users/users.service';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => User)
  async register(@Args('registerInput') registerInput: RegisterInput) {
    const newUser = await this.authService.register(registerInput);
    return newUser;
  }

  @UseGuards(LocalAuthGuard)
  @Mutation(() => User)
  async login(
    @Args('loginInput') _: LoginInput,
    @Context() { req }: MyContext,
  ) {
    const accessCookie = this.authService.getJwtAccessCookie(req.user.id);
    const { token: refreshToken, cookie: refreshCookie } =
      this.authService.getJwtRefreshCookie(req.user.id);

    await this.usersService.setRefreshToken(refreshToken, req.user.id);

    req.res.setHeader('Set-Cookie', [accessCookie, refreshCookie]);
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  me(@Context() { req }: MyContext) {
    return req.user;
  }

  @UseGuards(JwtRefreshGuard)
  @Mutation(() => User)
  refresh(@Context() { req }: MyContext) {
    const accessTokenCookie = this.authService.getJwtAccessCookie(req.user.id);
    req.res.setHeader('Set-Cookie', accessTokenCookie);
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async logout(@Context() { req }: MyContext) {
    await this.usersService.removeRefreshToken(req.user.id);
    req.res.setHeader('Set-Cookie', this.authService.getLogoutCookies());
    return true;
  }
}
