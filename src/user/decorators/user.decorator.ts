import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const User = createParamDecorator((data: any, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;
  if (!user) {
    return null;
  }
  return data ? user?.[data] : user;
});
