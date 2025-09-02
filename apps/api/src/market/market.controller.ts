import { Body, Controller, Post } from '@nestjs/common';

@Controller('market')
export class MarketController {
  @Post('list')
  async list(@Body() body: { addr: string; market: 'getgems' | 'disintar' | string }) {
    // Return deeplink for external marketplace; client will open via TonConnect/in-app browser
    const { addr, market } = body;
    let url = '';
    switch (market) {
      case 'getgems':
        url = `https://getgems.io/nft/${encodeURIComponent(addr)}`;
        break;
      case 'disintar':
        url = `https://disintar.io/nft/${encodeURIComponent(addr)}`;
        break;
      default:
        url = `https://getgems.io/nft/${encodeURIComponent(addr)}`;
    }
    return { deeplink: url };
  }
}

