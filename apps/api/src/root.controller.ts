import { Controller, Get, Header, HttpCode } from '@nestjs/common';

@Controller()
export class RootController {
	// Root now served by static files if present
	@Get('/')
	@Header('content-type', 'text/html; charset=utf-8')
	root() {
		return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>TONоготчи</title><style>html,body{background:#0f1720;color:#f5f5f5;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;margin:0;padding:0;display:flex;align-items:center;justify-content:center;height:100vh}a{color:#6ab3f3}</style></head><body><div><h1>TONоготчи</h1><p>Static game bundle not found. Visit <a href="/api">/api</a>.</p></div></body></html>`;
	}

	@Get('/favicon.ico')
	@HttpCode(204)
	favicon() {
		return '';
	}
}