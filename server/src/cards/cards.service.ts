import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes, randomUUID } from 'node:crypto';
import { rm } from 'node:fs';
import { join, normalize } from 'node:path';
import { PHOTO_FRAMES } from '../common/templates';
import { slugify } from '../common/slug';
import { PrismaService } from '../prisma/prisma.service';

const LIMITS = { recipientName: 80, senderName: 80, message: 3000, photoCaption: 120, photoUrl: 2048 };
const FRAME_IDS = PHOTO_FRAMES.map((f) => f.id);

function parseCard(row: any) {
  if (!row) return null;
  const musicConfig = typeof row.musicConfig === 'string'
    ? JSON.parse(row.musicConfig || '{}')
    : (row.musicConfig || {});
  return { ...row, musicConfig };
}

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async list(q?: string) {
    let cards = (await this.prisma.card.findMany({ orderBy: { createdAt: 'desc' } })).map(parseCard);
    if (q) {
      const needle = slugify(q).replace(/-/g, ' ');
      cards = cards.filter((c) => slugify(c.recipientName).replace(/-/g, ' ').includes(needle));
    }
    return cards;
  }

  async get(key: string, countView = false) {
    const row = await this.prisma.card.findFirst({
      where: { OR: [{ id: key }, { slug: key }] },
    });
    if (!row) throw new NotFoundException('Không tìm thấy thiệp.');
    if (countView) {
      await this.prisma.card.update({ where: { id: row.id }, data: { views: { increment: 1 } } });
      row.views += 1;
    }
    return parseCard(row);
  }

  async uniqueSlug(name: string) {
    const base = slugify(name);
    let slug = '';
    do {
      slug = `${base}-${randomBytes(3).toString('hex')}`;
    } while (await this.prisma.card.findUnique({ where: { slug } }));
    return slug;
  }

  async sanitize(body: any) {
    const errors = [];
    const str = (key: string) => String(body[key] ?? '').trim().slice(0, LIMITS[key]);
    const templates = (await this.prisma.template.findMany()).map((r) => r.payload as any);
    const music = (await this.prisma.musicTrack.findMany()).map((r) => r.payload as any);
    const templateIds = templates.map((t) => t.id);
    const musicIds = music.map((m) => m.id);

    const recipientName = str('recipientName');
    if (!recipientName) errors.push('Vui lòng nhập tên người nhận.');

    const templateId = templateIds.includes(body.templateId) ? body.templateId : templates[0]?.id;
    if (!templateId) errors.push('Chưa có mẫu thiệp trên server.');
    const photoFrameStyle = FRAME_IDS.includes(body.photoFrameStyle) ? body.photoFrameStyle : 'polaroid';

    const photoUrl = str('photoUrl');
    if (photoUrl && !/^(https?:\/\/|\/uploads\/|\/stickers\/)/i.test(photoUrl)) {
      errors.push('Link ảnh không hợp lệ.');
    }

    const m = body.musicConfig || {};
    let musicConfig;
    if (m.source === 'upload' || m.source === 'url') {
      const url = String(m.url || '').trim().slice(0, 2048);
      if (!/^(https?:\/\/|\/uploads\/)/i.test(url)) errors.push('Link nhạc không hợp lệ.');
      musicConfig = { source: m.source, url, title: String(m.title || '').slice(0, 120) };
    } else if (m.source === 'none') {
      musicConfig = { source: 'none' };
    } else {
      musicConfig = { source: 'library', trackId: musicIds.includes(m.trackId) ? m.trackId : musicIds[0] };
    }

    if (errors.length) throw new BadRequestException(errors.join(' '));
    return {
      templateId,
      recipientName,
      senderName: str('senderName'),
      message: str('message'),
      photoUrl,
      photoFrameStyle,
      photoCaption: str('photoCaption'),
      musicConfig,
    };
  }

  async create(body: any) {
    const data = await this.sanitize(body || {});
    const now = new Date().toISOString();
    const row = await this.prisma.card.create({
      data: {
        id: randomUUID(),
        slug: await this.uniqueSlug(data.recipientName),
        ...data,
        views: 0,
        createdAt: now,
        updatedAt: now,
      },
    });
    return parseCard(row);
  }

  async update(id: string, body: any) {
    const existing = await this.get(id);
    const data = await this.sanitize(body || {});
    const row = await this.prisma.card.update({
      where: { id: existing.id },
      data: { ...existing, ...data, id: existing.id, updatedAt: new Date().toISOString() },
    });
    return parseCard(row);
  }

  async remove(id: string) {
    const existing = await this.get(id);
    await this.prisma.card.delete({ where: { id: existing.id } });
    const uploadDir = join(process.cwd(), 'uploads');
    for (const url of [existing.photoUrl, existing.musicConfig?.url]) {
      if (url?.startsWith('/uploads/')) {
        const file = join(uploadDir, normalize(url.replace('/uploads/', '')));
        if (file.startsWith(uploadDir)) rm(file, { force: true }, () => {});
      }
    }
    return { ok: true };
  }
}
