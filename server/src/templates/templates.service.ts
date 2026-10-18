import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { slugify } from '../common/slug';
import { TEMPLATES } from '../common/templates';
import { PrismaService } from '../prisma/prisma.service';

const RIBBONS = ['super-hot', 'hot', 'new', ''];
const SCENE_IDS = [...new Set(TEMPLATES.map((t) => t.scene3d).filter(Boolean))];
const FLOWER_TYPES = [...new Set(TEMPLATES.map((t) => t.flowerType).filter(Boolean))];

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async list() {
    const rows = await this.prisma.template.findMany({ orderBy: { id: 'asc' } });
    return rows.map((r) => r.payload);
  }

  async get(id: string) {
    const row = await this.prisma.template.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Không tìm thấy mẫu.');
    return row.payload;
  }

  sanitizePatch(body: any) {
    const patch: any = {};
    if (body.name != null) patch.name = String(body.name).trim().slice(0, 80);
    if (body.category != null) patch.category = slugify(body.category).slice(0, 40);
    if (body.description != null) patch.description = String(body.description).trim().slice(0, 400);
    if (body.tagText != null) patch.tagText = String(body.tagText).trim().slice(0, 80);
    if (body.badge3d != null) patch.badge3d = String(body.badge3d).trim().slice(0, 80);
    if (body.ribbonText != null) patch.ribbonText = String(body.ribbonText).trim().slice(0, 40);
    if (body.ribbon != null) patch.ribbon = RIBBONS.includes(body.ribbon) ? body.ribbon : '';
    if (body.createdCount != null) patch.createdCount = String(body.createdCount).trim().slice(0, 20);
    if (body.scene3d != null && (SCENE_IDS.includes(body.scene3d) || body.scene3d === '')) {
      patch.scene3d = body.scene3d;
    }
    if (body.flowerType != null && FLOWER_TYPES.includes(body.flowerType)) {
      patch.flowerType = body.flowerType;
    }
    if (body.defaultMusicId != null) patch.defaultMusicId = String(body.defaultMusicId).trim().slice(0, 60);
    if (body.dark != null) patch.dark = Boolean(body.dark);
    if (body.themeColors && typeof body.themeColors === 'object') {
      const colors: any = {};
      for (const key of ['bgGradient', 'primary', 'secondary', 'accent', 'cardBg', 'textColor', 'center']) {
        if (typeof body.themeColors[key] === 'string') colors[key] = body.themeColors[key].slice(0, 240);
      }
      if (Array.isArray(body.themeColors.petals)) {
        colors.petals = body.themeColors.petals.map((c) => String(c).slice(0, 40)).slice(0, 8);
      }
      patch.themeColors = colors;
    }
    return patch;
  }

  async create(body: any) {
    const name = String(body?.name || '').trim().slice(0, 80);
    if (!name) throw new BadRequestException('Thiếu tên mẫu.');
    const id = slugify(body?.id || name);
    if (await this.prisma.template.findUnique({ where: { id } })) {
      throw new ConflictException('Mẫu đã tồn tại.');
    }
    const source: any = (body?.cloneFrom && (await this.prisma.template.findUnique({ where: { id: body.cloneFrom } }))?.payload)
      || (await this.prisma.template.findFirst({ orderBy: { id: 'asc' } }))?.payload
      || TEMPLATES[0];
    if (!source) throw new BadRequestException('Chưa có mẫu để nhân bản.');
    const patch = this.sanitizePatch(body);
    const created = { ...source, ...patch, id, name, category: patch.category || source.category };
    await this.prisma.template.create({ data: { id, payload: created } });
    return created;
  }

  async update(id: string, body: any) {
    const existing: any = await this.get(id);
    const patch = this.sanitizePatch(body);
    const next = {
      ...existing,
      ...patch,
      id: existing.id,
      themeColors: { ...(existing as any).themeColors, ...(patch.themeColors || {}) },
    };
    await this.prisma.template.update({ where: { id }, data: { payload: next } });
    return next;
  }

  async remove(id: string) {
    await this.get(id);
    const used = await this.prisma.card.findFirst({ where: { templateId: id } });
    if (used) throw new BadRequestException('Còn thiệp đang dùng mẫu này.');
    await this.prisma.template.delete({ where: { id } });
    return { ok: true };
  }
}
