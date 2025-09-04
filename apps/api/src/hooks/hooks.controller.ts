import { Body, Controller, Post } from '@nestjs/common';

@Controller('hooks')
export class HooksController {
  @Post('render')
  async renderHook(@Body() body: any) {
    // TODO: verify source and correlate jobId to mint flow
    console.log('Render hook', body);
    return { ok: true };
  }
}

