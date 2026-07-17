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

function showHelp() {
  console.log(`
📚 小说创作技能系统 - 命令行工具

用法：novel-skill [命令]

命令：
  install     安装技能到OpenCode
  uninstall   从OpenCode卸载技能
  help        显示此帮助信息

示例：
  novel-skill install
  novel-skill uninstall
  `);
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

  // 复制配置文件
  console.log('\n📦 安装配置...');
  const configSource = path.join(sourceDir, 'config', 'AGENTS.md');
  const configTarget = path.join(paths.config, 'AGENTS.md');
  copyFile(configSource, configTarget);

  const novellaSource = path.join(sourceDir, 'config', 'novella.json');
  const novellaTarget = path.join(paths.skills, 'novella.json');
  copyFile(novellaSource, novellaTarget);

  console.log('\n✅ 安装完成！\n');
  console.log('📝 下一步：');
  console.log('   1. 重启OpenCode');
  console.log('   2. 说"使用小说创作技能"或"调用novel skill"\n');
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

switch (command) {
  case 'install':
    install();
    break;
  case 'uninstall':
    uninstall();
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
