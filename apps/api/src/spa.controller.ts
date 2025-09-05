import { Controller, Get, Header, Req } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
type Request = { path: string };

@Controller()
export class SpaController {
	@Get('*')
	@Header('content-type', 'text/html; charset=utf-8')
	serve(@Req() req: Request) {
		if (req.path.startsWith('/api')) return '' as any;
		const indexPath = join(__dirname, '..', 'public', 'index.html');
		if (existsSync(indexPath)) {
			return createReadStream(indexPath) as any;
		}
		return '<!doctype html><html><body><h3>Static game bundle not found. Visit <a href=\"/api\">/api</a>.</h3></body></html>';
	}
}