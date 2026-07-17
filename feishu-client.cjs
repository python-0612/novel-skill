const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('@larksuiteoapi/node-sdk');

function loadConfig() {
  const home = process.env.USERPROFILE;
  const configPath = path.join(home, '.opencode', 'skills', 'novel', 'feishu.json');
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
  const envPath = path.join(home, '.opencode', '.env');
  if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf-8');
    const appId = env.match(/FEISHU_APP_ID=(.+)/)?.[1]?.trim();
    const appSecret = env.match(/FEISHU_APP_SECRET=(.+)/)?.[1]?.trim();
    if (appId && appSecret) return { app_id: appId, app_secret: appSecret };
  }
  throw new Error('飞书配置未找到，请先配置 ~/.opencode/skills/novel/feishu.json');
}

const config = loadConfig();

const feishuClient = new Client({
  appId: config.app_id,
  appSecret: config.app_secret,
  enableTokenCache: true,
});

module.exports = { feishuClient, feishuConfig: config };
