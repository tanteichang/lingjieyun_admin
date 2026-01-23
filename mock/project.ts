import Mock from 'mockjs';
import type { MockMethod } from 'vite-plugin-mock';

const companies = ['新华网络科技有限公司', '吉成机视频科技有限公司', '唯一直健科技有限公司', '创显网络科技有限公司'];
const projectNames = ['灵捷云服务平台', '智慧采购协同', '移动办公升级', '数据治理中台', '客户关系优化', '财务共享提升'];

const PROJECTS = Mock.mock({
  'list|101-233': [
    {
      'id|+1': 1,
      code: () => Mock.Random.string('number', 6),
      name: () => `${Mock.Random.pick(projectNames)}${Mock.Random.integer(1, 20)}期`,
      projectType: '资讯服务费',
      invoiceType: '资讯服务费',
      'company|1': companies,
      projectPeriod: '2025.12.28-2026.02.15',
      taskCount: () => Mock.Random.integer(10, 100),
      'status|1': ['processing', 'paused', 'completed', 'terminated', 'processing'],
      requiredStaff: () => Mock.Random.integer(10, 100),
      memberCount: () => Mock.Random.integer(10, 100),
    },
  ],
});

// 任务数据
const TASKS = Mock.mock({
  'list|101-233': [
    {
      'id|+1': 1,
      code: () => `TSK${Mock.Random.string('number', 6)}`,
      name: () => `${Mock.Random.cword(4, 10)}任务`,
      type: () => Mock.Random.pick(['软件研发', '设计', '测试', '运维', '产品']),
      recruitType: () => Mock.Random.pick(['自由报名', '指定分配']),
      'status|1': ['processing', 'paused', 'completed', 'terminated'],
      memberCount: () => Mock.Random.integer(1, 20),
    },
  ],
});

// 成员数据
const MEMBERS = Mock.mock({
  'list|101-233': [
    {
      'id|+1': 1,
      name: () => Mock.Random.cname(),
      phone: () => `${Mock.Random.integer(130, 199)}****${Mock.Random.string('number', 4)}`,
      taskCode: 'XM487',
      taskName: '贵港市政务平台APP项目',
      taskType: '软件开发',
      willingness: () => Mock.Random.pick(['willing', 'unwilling', 'undecided']),
      contractStatus: () => Mock.Random.pick(['signed', 'pending', 'rejected']),
    },
  ],
});

// 操作日志数据
const LOGS = Mock.mock({
  'list|101-233': [
    {
      'id|+1': 1,
      operator: () => Mock.Random.pick(['admin', '民管', '方刚']),
      action: () => Mock.Random.pick([
        '导入[项目成员85]',
        '新增任务【名称研发】',
        '导入[项目成员85]',
        '修改项目状态',
        '更新任务信息',
        '删除成员记录'
      ]),
      operateTime: () => `${Mock.Random.date('yyyy-MM-dd')} ${Mock.Random.time('HH:mm:ss')}`,
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
  {
    url: '/api/project/task/list',
    method: 'get',
    response: ({ query }) => {
      const { name, status, type, recruitType, page = 1, limit = 20 } = query;
      const pageNum = Number(page);
      const sizeNum = Number(limit);
      const filtered = TASKS.list.filter((item: any) => {
        const matchName = name ? item.name.includes(name) || item.code.includes(name) : true;
        const matchStatus = status ? item.status === status : true;
        const matchType = type ? item.type === type : true;
        const matchRecruitType = recruitType ? item.recruitType === recruitType : true;
        return matchName && matchStatus && matchType && matchRecruitType;
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
  {
    url: '/api/project/member/list',
    method: 'get',
    response: ({ query }) => {
      const { name, phone, status, taskName, page = 1, limit = 20 } = query;
      const pageNum = Number(page);
      const sizeNum = Number(limit);
      const filtered = MEMBERS.list.filter((item: any) => {
        const matchName = name ? item.name.includes(name) : true;
        const matchPhone = phone ? item.phone.includes(phone) : true;
        const matchStatus = status ? item.contractStatus === status : true;
        const matchTaskName = taskName ? item.taskName.includes(taskName) : true;
        return matchName && matchPhone && matchStatus && matchTaskName;
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
  {
    url: '/api/project/log/list',
    method: 'get',
    response: ({ query }) => {
      const { name, time, status, page = 1, limit = 20 } = query;
      const pageNum = Number(page);
      const sizeNum = Number(limit);
      const filtered = LOGS.list.filter((item: any) => {
        const matchName = name ? item.action.includes(name) || item.operator.includes(name) : true;
        const matchTime = time ? item.operateTime.includes(time) : true;
        const matchStatus = status ? true : true; // 操作日志暂时不需要状态过滤
        return matchName && matchTime && matchStatus;
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
