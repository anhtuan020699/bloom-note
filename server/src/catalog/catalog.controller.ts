import { Controller, Get } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller()
export class CatalogController {
  constructor(private catalog: CatalogService) {}

  @Get('health')
  health() {
    return this.catalog.health();
  }

  @Get('meta')
  meta() {
    return this.catalog.meta();
  }

  @Get('catalog')
  catalogAll() {
    return this.catalog.catalog();
  }

  @Get('music')
  music() {
    return this.catalog.listMusic();
  }
}
