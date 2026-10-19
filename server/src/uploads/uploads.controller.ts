import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { diskStorage } from 'multer';

const PHOTO_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const MUSIC_EXT = new Set(['.mp3', '.wav', '.m4a']);

function uploadOptions(subdir: string, allowed: Set<string>, maxBytes: number) {
  const destination = join(process.cwd(), 'uploads', subdir);
  mkdirSync(destination, { recursive: true });
  return {
    storage: diskStorage({
      destination,
      filename: (_req, file, cb) => {
        const ext = extname(file.originalname || '').toLowerCase();
        cb(null, `${randomUUID()}${ext}`);
      },
    }),
    limits: { fileSize: maxBytes },
    fileFilter: (_req, file, cb) => {
      const ext = extname(file.originalname || '').toLowerCase();
      if (!allowed.has(ext)) {
        cb(new Error('Định dạng không được hỗ trợ.'), false);
        return;
      }
      cb(null, true);
    },
  };
}

@Controller('upload')
export class UploadsController {
  @Post('photo')
  @UseInterceptors(FileInterceptor('file', uploadOptions('photos', PHOTO_EXT, 8 * 1024 * 1024)))
  photo(@UploadedFile() file?: { filename: string; originalname: string }) {
    if (!file) throw new BadRequestException('Chưa chọn file.');
    return { url: `/uploads/photos/${file.filename}`, name: file.originalname };
  }

  @Post('music')
  @UseInterceptors(FileInterceptor('file', uploadOptions('music', MUSIC_EXT, 15 * 1024 * 1024)))
  music(@UploadedFile() file?: { filename: string; originalname: string }) {
    if (!file) throw new BadRequestException('Chưa chọn file.');
    return { url: `/uploads/music/${file.filename}`, name: file.originalname };
  }
}
