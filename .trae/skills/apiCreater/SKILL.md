---
name: 'apiCreater'
description: '根据API URL、请求和响应示例创建对应的API请求函数和模型定义。指定文件路径后，在对应文件内生成代码。手动触发时使用。'
---

# API Creator

## 功能描述

该技能用于根据用户提供的API信息自动生成完整的API调用代码，包括：

1. API请求函数（支持GET、POST、PUT、DELETE等方法）
2. 请求参数类型定义（命名规范：XXXPayload）
3. 响应数据模型定义（命名规范：XXXResponseData）
4. 错误处理逻辑

## 使用场景

当用户需要：

- 快速为新的API接口生成前端调用代码
- 规范化API调用方式
- 确保类型安全的API交互

## 使用方法

1. 手动触发该技能
2. 提供以下信息：
   - API URL路径（如：`/api/user/login`）
   - 请求方法（GET/POST/PUT/DELETE）
   - 请求参数示例（JSON格式）
   - 响应数据示例（JSON格式）
   - 接口描述（可选）
   - API函数文件路径（如：`src/api/auth.ts`，可选）
   - 模型定义文件路径（如：`src/api/model/auth.ts`，可选）

## 生成文件结构

如果未指定文件路径，生成的代码会按照以下结构组织：

- `src/api/{module}.ts` - API请求函数
- `src/api/model/{module}.ts` - 数据模型定义

如果指定了文件路径，则在对应文件内生成代码。

## 示例输入

```
API URL: /api/user/login
Method: POST
Request:
{
  "username": "admin",
  "password": "123456"
}
Response:
{
  "code": 200,
  "msg": "success",
  "data": {
    "token": "xxx",
    "user": {
      "id": 1,
      "name": "Admin"
    }
  }
}
Description: 用户登录接口
```

## 示例输出

### `src/api/auth.ts`

```typescript
import { postRequest } from '@/utils/request';
import type { LoginPayload, LoginResponse } from '@/api/model/auth';

export const login = (data: LoginPayload) => {
  return postRequest<LoginResponse>({
    url: '/api/user/login',
    data,
    showError: false,
  });
};
```

### `src/api/model/auth.ts`

```typescript
import type { ApiResponse } from './common';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface UserInfo {
  id: number;
  name: string;
}

export interface LoginResponseData {
  token: string;
  user: UserInfo;
}

export type LoginResponse = ApiResponse<LoginResponseData>;
```
