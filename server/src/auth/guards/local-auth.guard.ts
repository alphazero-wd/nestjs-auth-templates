import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { MyContext } from '../interfaces';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const gqlReq = ctx.getContext<MyContext>().req;
    const {
      loginInput: { email, password },
    } = ctx.getArgs();
    gqlReq.body.email = email;
    gqlReq.body.password = password;
    return gqlReq;
  }
}
