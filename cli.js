#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const args = process.argv.slice(2);
const command = args[0];

const homeDir = os.homedir();

const paths = {
  agents: path.join(homeDir, '.opencode', 'agents'),
  skills: path.join(homeDir, '.opencode', 'skills', 'novel'),
  skillDir: path.join(homeDir, '.agents', 'skills', 'novel'),
  config: path.join(homeDir, '.config', 'opencode')
};

const sourceDir = __dirname;

const agentFiles = [
  'novel-lead.md',
  'novel-outline.md',
  'novel-audit.md',
  'novel-writer.md',
  'novel-script.md',
  'novel-material.md',
  'novel-video.md',
  'novel-feishu.md'
];

function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✓ 创建目录: ${dirPath}`);
  }
}

function copyFile(source, target) {
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, target);
    console.log(`✓ 复制: ${path.basename(target)}`);
  } else {
    console.log(`✗ 文件不存在: ${source}`);
  }
}

function install() {
  console.log('\n🚀 开始安装小说创作技能系统...\n');

  // 创建目录
  createDir(paths.agents);
  createDir(paths.skills);
  createDir(paths.skillDir);
  createDir(paths.config);

  // 复制智能体文件
  console.log('\n📦 安装智能体...');
  agentFiles.forEach(file => {
    const source = path.join(sourceDir, 'agents', file);
    const target = path.join(paths.agents, file);
    copyFile(source, target);
  });

  // 复制技能文件
  console.log('\n📦 安装技能...');
  const skillSource = path.join(sourceDir, 'skills', 'SKILL.md');
  const skillTarget = path.join(paths.skillDir, 'SKILL.md');
  copyFile(skillSource, skillTarget);

  // 复制飞书技能
  const feishuSkillSource = path.join(sourceDir, 'skills', 'feishu', 'SKILL.md');
  const feishuSkillDir = path.join(paths.skillDir, 'feishu');
  createDir(feishuSkillDir);
  const feishuSkillTarget = path.join(feishuSkillDir, 'SKILL.md');
  copyFile(feishuSkillSource, feishuSkillTarget);

  // 复制配置文件
  console.log('\n📦 安装配置...');
  const configSource = path.join(sourceDir, 'config', 'AGENTS.md');
  const configTarget = path.join(paths.config, 'AGENTS.md');
  copyFile(configSource, configTarget);

  const novellaSource = path.join(sourceDir, 'config', 'novella.json');
  const novellaTarget = path.join(paths.skills, 'novella.json');
  copyFile(novellaSource, novellaTarget);

  // 复制飞书配置
  const feishuConfigSource = path.join(sourceDir, 'config', 'feishu.json');
  const feishuConfigTarget = path.join(paths.skills, 'feishu.json');
  copyFile(feishuConfigSource, feishuConfigTarget);

  console.log('\n✅ 安装完成！\n');
  console.log('📝 下一步：');
  console.log('   1. 重启OpenCode');
  console.log('   2. 说"使用小说创作技能"或"调用novel skill"');
  console.log('   3. 如需飞书集成，运行: novel-skill feishu-config\n');
}

function uninstall() {
  console.log('\n🗑️  开始卸载小说创作技能系统...\n');

  agentFiles.forEach(file => {
    const target = path.join(paths.agents, file);
    if (fs.existsSync(target)) {
      fs.unlinkSync(target);
      console.log(`✓ 删除: ${file}`);
    }
  });

  const skillTarget = path.join(paths.skillDir, 'SKILL.md');
  if (fs.existsSync(skillTarget)) {
    fs.unlinkSync(skillTarget);
    console.log(`✓ 删除: SKILL.md`);
  }

  const configTarget = path.join(paths.config, 'AGENTS.md');
  if (fs.existsSync(configTarget)) {
    fs.unlinkSync(configTarget);
    console.log(`✓ 删除: AGENTS.md`);
  }

  console.log('\n✅ 卸载完成！\n');
}

function showHelp() {
  console.log(`
📚 小说创作技能系统 - 命令行工具

用法：novel-skill [命令]

命令：
  install         安装技能到OpenCode
  uninstall       从OpenCode卸载技能
  feishu-config   配置飞书集成
  help            显示此帮助信息

示例：
  novel-skill install
  novel-skill feishu-config
  novel-skill uninstall
  `);
}

function configureFeishu() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n🔗 飞书集成配置\n');
  console.log('请在飞书开放平台创建应用后，输入以下信息：\n');

  const questions = [
    { key: 'app_id', prompt: 'App ID (cli_xxx): ' },
    { key: 'app_secret', prompt: 'App Secret: ' },
    { key: 'group_id', prompt: '群组ID (oc_xxx): ' },
    { key: 'webhook_url', prompt: 'Webhook URL (可选，直接回车跳过): ' }
  ];

  const config = {};

  function askQuestion(index) {
    if (index >= questions.length) {
      // 保存配置
      const configPath = path.join(paths.skills, 'feishu.json');
      const existingConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      Object.assign(existingConfig, config);
      existingConfig.websocket = existingConfig.websocket || {
        enabled: true,
        url: 'wss://open.feishu.cn/event/ws',
        reconnect_interval: 3000,
        max_reconnect_attempts: 10
      };
      
      fs.writeFileSync(configPath, JSON.stringify(existingConfig, null, 2));
      
      // 同时保存到环境变量文件
      const envPath = path.join(homeDir, '.opencode', '.env');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      
      const envVars = [
        `FEISHU_APP_ID=${config.app_id || ''}`,
        `FEISHU_APP_SECRET=${config.app_secret || ''}`,
        `FEISHU_GROUP_ID=${config.group_id || ''}`,
        `FEISHU_WEBHOOK_URL=${config.webhook_url || ''}`
      ];
      
      // 更新或添加环境变量
      envVars.forEach(envVar => {
        const key = envVar.split('=')[0];
        if (envContent.includes(key + '=')) {
          envContent = envContent.replace(new RegExp(key + '=.*'), envVar);
        } else {
          envContent += '\n' + envVar;
        }
      });
      
      fs.writeFileSync(envPath, envContent.trim());
      
      console.log('\n✅ 配置已保存！\n');
      console.log('📝 配置文件位置：');
      console.log(`   ${configPath}`);
      console.log(`   ${envPath}\n`);
      
      rl.close();
      return;
    }

    rl.question(questions[index].prompt, (answer) => {
      config[questions[index].key] = answer.trim();
      askQuestion(index + 1);
    });
  }

  askQuestion(0);
}

switch (command) {
  case 'install':
    install();
    break;
  case 'uninstall':
    uninstall();
    break;
  case 'feishu-config':
    configureFeishu();
    break;
  case 'help':
  case undefined:
    showHelp();
    break;
  default:
    console.error(`未知命令: ${command}`);
    showHelp();
    process.exit(1);
}
