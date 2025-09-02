import { Module } from '@nestjs/common';
import { PetController } from '../pet/pet.controller';
import { BreedController } from '../breed/breed.controller';
import { MarketController } from '../market/market.controller';
import { ClanController } from '../clan/clan.controller';
import { DbService } from '../common/db.service';

@Module({
  imports: [],
  controllers: [PetController, BreedController, MarketController, ClanController],
  providers: [DbService],
})
export class AppModule {}

