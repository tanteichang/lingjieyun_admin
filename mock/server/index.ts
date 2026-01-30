import type { IncomingMessage, ServerResponse } from 'node:http';
import { createServer } from 'node:http';

import Mock from 'mockjs';

import { projectListHandler } from './project/list.js';

const preferredPort = Number(process.env.MOCK_PORT) || 8005;

type RouteHandler = (req: IncomingMessage, res: ServerResponse, params: URLSearchParams) => void;

const applyCors = (req: IncomingMessage, res: ServerResponse) => {
  console.log('req.headers.origin', req.headers.origin);
  const origin = req.headers.origin || 'http://localhost:5173';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    req.headers['access-control-request-headers'] || 'Content-Type, Authorization',
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Max-Age', '86400');
};

const sendJson = (res: ServerResponse, payload: unknown) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

const buildTaskList: RouteHandler = (_req, res, params) => {
  const page = Number(params.get('page') || 1);
  const limit = Number(params.get('limit') || 10);
  const status = params.get('status');
  const list = Mock.mock({
    [`rows|${limit}`]: [
      {
        'id|+1': 1 + (page - 1) * limit,
        code: 'X048@natural(0,99)',
        name: '@cword(3,6)开发',
        type: '软件开发工程',
        project: '灵捷云服务平台APP项目',
        recruitType: '@pick([\"定向招募\",\"自由招募\"])',
        taskPeriod: '2025.12.28-2026.02.15',
        status: status || '@pick([\"processing\",\"paused\",\"completed\",\"terminated\",\"draft\"])',
        'requiredPeople|1': [6, 8, 10],
        'memberCount|1': [2, 4, 6],
      },
    ],
  }).rows;

  sendJson(res, { code: 0, data: { list, total: 100 } });
};

const buildMemberList: RouteHandler = (_req, res, params) => {
  const page = Number(params.get('page') || 1);
  const limit = Number(params.get('limit') || 10);
  const list = Mock.mock({
    [`rows|${limit}`]: [
      {
        'id|+1': 1 + (page - 1) * limit,
        name: '@cname',
        phone: /1[3-9]\\d{9}/,
        taskCode: 'X0487',
        taskName: '安卓开发',
        taskType: '软件开发工程',
        'channel|1': ['定向招募', '自由招募'],
        'realNameStatus|1': ['pending', 'signed'],
        'contractStatus|1': ['pending', 'processing', 'signed'],
        joinTime: '@date(\"yyyy.MM.dd\") @time(\"HH:mm\")',
      },
    ],
  }).rows;

  sendJson(res, { code: 0, data: { list, total: 60 } });
};

const buildLogList: RouteHandler = (_req, res, params) => {
  const page = Number(params.get('page') || 1);
  const limit = Number(params.get('limit') || 10);
  const list = Mock.mock({
    [`rows|${limit}`]: [
      {
        'id|+1': 1 + (page - 1) * limit,
        operator: '@cname',
        action: '@csentence(4, 8)',
        operateTime: '@datetime(\"yyyy-MM-dd HH:mm:ss\")',
      },
    ],
  }).rows;

  sendJson(res, { code: 0, data: { list, total: 30 } });
};

const routes: Record<string, RouteHandler> = {
  'GET:/api/project/list': (req, res, params) => projectListHandler(req, res, params),
  'GET:/project/task/list': buildTaskList,
  'GET:/project/member/list': buildMemberList,
  'GET:/project/log/list': buildLogList,
};

const server = createServer((req, res) => {
  if (!req.url || !req.method) {
    res.statusCode = 400;
    res.end();
    return;
  }
  applyCors(req, res);
  if (req.method.toUpperCase() === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const handler = routes[`${req.method.toUpperCase()}:${pathname}`];
  if (handler) {
    handler(req, res, searchParams);
  } else {
    res.statusCode = 404;
    res.end();
  }
});

const startServer = (port: number) => {
  server.listen(port, () => {
    const address = server.address();
    const listenPort = typeof address === 'object' && address ? address.port : port;
    console.log(`Mock server running at http://localhost:${listenPort}`);
  });
};

startServer(preferredPort);
