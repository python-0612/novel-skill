# 飞书集成技能

本技能提供与飞书平台的完整集成，支持长连接、消息推送、机器人对话、文档同步、审批流等功能。

## 连接方式：WebSocket长连接

**采用WebSocket长连接，实时响应！**

### 长连接优势
- 实时响应：消息立即到达，无延迟
- 节省资源：无需频繁HTTP请求
- 稳定可靠：自动重连机制
- 双向通信：服务器可主动推送

### 长连接配置
```javascript
const WebSocket = require('ws');

// 飞书长连接地址
const WS_URL = 'wss://open.feishu.cn/event/ws';

// 建立长连接
const ws = new WebSocket(WS_URL, {
  headers: {
    'Authorization': `Bearer ${tenant_access_token}`
  }
});

// 监听消息
ws.on('message', (data) => {
  const event = JSON.parse(data);
  handleEvent(event);
});

// 自动重连
ws.on('close', () => {
  console.log('连接断开，3秒后重连...');
  setTimeout(() => reconnect(), 3000);
});
```

## 前置条件

### 1. 创建飞书应用
1. 访问 https://open.feishu.cn/
2. 创建企业自建应用
3. 获取 App ID 和 App Secret

### 2. 配置应用权限
在飞书开放平台配置以下权限：
- `im:message:send_as_bot` - 机器人发送消息
- `im:chat:readonly` - 读取群信息
- `docx:document:create` - 创建文档
- `docx:document:write` - 写入文档内容
- `drive:file:upload` - 上传文件
- `approval:create` - 创建审批
- `approval:instance:read` - 读取审批实例

### 3. 配置环境变量
在系统中配置以下环境变量：
```
FEISHU_APP_ID=cli_xxxxxxxxxxxxxxxx
FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FEISHU_GROUP_ID=oc_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 功能使用

### 1. 消息推送

#### 推送文本消息
```
调用novel-feishu，推送消息到飞书群：第X章创作完成，请审阅。
```

#### 推送富文本消息
```
调用novel-feishu，推送富文本消息到飞书群：
标题：章节完成通知
内容：第X章《章节名》已完成创作，共XXX字。
```

#### 推送卡片消息
```
调用novel-feishu，推送卡片消息到飞书群：
标题：创作进度
内容：当前进度：第X章/共Y章，完成度：XX%
```

### 2. 文档同步

#### 同步新文档
```
调用novel-feishu，创建飞书文档：[文档标题]
然后同步内容：[小说内容]
```

#### 同步更新
```
调用novel-feishu，更新飞书文档：[文档ID]
同步内容：[更新内容]
```

#### 批量同步
```
调用novel-feishu，同步整个小说到飞书：
- 大纲 → 飞书文档
- 各章节 → 飞书文档
- 审计报告 → 飞书文档
```

### 3. 审批流

#### 创建大纲审批
```
调用novel-feishu，创建大纲审批：
审批人：[用户ID或邮箱]
大纲内容：[大纲摘要]
```

#### 创建章节审批
```
调用novel-feishu，创建章节审批：
审批人：[用户ID或邮箱]
章节内容：[章节摘要]
审计结果：[审计报告摘要]
```

#### 查询审批状态
```
调用novel-feishu，查询审批状态：[审批ID]
```

### 4. 机器人对话

#### 接收飞书消息
机器人会自动监听飞书群消息，识别以下指令：
- `创作小说 [想法]` - 开始创作
- `续写第X章` - 续写章节
- `查看进度` - 查看当前进度
- `同步文档` - 同步到飞书文档

#### 在飞书中执行任务
```
用户在飞书发送：创作小说 一个修仙故事
系统响应：好的，正在为您创作修仙小说...
```

## 消息模板

### 章节完成通知
```
📚 章节完成通知

第X章《章节名》已完成创作！

📊 统计信息：
- 字数：XXX字
- 耗时：XX分钟
- 质量评分：XX/100

📝 操作：
- 查看内容：[文档链接]
- 审批通过：回复"同意"
- 需要修改：回复"修改意见"
```

### 审计结果通知
```
📋 审计结果通知

第X章审计完成！

✅ 审计结果：通过/需要修改

📊 详细报告：
- 合规性：XX/100
- 连贯性：XX/100
- 一致性：XX/100

