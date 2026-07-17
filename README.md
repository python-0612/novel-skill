# 小说创作技能系统

基于OpenCode的小说创作助手，包含8个专业智能体和1个总经理，支持流水线模式。从想法到成品（小说+封面+短剧）全自动完成，支持飞书集成。

## 智能体架构

```mermaid
graph TB
    A[总经理<br/>novel-lead<br/>监督协调·质量把控·用户沟通]
    
    B[大纲智能体<br/>novel-outline]
    C[审计智能体<br/>novel-audit]
    D[写文章智能体<br/>novel-writer]
    
    E[剧本智能体<br/>novel-script]
    F[素材智能体<br/>novel-material]
    G[视频智能体<br/>novel-video]
    H[飞书智能体<br/>novel-feishu<br/>消息推送·文档同步·审批流]
    
    A --> B
    A --> C
    A --> D
    A --> H
    
    B --> E
    B --> F
    B --> G
    
    C --> E
    C --> F
    C --> G
    
    D --> E
    D --> F
    D --> G
    
    H --> B
    H --> C
    H --> D
```

## 智能体职责

| 智能体 | 职责 |
|--------|------|
| **novel-lead** | 总负责人，协调所有智能体，管理流水线模式 |
| **novel-outline** | 生成大纲、名称、简介、世界观、角色设定、封面 |
| **novel-audit** | 审计章节质量，检查合规性、连贯性、一致性 |
| **novel-writer** | 根据大纲续写章节，生成章节内容和摘要 |
| **novel-script** | 设计分镜剧本，生成视频生成提示词 |
| **novel-material** | 生成人物、场景、物品图片，管理素材库 |
| **novel-video** | 生成视频片段，合成完整视频，添加转场效果 |
| **novel-feishu** | 飞书集成：消息推送、机器人对话、文档同步、审批流 |

## 核心功能

### 1. 强制调用规则
- 总经理必须调用其他智能体，不能自己干活
- 每次处理任务时必须先问自己3个问题

### 2. 文件名锁定规则
- 审计文件必须命名为：`[第XX章]_审计.md`
- 禁止合并多个章节审计
- 禁止擅自更改文件名

### 3. 审计规则
- 一个章节一个审计报告
- 禁止合并多个章节审计
- 审计文件必须保存到`审计/`目录

### 4. 搜索功能
- 实时搜索男频/女频分类信息
- 搜索热门标签
- 搜索内容偏好差异

### 5. 全局规则
- 不生成英语文字：提示词加入"No English text, no words, no letters, no subtitles"
- 不生成字幕：提示词加入"不生成字幕"
- 实时搜索最新参数：每次生成前都要搜索模型最新参数

### 6. 多小说项目管理
- 使用`novella.json`管理多个小说项目
- 支持切换当前活跃项目
- 自动创建和管理项目文件夹

## 使用方法

### 1. 前置条件
- 已安装 [OpenCode](https://opencode.ai)
- 已配置 AI API 密钥
- 已安装 Node.js（推荐用官方安装包或nvm）

### 2. 安装技能

#### 方法一：npm一键安装（推荐）⭐

```bash
# 全局安装
npm install -g novel-skill-opencode

# 运行安装程序
novel-skill install
```

如果提示找不到命令，请用 npx：
```bash
npx novel-skill install
```

#### 方法二：Git克隆安装

```bash
# 克隆仓库
git clone https://github.com/python-0612/novel-skill-system.git

# 进入目录
cd novel-skill-system

# 运行安装程序
node install.js
```

#### 方法三：手动安装

**Windows系统：**
```powershell
# 创建目录
mkdir -p ~/.agents/skills/novel
mkdir -p ~/.opencode/agents
mkdir -p ~/.opencode/skills/novel

# 复制文件
Copy-Item SKILL.md ~/.agents/skills/novel/SKILL.md
Copy-Item novel-lead.md ~/.opencode/agents/
Copy-Item novel-outline.md ~/.opencode/agents/
Copy-Item novel-audit.md ~/.opencode/agents/
Copy-Item novel-writer.md ~/.opencode/agents/
Copy-Item novel-script.md ~/.opencode/agents/
Copy-Item novel-material.md ~/.opencode/agents/
Copy-Item novel-video.md ~/.opencode/agents/
Copy-Item novella.json ~/.opencode/skills/novel/
```

**Mac/Linux系统：**
```bash
# 创建目录
mkdir -p ~/.agents/skills/novel
mkdir -p ~/.opencode/agents
mkdir -p ~/.opencode/skills/novel

# 复制文件
cp SKILL.md ~/.agents/skills/novel/SKILL.md
cp novel-lead.md ~/.opencode/agents/
cp novel-outline.md ~/.opencode/agents/
cp novel-audit.md ~/.opencode/agents/
cp novel-writer.md ~/.opencode/agents/
cp novel-script.md ~/.opencode/agents/
cp novel-material.md ~/.opencode/agents/
cp novel-video.md ~/.opencode/agents/
cp novella.json ~/.opencode/skills/novel/
```

### 3. 验证安装
安装完成后，重启OpenCode，然后说：
- "使用小说创作技能"
- 或"调用novel skill"

如果系统识别到技能，说明安装成功。

### 4. 调用技能
每次对话开始时，说：
- "使用小说创作技能"
- 或"调用novel skill"
- 或直接描述创作需求

### 5. 流水线模式
说"开启流水线模式"后，除以下关键节点外全部自动完成：
- 大纲确认
- 审计问题
- API错误
- 流程完成

## 文件结构

```
[小说名称]/
├── 大纲.md
├── 世界观.md
├── 章节/
│   ├── 第01章.md
│   ├── 第02章.md
│   └── ...
├── 审计/
│   ├── 第01章_审计.md
│   ├── 第02章_审计.md
│   └── ...
├── 素材/
│   ├── 人物/
│   ├── 场景/
│   └── 物品/
└── 视频/
```

## 注意事项

1. **必须调用技能**：每次对话开始时必须调用skill，否则AI会忘记规则
2. **单章审计**：每个章节必须单独审计，禁止合并多个章节
3. **文件名保护**：禁止擅自更改文件名，除非用户同意
4. **实时搜索**：所有搜索都必须实时获取最新数据，不要使用缓存

## 许可证

MIT License
