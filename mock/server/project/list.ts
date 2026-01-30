import type { IncomingMessage, ServerResponse } from 'node:http';

import Mock from 'mockjs';

const sendJson = (res: ServerResponse, payload: unknown) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

type ProjectStatus = 'in_progress' | 'paused' | 'terminated' | 'completed';

interface ProjectItem {
  id: string;
  projectCode: string;
  projectName: string;
  invoiceType: string;
  enterprise: {
    id: string;
    name: string;
  };
  projectTime: {
    startTime: string;
    endTime: string;
  };
  taskCount: number;
  status: ProjectStatus;
  statusName?: string;
  personnelCount: number;
  extInfo?: {
    creator: string;
    createTime: string;
    contractAmount: number;
  };
}

const statusMap: Record<ProjectStatus, string> = {
  in_progress: '进行中',
  paused: '已暂停',
  completed: '已完成',
  terminated: '已终止',
};

const mockProject = (startId: number, count: number): ProjectItem[] => {
  const statusList: ProjectStatus[] = ['in_progress', 'paused', 'completed', 'terminated'];
  return Array.from({ length: count }, (_v, idx) => {
    const status = Mock.mock(`@pick(${JSON.stringify(statusList)})`) as ProjectStatus;
    return {
      id: `${startId + idx}`,
      projectCode: `XM${Mock.mock('@natural(100,999)')}`,
      projectName: Mock.mock('@ctitle(5,12)'),
      invoiceType: Mock.mock('@pick(["资讯服务费","软件服务费"])'),
      enterprise: {
        id: Mock.mock('@guid'),
        name: `${Mock.mock('@ctitle(6,10)')}有限公司`,
      },
      projectTime: {
        startTime: Mock.mock('@date("yyyy-MM-dd")'),
        endTime: Mock.mock('@date("yyyy-MM-dd")'),
      },
      taskCount: Mock.mock('@natural(1,10)'),
      status,
      statusName: statusMap[status],
      personnelCount: Mock.mock('@natural(1,10)'),
      extInfo: {
        creator: Mock.mock('@cname'),
        createTime: Mock.mock('@datetime("yyyy-MM-dd HH:mm:ss")'),
        contractAmount: Mock.mock('@natural(10,200)000'),
      },
    };
  });
};

export const projectListHandler = (_req: IncomingMessage, res: ServerResponse, query: URLSearchParams) => {
  const page = Number(query.get('page') || 1);
  const limit = Number(query.get('limit') || 10);
  const list = mockProject((page - 1) * limit + 1, limit);
  const total = 57;

  sendJson(res, {
    code: 0,
    msg: 'success',
    time: new Date().toISOString(),
    data: {
      list,
      total,
      limit,
      page,
      pages: Math.ceil(total / limit),
    },
  });
};
