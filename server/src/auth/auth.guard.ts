import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const session = await this.auth.getSession(this.auth.tokenFrom(req));
    if (!session) throw new UnauthorizedException('Cần đăng nhập admin.');
    req.admin = { id: session.user.id, username: session.user.username };
    return true;
  }
}