📝 操作：
- 查看详细报告：[链接]
- 同意结果：回复"同意"
- 有异议：回复"异议说明"
```

## 卡片消息模板

### 1. 章节完成卡片
```json
{
  "header": {
    "title": { "tag": "plain_text", "content": "📚 章节完成" },
    "template": "green"
  },
  "elements": [
    {
      "tag": "div",
      "text": {
        "tag": "lark_md",
        "content": "**第{num}章《{title}》** 已完成\n\n📊 字数：{words}字 | 耗时：{time}分钟"
      }
    },
    {
      "tag": "action",
      "actions": [
        { "tag": "button", "text": { "tag": "plain_text", "content": "查看内容" }, "type": "primary", "url": "{url}" },
        { "tag": "button", "text": { "tag": "plain_text", "content": "同步到文档" }, "type": "default", "value": { "action": "sync_doc" } }
      ]
    }
  ]
}
```

### 2. 审计结果卡片
```json
{
  "header": {
    "title": { "tag": "plain_text", "content": "📋 审计结果" },
    "template": "blue"
  },
  "elements": [
    {
      "tag": "div",
      "text": {
        "tag": "lark_md",
        "content": "**第{num}章审计完成**\n\n✅ 合规性：{score1}/100\n✅ 连贯性：{score2}/100\n✅ 一致性：{score3}/100"
      }
    },
    {
      "tag": "action",
      "actions": [
        { "tag": "button", "text": { "tag": "plain_text", "content": "通过" }, "type": "primary", "value": { "action": "approve" } },
        { "tag": "button", "text": { "tag": "plain_text", "content": "需要修改" }, "type": "danger", "value": { "action": "reject" } }
      ]
    }
  ]
}
```

### 3. 创作进度卡片
```json
{
  "header": {
    "title": { "tag": "plain_text", "content": "📈 创作进度" },
    "template": "purple"
  },
  "elements": [
    {
      "tag": "div",
      "text": {
        "tag": "lark_md",
        "content": "**当前进度**：第{current}章/共{total}章\n**完成度**：{progress}%\n**今日新增**：{today_words}字"
      }
    },
    {
      "tag": "progress",
      "percent": "{progress}"
    }
  ]
}
```

### 4. 审批请求卡片
```json
{
  "header": {
    "title": { "tag": "plain_text", "content": "📝 审批请求" },
    "template": "orange"
  },
  "elements": [
    {
      "tag": "div",
      "text": {
        "tag": "lark_md",
        "content": "**{type}** 待审批\n\n{content_preview}"
      }
    },
    {
      "tag": "action",
      "actions": [
        { "tag": "button", "text": { "tag": "plain_text", "content": "同意" }, "type": "primary", "value": { "action": "approve", "id": "{id}" } },
        { "tag": "button", "text": { "tag": "plain_text", "content": "拒绝" }, "type": "danger", "value": { "action": "reject", "id": "{id}" } },
        { "tag": "button", "text": { "tag": "plain_text", "content": "查看详情" }, "type": "default", "url": "{detail_url}" }
      ]
    }
  ]
}
```

### 5. 错误告警卡片
```json
{
  "header": {
    "title": { "tag": "plain_text", "content": "⚠️ 错误告警" },
    "template": "red"
  },
  "elements": [
    {
      "tag": "div",
      "text": {
        "tag": "lark_md",
        "content": "**错误类型**：{error_type}\n**错误信息**：{error_msg}\n**发生时间**：{time}"
      }
    },
    {
      "tag": "action",
      "actions": [
        { "tag": "button", "text": { "tag": "plain_text", "content": "重试" }, "type": "primary", "value": { "action": "retry" } },
        { "tag": "button", "text": { "tag": "plain_text", "content": "查看详情" }, "type": "default", "url": "{log_url}" }
      ]
    }
  ]
}
```

### 创作进度通知
```
📈 创作进度更新

当前进度：第X章/共Y章
完成度：XX%
预计完成时间：XX小时

📊 今日完成：
- 新增章节：X章
- 新增字数：XXXX字
- 审计通过：X章
```

## 错误处理

### 常见问题

#### 1. Token过期
错误信息：`token expired`
解决方法：系统会自动刷新token，如持续失败请检查App Secret

#### 2. 权限不足
错误信息：`permission denied`
解决方法：在飞书开放平台添加相应权限

#### 3. 群组不存在
错误信息：`chat not found`
解决方法：检查FEISHU_GROUP_ID是否正确，机器人是否已加入群组

#### 4. 文档无权限
错误信息：`document access denied`
解决方法：确保机器人有文档的编辑权限

### 日志查看
所有操作日志保存在：
```
~/.opencode/logs/feishu/
```

## 高级配置

### 自定义消息格式
在 `~/.opencode/config/feishu-templates.json` 中配置消息模板

### 审批流配置
在 `~/.opencode/config/feishu-approval.json` 中配置审批流程

### Webhook配置
支持配置自定义Webhook：
```
FEISHU_WEBHOOK_URL=https://open.feishu.cn/open-apis/bot/v2/hook/xxx
```

## 安全注意事项

1. **App Secret保密** - 不要提交到代码仓库
2. **权限最小化** - 只申请必要权限
3. **定期轮换** - 定期更换App Secret
4. **监控调用** - 监控API调用异常
5. **日志脱敏** - 敏感信息在日志中脱敏

## 示例场景

### 场景1：自动推送创作进度
```
用户：创作小说 一个都市故事
系统：[自动推送到飞书群] 开始创作都市故事...
系统：[创作完成后推送] 都市故事第一章完成！
```

### 场景2：飞书审批流程
```
系统：[创建大纲审批]
用户A在飞书：同意
系统：[获取审批结果] 大纲审批通过，开始创作...
```

### 场景3：文档自动同步
```
用户：同步小说到飞书
系统：[自动同步] 大纲、各章节、审计报告已同步到飞书文档
系统：[推送文档链接] 文档链接：https://xxx.feishu.cn/docx/xxx
```
