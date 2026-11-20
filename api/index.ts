import type { IncomingMessage, ServerResponse } from 'node:http';
import app from '../server.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const rawUrl = req.url || '/';
    const urlObj = new URL(rawUrl, 'http://localhost');
    const apiPath = urlObj.searchParams.get('__api_path');

    if (apiPath !== null) {
      urlObj.searchParams.delete('__api_path');
      const qs = urlObj.searchParams.toString();
      const cleaned = apiPath.replace(/^\/+/, '');
      req.url = `/api${cleaned ? `/${cleaned}` : ''}${qs ? `?${qs}` : ''}`;
    } else if (
      urlObj.pathname === '/api' ||
      urlObj.pathname === '/api/' ||
      urlObj.pathname === '/api/index' ||
      urlObj.pathname === '/'
    ) {
      const qs = urlObj.searchParams.toString();
      req.url = `/api/health${qs ? `?${qs}` : ''}`;
    }

    return app(
      req as Parameters<typeof app>[0],
      res as Parameters<typeof app>[1]
    );
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(
      JSON.stringify({
        ok: false,
        error: 'SERVERLESS_HANDLER_ERROR',
        message: err instanceof Error ? err.message : 'Internal server error',
      })
    );
  }
}
