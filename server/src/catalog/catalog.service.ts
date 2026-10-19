import { Injectable, OnModuleInit } from '@nestjs/common';
import { networkInterfaces } from 'node:os';
import { CATEGORIES, MUSIC_LIBRARY, PHOTO_FRAMES, TEMPLATES } from '../common/templates';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedCatalog();
  }

  async seedCatalog() {
    for (const [i, c] of CATEGORIES.entries()) {
      await this.prisma.category.upsert({
        where: { id: c.id },
        create: {
          id: c.id,
          label: c.label,
          labelEn: c.labelEn || '',
          icon: c.icon || 'gift',
          sortOrder: i,
        },
        update: {},
      });
    }
    for (const t of TEMPLATES) {
      await this.prisma.template.upsert({
        where: { id: t.id },
        create: { id: t.id, payload: t },
        update: { payload: t },
      });
    }
    for (const m of MUSIC_LIBRARY) {
      await this.prisma.musicTrack.upsert({
        where: { id: m.id },
        create: { id: m.id, payload: m },
        update: {},
      });
    }
  }

  async health() {
    const [categories, templates, cards] = await Promise.all([
      this.prisma.category.count(),
      this.prisma.template.count(),
      this.prisma.card.count(),
    ]);
    return { ok: true, db: 'prisma', categories, templates, cards };
  }

  meta() {
    let lanAddresses = [];
    try {
      lanAddresses = Object.values(networkInterfaces())
        .flat()
        .filter((i) => i && i.family === 'IPv4' && !i.internal)
        .map((i) => i.address);
    } catch { /* ignore */ }
    return { db: 'prisma', lanAddresses, publicBaseUrl: process.env.PUBLIC_BASE_URL || null };
  }

  async catalog() {
    const [categories, templates, music] = await Promise.all([
      this.prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] }),
      this.prisma.template.findMany({ orderBy: { id: 'asc' } }),
      this.prisma.musicTrack.findMany({ orderBy: { id: 'asc' } }),
    ]);
    return {
      categories,
      templates: templates.map((r) => r.payload),
      music: music.map((r) => r.payload),
      frames: PHOTO_FRAMES,
      db: 'prisma',
    };
  }

  async listMusic() {
    const rows = await this.prisma.musicTrack.findMany({ orderBy: { id: 'asc' } });
    return rows.map((r) => r.payload);
  }
}
