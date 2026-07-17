const fs = require('node:fs');
const path = require('node:path');

const SKILL_DIR = path.dirname(require.resolve('./package.json'));
const CONFIG_PATH = path.join(process.env.USERPROFILE, '.opencode', 'skills', 'novel', 'feishu.json');

function check() {
  const sdkPkg = path.join(SKILL_DIR, 'node_modules', '@larksuiteoapi', 'node-sdk', 'package.json');
  if (!fs.existsSync(sdkPkg)) {
    console.error('[feishu] SDK 未安装，请执行: npm install @larksuiteoapi/node-sdk');
    return false;
  }

  if (!fs.existsSync(CONFIG_PATH)) {
    console.error('[feishu] 配置未找到:', CONFIG_PATH);
    console.error('[feishu] 请创建文件: { "app_id": "...", "app_secret": "..." }');
    return false;
  }

  return true;
}

function getClient() {
  if (!check()) return null;
  return require('./feishu-client.cjs');
}

module.exports = { check, getClient };
