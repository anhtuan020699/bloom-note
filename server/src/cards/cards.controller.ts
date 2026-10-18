import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CardsService } from './cards.service';

@Controller('cards')
export class CardsController {
  constructor(private cards: CardsService) {}

  @Get()
  list(@Query('q') q?: string) {
    return this.cards.list(q);
  }

  @Get(':key')
  get(@Param('key') key: string, @Query('view') view?: string) {
    return this.cards.get(key, view === '1');
  }

  @Post()
  create(@Body() body: any) {
    return this.cards.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.cards.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cards.remove(id);
  }
}
