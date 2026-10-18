import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaService } from '../prisma/prisma.service';

const scrypt = promisify(scryptCb);
const TTL_MS = 12 * 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  tokenFrom(req: { headers: Record<string, string | string[] | undefined> }) {
    const header = String(req.headers.authorization || '');
    if (header.startsWith('Bearer ')) return header.slice(7).trim();
    return String(req.headers['x-admin-token'] || '');
  }

  async hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const buf = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}:${buf.toString('hex')}`;
  }

  async verifyPassword(password: string, stored: string) {
    const [salt, hash] = String(stored || '').split(':');
    if (!salt || !hash) return false;
    const actual = (await scrypt(password, salt, 64)) as Buffer;
    const expected = Buffer.from(hash, 'hex');
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  }

  async login(username: string, password: string) {
    const name = String(username || '').trim().toLowerCase();
    const pass = String(password || '');
    if (!name || !pass) throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu.');
    const user = await this.prisma.adminUser.findUnique({ where: { username: name } });
    if (!user || !(await this.verifyPassword(pass, user.passwordHash))) {
      throw new UnauthorizedException('Sai tài khoản hoặc mật khẩu.');
    }
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + TTL_MS);
    await this.prisma.adminSession.create({
      data: { id: crypto.randomUUID(), token, userId: user.id, expiresAt },
    });
    await this.prisma.adminSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    return {
      token,
      expiresIn: TTL_MS,
      user: { id: user.id, username: user.username },
    };
  }

  async getSession(token: string) {
    if (!token) return null;
    const session = await this.prisma.adminSession.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!session) return null;
    if (session.expiresAt.getTime() < Date.now()) {
      await this.prisma.adminSession.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }
    return session;
  }

  async logout(token: string) {
    if (!token) return;
    await this.prisma.adminSession.deleteMany({ where: { token } });
  }
}
