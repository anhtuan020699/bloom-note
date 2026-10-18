import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { slugify } from '../common/slug';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] });
  }

  sanitize(body: any, fallbackId?: string) {
    const label = String(body?.label || '').trim().slice(0, 80);
    const id = slugify(body?.id || fallbackId || label);
    if (!label) throw new BadRequestException('Thiếu tên danh mục.');
    if (!id) throw new BadRequestException('ID danh mục không hợp lệ.');
    return {
      id,
      label,
      labelEn: String(body?.labelEn || '').trim().slice(0, 80),
      icon: String(body?.icon || 'gift').trim().slice(0, 40),
      sortOrder: Number.isInteger(body?.sortOrder) ? body.sortOrder : undefined,
    };
  }

  async create(body: any) {
    const data = this.sanitize(body);
    const exists = await this.prisma.category.findUnique({ where: { id: data.id } });
    if (exists) throw new ConflictException('Danh mục đã tồn tại.');
    const max = await this.prisma.category.aggregate({ _max: { sortOrder: true } });
    const sortOrder = Number.isInteger(data.sortOrder) ? data.sortOrder : (max._max.sortOrder ?? -1) + 1;
    return this.prisma.category.create({
      data: { ...data, sortOrder },
    });
  }

  async update(id: string, body: any) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Không tìm thấy danh mục.');
    const data = this.sanitize({ ...existing, ...body, id: existing.id }, existing.id);
    const max = await this.prisma.category.aggregate({ _max: { sortOrder: true } });
    const sortOrder = Number.isInteger(data.sortOrder) ? data.sortOrder : (max._max.sortOrder ?? -1) + 1;
    return this.prisma.category.update({
      where: { id: existing.id },
      data: { ...data, id: existing.id, sortOrder },
    });
  }

  async remove(id: string) {
    if (id === 'all') throw new BadRequestException('Không xoá được tab “Tất cả”.');
    const templates = await this.prisma.template.findMany();
    const used = templates.some((t: any) => t.payload?.category === id);
    if (used) throw new BadRequestException('Còn mẫu thiệp trong danh mục này.');
    try {
      await this.prisma.category.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Không tìm thấy danh mục.');
    }
    return { ok: true };
  }
}
