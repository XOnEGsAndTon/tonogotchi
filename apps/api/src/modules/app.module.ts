import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PetController } from '../pet/pet.controller';
import { BreedController } from '../breed/breed.controller';
import { MarketController } from '../market/market.controller';
import { ClanController } from '../clan/clan.controller';
import { DbService } from '../common/db.service';
import { GamesController } from '../games/games.controller';
import { HooksController } from '../hooks/hooks.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      exclude: ['/api*'],
    }),
  ],
  controllers: [PetController, BreedController, MarketController, ClanController, GamesController, HooksController],
  providers: [DbService],
})
export class AppModule {}
