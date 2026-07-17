#!/usr/bin/env node

/**
 * 飞书长连接服务
 * 使用飞书官方SDK建立WebSocket长连接，实时接收消息
 */

const lark = require('@larksuiteoapi/node-sdk');
const fs = require('fs');
const path = require('path');

// 加载配置
const configPath = path.join(process.env.USERPROFILE || process.env.HOME, '.opencode', 'skills', 'novel', 'feishu.json');
let config = {};

if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

// 从环境变量或配置文件获取凭证
const appId = process.env.FEISHU_APP_ID || config.app_id;
const appSecret = process.env.FEISHU_APP_SECRET || config.app_secret;

if (!appId || !appSecret) {
  console.error('❌ 请先配置飞书应用凭证：');
  console.error('   1. 运行 novel-skill feishu-config');
  console.error('   2. 或设置环境变量 FEISHU_APP_ID 和 FEISHU_APP_SECRET');
  process.exit(1);
}

// 创建API客户端
const client = new lark.Client({
  appId,
  appSecret,
  loggerLevel: lark.LoggerLevel.info,
});

// 消息处理函数
async function handleMessage(message) {
  const { chat_id, content, message_type, message_id } = message;
  
  try {
    const contentObj = JSON.parse(content);
    const text = contentObj.text || '';
    
    console.log(`📨 收到消息: ${text}`);
    
    // 根据消息内容执行对应操作
    if (text.includes('创作小说') || text.includes('写小说')) {
      await sendCardMessage(chat_id, '📚 收到创作请求，正在启动小说创作系统...');
      // 这里可以调用novel-lead开始创作
    } else if (text.includes('查看进度')) {
      await sendProgressCard(chat_id);
    } else if (text.includes('同步文档')) {
      await sendCardMessage(chat_id, '📄 正在同步文档到飞书...');
    } else if (text === '/help' || text === '帮助') {
      await sendHelpCard(chat_id);
    } else {
      await sendCardMessage(chat_id, `收到消息: ${text}`);
    }
  } catch (error) {
    console.error('处理消息失败:', error);
  }
}

// 发送文本消息
async function sendTextMessage(chatId, text) {
  try {
    await client.im.v1.message.create({
      params: { receive_id_type: 'chat_id' },
      data: {
        receive_id: chatId,
        msg_type: 'text',
        content: JSON.stringify({ text }),
      },
    });
  } catch (error) {
    console.error('发送消息失败:', error);
  }
}

// 发送卡片消息
async function sendCardMessage(chatId, content, title = '📚 小说创作系统', template = 'blue') {
  try {
    await client.im.v1.message.create({
      params: { receive_id_type: 'chat_id' },
      data: {
        receive_id: chatId,
        msg_type: 'interactive',
        content: JSON.stringify({
          config: { wide_screen_mode: true },
          header: {
            title: { tag: 'plain_text', content: title },
            template,
          },
          elements: [
            {
              tag: 'div',
              text: { tag: 'lark_md', content },
            },
          ],
        }),
      },
    });
  } catch (error) {
    console.error('发送卡片失败:', error);
  }
}

// 发送进度卡片
async function sendProgressCard(chatId) {
  const content = `**当前进度**：等待创作任务...
**系统状态**：已就绪

📝 发送 "创作小说 [想法]" 开始创作`;
  
  await sendCardMessage(chatId, content, '📈 创作进度', 'purple');
}

// 发送帮助卡片
async function sendHelpCard(chatId) {
  const content = `**可用命令：**
- 创作小说 [想法] - 开始创作
- 查看进度 - 查看当前进度
- 同步文档 - 同步到飞书文档
- /help - 显示此帮助

**示例：**
创作小说 一个修仙故事`;
  
  await sendCardMessage(chatId, content, '❓ 帮助', 'green');
}

// 主函数
async function main() {
  console.log('🚀 启动飞书长连接服务...');
  console.log(`📱 App ID: ${appId.substring(0, 8)}...`);
  
  // 创建长连接客户端
  const wsClient = new lark.WSClient({
    appId,
    appSecret,
    loggerLevel: lark.LoggerLevel.info,
  });
  
  // 启动长连接
  wsClient.start({
    eventDispatcher: new lark.EventDispatcher({}).register({
      // 接收消息事件
      'im.message.receive_v1': async (data) => {
        const { message } = data;
        await handleMessage(message);
      },
      // 卡片回传交互
      'card.action.trigger': async (data) => {
        console.log('📋 卡片交互:', data);
        // 处理卡片按钮点击
        const { action, open_message_id, open_chat_id } = data;
        if (action.value && action.value.action === 'approve') {
          await sendTextMessage(open_chat_id, '✅ 已通过审批');
        }
      },
    }),
  });
  
  console.log('✅ 长连接已启动，等待消息...');
  console.log('   按 Ctrl+C 停止服务');
}

// 启动服务
main().catch(console.error);
