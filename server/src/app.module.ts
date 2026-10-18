import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CardsModule } from './cards/cards.module';
import { CatalogModule } from './catalog/catalog.module';
import { CategoriesModule } from './categories/categories.module';
import { PrismaModule } from './prisma/prisma.module';
import { TemplatesModule } from './templates/templates.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CatalogModule,
    CategoriesModule,
    TemplatesModule,
    CardsModule,
    UploadsModule,
  ],
})
export class AppModule {}
