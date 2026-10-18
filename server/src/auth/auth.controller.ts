import { Body, Controller, Get, HttpCode, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { TEMPLATES } from '../common/templates';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('admin')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() body: { username?: string; password?: string }) {
    return this.auth.login(body?.username, body?.password);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: any) {
    await this.auth.logout(this.auth.tokenFrom(req));
    return { ok: true };
  }

  @Get('session')
  async session(@Req() req: any) {
    const session = await this.auth.getSession(this.auth.tokenFrom(req));
    if (!session) throw new UnauthorizedException('Cần đăng nhập admin.');
    return {
      ok: true,
      db: 'prisma',
      expiresIn: Math.max(0, session.expiresAt.getTime() - Date.now()),
      user: { id: session.user.id, username: session.user.username },
    };
  }

  @Get('options')
  @UseGuards(AuthGuard)
  options() {
    return {
      scenes: [...new Set(TEMPLATES.map((t) => t.scene3d).filter(Boolean))],
      flowerTypes: [...new Set(TEMPLATES.map((t) => t.flowerType).filter(Boolean))],
      ribbons: ['super-hot', 'hot', 'new', ''],
      icons: ['layout-grid', 'heart', 'sparkles', 'calendar-heart', 'gift', 'cake'],
    };
  }
}
