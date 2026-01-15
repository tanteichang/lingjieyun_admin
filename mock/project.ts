import Mock from 'mockjs';
import type { MockMethod } from 'vite-plugin-mock';

const companies = [
  '新华网络科技有限公司',
  '吉成机视频科技有限公司',
  '唯一直健科技有限公司',
  '创显网络科技有限公司',
];

const PROJECTS = Mock.mock({
  'list|28-40': [
    {
      'id|+1': 1,
      code: 'X0487',
      name: '灵捷云服务平台APP项目',
      projectType: '资讯服务费',
      invoiceType: '资讯服务费',
      'company|1': companies,
      projectPeriod: '2025.12.28-2026.02.15',
      taskCount: 6,
      'status|1': ['processing', 'paused', 'completed', 'terminated', 'processing'],
      requiredStaff: 8,
      memberCount: 2,
    },
  ],
});

export default [
  {
    url: '/api/project/list',
    method: 'get',
    response: ({ query }) => {
      const { name, type, status, company, page = 1, pageSize = 20 } = query;
      const pageNum = Number(page);
      const sizeNum = Number(pageSize);
      const filtered = PROJECTS.list.filter((item: any) => {
        const matchName = name ? item.name.includes(name) || item.code.includes(name) : true;
        const matchType = type ? item.projectType === type : true;
        const matchStatus = status ? item.status === status : true;
        const matchCompany = company ? item.company.includes(company) : true;
        return matchName && matchType && matchStatus && matchCompany;
      });

      const start = (pageNum - 1) * sizeNum;
      const end = start + sizeNum;

      return {
        code: 0,
        data: {
          list: filtered.slice(start, end),
          total: filtered.length,
        },
      };
    },
  },
] as MockMethod[];
