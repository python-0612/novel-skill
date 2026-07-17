#!/usr/bin/env node

/**
 * 飞书长连接服务
 * 使用飞书官方SDK建立WebSocket长连接，实时接收消息
 */

const lark = require('@larksuiteoapi/node-sdk');
const fs = require('fs');
const path = require('path');

// 配置路径
const HOME = process.env.USERPROFILE || process.env.HOME;
const configPath = path.join(HOME, '.opencode', 'skills', 'novel', 'feishu.json');

// 加载配置
let config = {};
if (fs.existsSync(configPath)) {
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    console.error('⚠️ 配置文件格式错误:', e.message);
  }
}

// 从环境变量或配置文件获取凭证
const appId = process.env.FEISHU_APP_ID || config.app_id;
const appSecret = process.env.FEISHU_APP_SECRET || config.app_secret;

// 检查是否有有效配置
function hasValidConfig() {
  return appId && appSecret && appId.length > 0 && appSecret.length > 0;
}

// 显示配置引导
function showConfigGuide() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  📱 飞书长连接配置');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  检测到飞书未配置，请先完成配置：');
  console.log('');
  console.log('  方式一：运行配置命令');
  console.log('    novel-skill feishu-config');
  console.log('');
  console.log('  方式二：手动创建配置文件');
  console.log(`    文件位置: ${configPath}`);
  console.log('');
  console.log('  配置内容：');
  console.log('  {');
  console.log('    "app_id": "你的App ID",');
  console.log('    "app_secret": "你的App Secret",');
  console.log('    "group_id": "群组ID（可选）"');
  console.log('  }');
  console.log('');
  console.log('  配置完成后，重新运行：');
  console.log('    novel-skill feishu-ws');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
}

// 发送消息
async function sendTextMessage(client, chatId, text) {
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
    console.error('发送消息失败:', error.message);
  }
}

// 发送卡片消息
async function sendCardMessage(client, chatId, content, title = '📚 小说创作系统', template = 'blue') {
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
    console.error('发送卡片失败:', error.message);
  }
}

// 处理消息
async function handleMessage(client, message) {
  const { chat_id, content } = message;
  
  try {
    const contentObj = JSON.parse(content);
    const text = contentObj.text || '';
    
    console.log(`📨 收到消息: ${text}`);
    
    // 根据消息内容执行对应操作
    if (text.includes('创作小说') || text.includes('写小说')) {
      await sendCardMessage(client, chat_id, '📚 收到创作请求，正在启动小说创作系统...');
    } else if (text.includes('查看进度')) {
      await sendCardMessage(client, chat_id, '**当前进度**：等待创作任务...\n**系统状态**：已就绪\n\n📝 发送 "创作小说 [想法]" 开始创作', '📈 创作进度', 'purple');
    } else if (text.includes('同步文档')) {
      await sendCardMessage(client, chat_id, '📄 正在同步文档到飞书...');
    } else if (text === '/help' || text === '帮助') {
      await sendCardMessage(client, chat_id, '**可用命令：**\n- 创作小说 [想法] - 开始创作\n- 查看进度 - 查看当前进度\n- 同步文档 - 同步到飞书文档\n- /help - 显示此帮助', '❓ 帮助', 'green');
    } else {
      await sendCardMessage(client, chat_id, `收到消息: ${text}`);
    }
  } catch (error) {
    console.error('处理消息失败:', error.message);
  }
}

// 启动长连接
async function startWebSocket() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🚀 启动飞书长连接服务');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`  📱 App ID: ${appId.substring(0, 8)}...`);
  console.log('  🔗 连接中...');
  console.log('');
  
  try {
    // 创建API客户端
    const client = new lark.Client({
      appId,
      appSecret,
      loggerLevel: lark.LoggerLevel.info,
    });
    
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
          await handleMessage(client, message);
        },
        // 卡片回传交互
        'card.action.trigger': async (data) => {
          console.log('📋 卡片交互:', data);
          const { action, open_message_id, open_chat_id } = data;
          if (action.value && action.value.action === 'approve') {
            await sendTextMessage(client, open_chat_id, '✅ 已通过审批');
          }
        },
      }),
    });
    
    console.log('  ✅ 长连接已启动，等待消息...');
    console.log('  📝 在飞书中发送消息测试');
    console.log('  ⏹  按 Ctrl+C 停止服务');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('  ❌ 启动失败:', error.message);
    console.error('');
    console.error('  请检查：');
    console.error('  1. App ID 和 App Secret 是否正确');
    console.error('  2. 网络连接是否正常');
    console.error('  3. 飞书应用是否已发布');
    console.error('');
  }
}

// 主函数
function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  📚 小说创作系统 - 飞书集成');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  
  // 检查配置
  if (hasValidConfig()) {
    console.log('  ✅ 检测到飞书配置');
    startWebSocket();
  } else {
    showConfigGuide();
  }
}

// 启动
main();
