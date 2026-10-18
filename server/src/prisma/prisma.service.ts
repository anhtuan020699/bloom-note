import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
      throw new Error('Thiếu DATABASE_URL. BE bắt buộc dùng Postgres.');
    }
    await this.$connect();
    console.log('[db] Prisma + Postgres sẵn sàng.');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
