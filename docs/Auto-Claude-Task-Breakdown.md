# 使用 Auto-Claude 执行 PWA 优化项目

> 将 PWA-Mobile-Optimization-Plan.md 拆分为Auto-Claude可执行的并行任务
>
> **创建日期**: 2025-12-29
> **Auto-Claude版本**: 基于最新版本分析
> **目标**: 8-10天完成PWA优化，使用3-5个并行worktree

---

## 📋 目录

1. [Auto-Claude 快速入门](#auto-claude-快速入门)
2. [任务拆分策略](#任务拆分策略)
3. [Spec配置详解](#spec配置详解)
4. [并行执行计划](#并行执行计划)
5. [完整操作流程](#完整操作流程)

---

## 🚀 Auto-Claude 快速入门

### 环境设置

```bash
# 1. 进入Auto-Claude目录
cd /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend

# 2. 创建虚拟环境并安装依赖
uv venv
uv pip install -r requirements.txt

# 3. 配置环境变量
cp .env.example .env

# 4. 设置Claude Code认证
claude setup-token
# 或手动添加到.env:
# CLAUDE_CODE_OAUTH_TOKEN=your-token

# 5. 配置Graphiti（记忆系统）
# 编辑 .env，添加：
GRAPHITI_ENABLED=true
GRAPHITI_LLM_PROVIDER=openai
GRAPHITI_EMBEDDER_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# 6. 验证安装
python run.py --help
```

### 初始化项目

```bash
# 进入你的项目目录
cd /Users/jesseqin/Documents/Explore/what-to-eat

# 让Auto-Claude分析项目结构（首次运行会自动执行）
# 这会生成 .auto-claude/project_index.json
python /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend/spec_runner.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --task "Initialize project" \
  --interactive
```

---

## 🎯 任务拆分策略

### 基于 PWA 优化计划的拆分

根据Auto-Claude的**并行能力**和**依赖关系**，我们将8个阶段拆分为**5个独立的Spec**：

```
阶段分组策略：
├─ Spec 1: PWA基础设施 (完全独立，优先级最高)
├─ Spec 2: Composables工具库 (完全独立，无文件冲突)
├─ Spec 3: 底部导航系统 (完全独立，新组件)
├─ Spec 4: 菜谱详情页面 (依赖Spec 2的useShare接口)
└─ Spec 5: 主页分步表单 (依赖Spec 2的useWizard接口)

集成阶段（不作为Spec，手动操作）：
└─ 手动集成：App.vue调整、路由配置、性能优化
```

### 为什么这样拆分？

#### ✅ 可以并行的（Spec 1-3）

| Spec | 原因 | 文件冲突 |
|------|------|----------|
| PWA基础 | 新增文件（manifest.json, sw.js），不修改现有代码 | 🟢 无 |
| Composables | 新增工具函数，独立目录 | 🟢 无 |
| 底部导航 | 新组件，不修改App.vue（先预留插槽） | 🟢 无 |

#### ⚠️ 需要顺序的（Spec 4-5）

| Spec | 依赖 | 原因 |
|------|------|------|
| 菜谱详情 | Spec 2 (useShare) | 需要接口定义 |
| 主页表单 | Spec 2 (useWizard) | 需要接口定义 |

**解决方案**：
1. 提前在develop分支定义接口（TypeScript类型）
2. Spec 2完成后，Spec 4和5可以并行

---

## 📝 Spec配置详解

### Spec 1: PWA基础设施

**任务描述**:
```
为Vue 3应用添加完整的PWA支持，包括：
1. manifest.json配置（应用名称、图标、主题色）
2. Service Worker实现（缓存策略：Cache First用于静态资源，Network First用于API）
3. 生成各尺寸应用图标（72px到512px，包括maskable）
4. 在index.html添加PWA meta标签（iOS支持）
5. 在main.ts注册Service Worker并处理更新

技术栈: Vue 3.4, Vite 5.0, TypeScript
项目路径: /Users/jesseqin/Documents/Explore/what-to-eat
```

**预期implementation_plan.json结构**:

```json
{
  "feature": "PWA基础设施",
  "workflow_type": "feature",
  "workflow_rationale": "添加新的PWA配置文件，不修改现有业务逻辑",
  "services_involved": ["frontend"],
  "phases": [
    {
      "id": "phase-1-manifest",
      "name": "创建PWA Manifest",
      "type": "implementation",
      "depends_on": [],
      "parallel_safe": true,
      "subtasks": [
        {
          "id": "subtask-1-1",
          "description": "创建 public/manifest.json 文件，配置应用名称、主题色、图标",
          "service": "frontend",
          "files_to_create": ["public/manifest.json"],
          "patterns_from": [],
          "verification": {
            "type": "command",
            "command": "node -e \"const m = require('./public/manifest.json'); console.log(m.name ? 'OK' : 'FAIL')\"",
            "expected": "OK"
          }
        },
        {
          "id": "subtask-1-2",
          "description": "在 index.html 中添加 manifest 链接和 PWA meta 标签",
          "service": "frontend",
          "files_to_modify": ["index.html"],
          "verification": {
            "type": "browser",
            "url": "http://localhost:5173/",
            "checks": ["manifest link存在", "apple-mobile-web-app-capable meta存在"]
          }
        }
      ]
    },
    {
      "id": "phase-2-service-worker",
      "name": "实现Service Worker",
      "type": "implementation",
      "depends_on": ["phase-1-manifest"],
      "parallel_safe": true,
      "subtasks": [
        {
          "id": "subtask-2-1",
          "description": "创建 public/sw.js，实现缓存策略（Cache First + Network First）",
          "service": "frontend",
          "files_to_create": ["public/sw.js"],
          "verification": {
            "type": "browser",
            "url": "http://localhost:5173/",
            "checks": ["Service Worker注册成功", "静态资源被缓存", "离线时可访问"]
          }
        },
        {
          "id": "subtask-2-2",
          "description": "在 src/main.ts 注册 Service Worker 并处理更新",
          "service": "frontend",
          "files_to_modify": ["src/main.ts"],
          "verification": {
            "type": "command",
            "command": "grep -q \"serviceWorker.register\" src/main.ts && echo OK || echo FAIL",
            "expected": "OK"
          }
        }
      ]
    },
    {
      "id": "phase-3-icons",
      "name": "生成应用图标",
      "type": "implementation",
      "depends_on": [],
      "parallel_safe": true,
      "subtasks": [
        {
          "id": "subtask-3-1",
          "description": "生成各尺寸PNG图标（72x72 到 512x512）和maskable图标",
          "service": "frontend",
          "files_to_create": [
            "public/icons/icon-72x72.png",
            "public/icons/icon-192x192.png",
            "public/icons/icon-512x512.png",
            "public/icons/maskable-icon-192x192.png",
            "public/icons/maskable-icon-512x512.png"
          ],
          "verification": {
            "type": "command",
            "command": "ls public/icons/*.png | wc -l",
            "expected": "5"
          }
        }
      ]
    }
  ],
  "verification_strategy": {
    "risk_level": "low",
    "skip_validation": false,
    "verification_steps": [
      {
        "name": "PWA Lighthouse测试",
        "command": "echo '手动运行: npm run build && npm run preview，然后使用Chrome DevTools > Lighthouse > PWA审计'",
        "type": "manual",
        "required": true
      },
      {
        "name": "离线功能测试",
        "type": "browser",
        "steps": [
          "访问 http://localhost:5173/",
          "断开网络",
          "刷新页面",
          "验证页面仍然可访问"
        ],
        "required": true
      }
    ]
  },
  "summary": {
    "total_phases": 3,
    "total_subtasks": 4,
    "parallelism": {
      "max_parallel_phases": 2,
      "recommended_workers": 1
    }
  }
}
```

**创建命令**:

```bash
cd /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend

python spec_runner.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --task "为Vue 3应用添加完整的PWA支持：manifest.json、Service Worker（Cache First + Network First策略）、应用图标（72px-512px）、index.html PWA meta标签、main.ts中注册SW" \
  --complexity standard \
  --interactive
```

---

### Spec 2: Composables工具库

**任务描述**:
```
创建一套Vue 3 Composables工具函数，包括：
1. useWizard.ts - 分步表单管理（步骤导航、进度追踪、验证）
2. useSwipe.ts - 滑动手势检测（左滑、右滑、上滑、下滑）
3. useLongPress.ts - 长按手势检测
4. useShare.ts - 原生分享API封装（降级到复制链接）
5. usePWAInstall.ts - PWA安装提示管理
6. haptics.ts - 振动反馈工具函数

所有函数需要：
- 完整的TypeScript类型定义
- 使用@vueuse/core库（已安装）
- 包含使用示例和文档注释

技术栈: Vue 3 Composition API, TypeScript, @vueuse/core
项目路径: /Users/jesseqin/Documents/Explore/what-to-eat
```

**关键接口定义（需提前添加到 src/types/index.ts）**:

```typescript
// 在创建Spec 2之前，手动添加到 src/types/index.ts

export interface WizardStep {
  title: string
  icon: string
  component?: string
  validate?: () => boolean
}

export interface UseWizardReturn {
  currentStep: Ref<number>
  currentStepData: ComputedRef<WizardStep>
  isFirstStep: ComputedRef<boolean>
  isLastStep: ComputedRef<boolean>
  progress: ComputedRef<number>
  goNext: () => boolean
  goPrev: () => boolean
  goToStep: (step: number) => void
  reset: () => void
}

export interface GestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
}

export interface ShareOptions {
  title: string
  text: string
  url: string
}
```

**预期文件结构**:

```
src/composables/
├── useWizard.ts          # 分步表单
├── useGestures.ts        # 导出useSwipe和useLongPress
├── useShare.ts           # 原生分享
└── usePWAInstall.ts      # PWA安装

src/utils/
└── haptics.ts            # 振动反馈
```

**创建命令**:

```bash
python spec_runner.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --task "创建Vue 3 Composables工具库：useWizard（分步表单）、useSwipe/useLongPress（手势）、useShare（原生分享）、usePWAInstall（安装提示）、haptics（振动），所有函数需完整TS类型和文档" \
  --complexity standard \
  --interactive
```

---

### Spec 3: 底部Tab Bar导航

**任务描述**:
```
创建移动端底部Tab Bar导航系统，替代顶部导航：
1. BottomTabBar.vue - 底部固定导航容器，支持iOS安全区域
2. TabItem.vue - 单个Tab按钮组件，带图标和激活状态
3. 集成到App.vue（预留插槽，不直接修改路由）
4. 添加页面切换动画（fade, slide-left）
5. 响应式适配（移动端显示，桌面端隐藏）

导航项：
- 🏠 生成 (/)
- 🎲 盲盒 (/today-eat)
- 🍽️ 满汉 (/table-design)
- ❤️ 收藏 (/favorites)

技术栈: Vue 3.4, Vue Router 4.2, Tailwind CSS
项目路径: /Users/jesseqin/Documents/Explore/what-to-eat
```

**实现策略**:

```
Phase 1: 创建组件
  → BottomTabBar.vue（独立组件，带demo）
  → TabItem.vue（子组件）

Phase 2: 样式和动画
  → Tailwind自定义类
  → CSS过渡动画
  → iOS safe-area-inset支持

Phase 3: 预留集成接口
  → 在App.vue添加 <div id="bottom-navigation-slot"></div>
  → 编写集成文档（如何在App.vue中使用）
  → 注意：不直接修改App.vue的主体结构
```

**验证方式**:

```json
{
  "verification": {
    "type": "browser",
    "url": "http://localhost:5173/",
    "checks": [
      "底部导航栏固定在底部",
      "4个Tab按钮正确显示",
      "点击Tab可以切换路由",
      "当前路由的Tab高亮",
      "在iPhone X模拟器中底部不被遮挡（safe-area）",
      "桌面端（>768px）导航栏隐藏"
    ]
  }
}
```

**创建命令**:

```bash
python spec_runner.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --task "创建移动端底部Tab Bar：BottomTabBar.vue和TabItem.vue组件，支持iOS安全区域，包含4个导航项（生成/盲盒/满汉/收藏），响应式设计（移动显示/桌面隐藏），在App.vue预留插槽但不修改主结构" \
  --complexity simple \
  --interactive
```

---

### Spec 4: 菜谱详情页面优化

**任务描述**:
```
创建全屏菜谱详情页和紧凑卡片组件：
1. RecipeDetail.vue - 全屏详情页（路由：/recipe/:id）
   - 顶部导航（返回 + 标题 + 更多菜单）
   - 主图区域（带悬浮标签）
   - 食材清单（网格布局）
   - 烹饪步骤（带序号）
   - 烹饪技巧和营养分析
   - 底部操作栏（收藏 + 分享）

2. RecipeCardCompact.vue - 列表紧凑卡片
   - 缩略图 + 菜名 + 元信息
   - 食材预览（前3个 + more）
   - 右滑查看详情

3. 功能集成：
   - 使用 useShare (来自Spec 2) 实现原生分享
   - 图片懒加载（loading="lazy"）
   - 页面切换动画

依赖: Spec 2 (useShare接口)
技术栈: Vue 3.4, Vue Router, TypeScript, Tailwind CSS
项目路径: /Users/jesseqin/Documents/Explore/what-to-eat
```

**文件清单**:

```
src/views/
└── RecipeDetail.vue         # 新增全屏详情页

src/components/
└── RecipeCardCompact.vue    # 新增紧凑卡片

src/router/index.ts          # 添加 /recipe/:id 路由

src/composables/
└── useShare.ts              # 依赖（Spec 2提供）
```

**路由配置示例**:

```typescript
// 在 src/router/index.ts 添加
{
  path: '/recipe/:id',
  name: 'RecipeDetail',
  component: () => import('@/views/RecipeDetail.vue'),
  meta: { transition: 'slide-up' }
}
```

**创建命令**:

```bash
# 注意：需要等 Spec 2 完成后再创建
python spec_runner.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --task "创建菜谱详情页RecipeDetail.vue（全屏，含主图/食材/步骤/技巧/营养/操作栏）和RecipeCardCompact.vue（紧凑列表卡片），集成useShare实现原生分享，添加/recipe/:id路由，图片懒加载，页面切换动画" \
  --complexity standard \
  --interactive
```

---

### Spec 5: 主页分步表单重构

**任务描述**:
```
将Home.vue重构为移动端友好的分步表单（Wizard模式）：

当前问题：
- 4个步骤在一屏展示，移动端需大量滚动
- 按钮间距小，容易误触
- 自定义输入框太小

重构方案：
1. 使用 useWizard (来自Spec 2) 管理步骤
2. 创建3个步骤组件：
   - StepIngredients.vue - 食材选择（全屏，带拍照识别）
   - StepCuisine.vue - 菜系选择（网格卡片）
   - StepConfirm.vue - 确认生成（配置预览）

3. 优化交互：
   - 进度指示器（顶部固定）
   - 大按钮（py-4, 最小44x44px）
   - 步骤切换动画（slide-fade）
   - 底部操作按钮（固定，避开BottomTabBar）

4. 保留现有功能：
   - 食材拍照识别（AI图像识别）
   - 快速选择器
   - 菜系网格
   - 自定义要求

依赖: Spec 2 (useWizard接口)
技术栈: Vue 3.4, Composition API, TypeScript
项目路径: /Users/jesseqin/Documents/Explore/what-to-eat
```

**文件清单**:

```
src/views/
└── Home.vue                      # 重构为Wizard容器

src/views/wizard-steps/           # 新建目录
├── StepIngredients.vue           # 步骤1: 食材选择
├── StepCuisine.vue               # 步骤2: 菜系选择
└── StepConfirm.vue               # 步骤3: 确认生成

src/composables/
└── useWizard.ts                  # 依赖（Spec 2提供）
```

**验证场景**:

```json
{
  "verification": {
    "type": "e2e",
    "steps": [
      "访问首页，显示步骤1（食材选择）",
      "添加2个食材，点击下一步",
      "进入步骤2（菜系选择），进度条显示2/3",
      "选择川菜，点击下一步",
      "进入步骤3（确认生成），显示配置预览",
      "点击上一步，返回步骤2",
      "再次点击下一步，回到步骤3",
      "点击生成按钮，触发菜谱生成"
    ]
  }
}
```

**创建命令**:

```bash
# 注意：需要等 Spec 2 完成后再创建
python spec_runner.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --task "重构Home.vue为分步表单：使用useWizard管理3个步骤（StepIngredients/StepCuisine/StepConfirm），添加进度指示器，大按钮（≥44px），步骤动画，保留现有功能（拍照识别/快速选择/菜系网格），底部操作栏避开BottomTabBar" \
  --complexity standard \
  --interactive
```

---

## ⚡ 并行执行计划

### 阶段1: 基础并行（Day 1-3）

**同时运行3个Spec**:

```bash
# Terminal 1: PWA基础
cd /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend
python run.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --spec 001-pwa-foundation

# Terminal 2: Composables
python run.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --spec 002-composables-library

# Terminal 3: 底部导航
python run.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --spec 003-bottom-navigation
```

**Worktree结构**:

```
/Users/jesseqin/Documents/Explore/what-to-eat/
├── .git/
├── src/
├── .auto-claude/
│   └── specs/
│       ├── 001-pwa-foundation/
│       ├── 002-composables-library/
│       └── 003-bottom-navigation/
└── .worktrees/
    ├── auto-claude-001-pwa-foundation/      # 分支: auto-claude/001-pwa-foundation
    ├── auto-claude-002-composables-library/ # 分支: auto-claude/002-composables-library
    └── auto-claude-003-bottom-navigation/   # 分支: auto-claude/003-bottom-navigation
```

**预计完成时间**:
- Spec 1 (PWA): 1.5天
- Spec 2 (Composables): 2天
- Spec 3 (底部导航): 1.5天

**并行效果**: 2天完成（vs 单线程5天）

---

### 阶段2: 功能并行（Day 4-7）

**前提**: Spec 2完成，接口已定义

**同时运行2个Spec**:

```bash
# Terminal 1: 菜谱详情
python run.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --spec 004-recipe-detail-page

# Terminal 2: 主页表单
python run.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --spec 005-home-wizard-refactor
```

**预计完成时间**:
- Spec 4 (详情页): 2.5天
- Spec 5 (主页): 3天

**并行效果**: 3天完成（vs 单线程5.5天）

---

### 阶段3: 集成和优化（Day 8-10）

**手动操作**（不使用Auto-Claude）:

```bash
# 1. 合并所有spec到master
cd /Users/jesseqin/Documents/Explore/what-to-eat

# 依次合并
cd /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 001 --merge
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 002 --merge
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 003 --merge
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 004 --merge
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 005 --merge

# 2. 手动集成（在master分支）
cd /Users/jesseqin/Documents/Explore/what-to-eat

# 修改 App.vue（集成BottomTabBar）
# 修改 router/index.ts（添加页面切换动画）
# 优化 style.css（全局触摸样式）

# 3. 性能优化
# - 路由懒加载
# - 图片响应式
# - 代码分割

# 4. 测试
npm run dev
npm run build
npm run preview

# 5. 提交
git add .
git commit -m "feat: 完成PWA移动端优化集成"
git push
```

---

## 📖 完整操作流程

### 准备阶段（30分钟）

#### Step 1: 设置Auto-Claude环境

```bash
# 1. 克隆或更新Auto-Claude
cd /Users/jesseqin/Documents/Explore
git clone https://github.com/getzep/auto-claude.git Auto-Claude  # 如果还没有
cd Auto-Claude
git pull  # 如果已存在

# 2. 安装依赖
cd apps/backend
uv venv
source .venv/bin/activate  # macOS/Linux
uv pip install -r requirements.txt

# 3. 配置环境变量
cp .env.example .env
nano .env  # 或用你喜欢的编辑器

# 添加以下内容：
CLAUDE_CODE_OAUTH_TOKEN=<your-token>
GRAPHITI_ENABLED=true
GRAPHITI_LLM_PROVIDER=openai
GRAPHITI_EMBEDDER_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# 4. 验证
python run.py --help
```

#### Step 2: 准备项目

```bash
cd /Users/jesseqin/Documents/Explore/what-to-eat

# 1. 创建develop分支（作为集成分支）
git checkout -b develop
git push -u origin develop

# 2. 提前定义TypeScript接口（避免Spec 4/5等待）
# 编辑 src/types/index.ts，添加：
# - WizardStep, UseWizardReturn
# - GestureOptions
# - ShareOptions
# （参考上面"Spec 2"章节的接口定义）

git add src/types/index.ts
git commit -m "feat: 添加PWA优化所需的TypeScript接口"
git push origin develop

# 3. 回到master（准备让Auto-Claude工作）
git checkout master
```

---

### 执行阶段1: 创建并运行前3个Spec（Day 1-3）

#### Step 3: 创建Spec 1-3

```bash
cd /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend

# Spec 1: PWA基础
python spec_runner.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --task "为Vue 3应用添加完整的PWA支持：manifest.json、Service Worker（Cache First + Network First策略）、应用图标（72px-512px）、index.html PWA meta标签、main.ts中注册SW" \
  --complexity standard \
  --interactive

# 跟随交互式提示，确认创建spec

# Spec 2: Composables
python spec_runner.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --task "创建Vue 3 Composables工具库：useWizard（分步表单）、useSwipe/useLongPress（手势）、useShare（原生分享）、usePWAInstall（安装提示）、haptics（振动），所有函数需完整TS类型和文档" \
  --complexity standard \
  --interactive

# Spec 3: 底部导航
python spec_runner.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --task "创建移动端底部Tab Bar：BottomTabBar.vue和TabItem.vue组件，支持iOS安全区域，包含4个导航项（生成/盲盒/满汉/收藏），响应式设计（移动显示/桌面隐藏），在App.vue预留插槽但不修改主结构" \
  --complexity simple \
  --interactive
```

#### Step 4: 并行运行3个Spec

```bash
# 打开3个终端窗口

# Terminal 1:
cd /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend
python run.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --spec 001-pwa-foundation

# Terminal 2:
cd /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend
python run.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --spec 002-composables-library

# Terminal 3:
cd /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend
python run.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --spec 003-bottom-navigation
```

#### Step 5: 监控进度

```bash
# 在另一个终端
cd /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend

# 查看所有spec状态
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --batch-status

# 查看单个spec的QA报告
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 001 --qa-status
```

#### Step 6: 测试和审查

```bash
# 当一个spec完成时，进入其worktree测试

# 测试Spec 1 (PWA)
cd /Users/jesseqin/Documents/Explore/what-to-eat/.worktrees/auto-claude-001-pwa-foundation
npm install  # 如果需要
npm run dev  # 启动在 http://localhost:5173

# 测试PWA功能：
# 1. Chrome DevTools > Application > Manifest（检查manifest.json）
# 2. Application > Service Workers（验证SW注册）
# 3. 刷新页面，断网，再刷新（验证离线功能）

# 满意后返回
cd /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend

# 审查代码
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 001 --review
```

#### Step 7: 合并到develop

```bash
# 当所有3个spec都完成并测试通过
cd /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend

# 依次合并到develop（而非master）
git checkout develop  # 先切到develop

python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 001 --merge
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 002 --merge
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 003 --merge

# 推送develop
cd /Users/jesseqin/Documents/Explore/what-to-eat
git checkout develop
git push origin develop
```

---

### 执行阶段2: 创建并运行Spec 4-5（Day 4-7）

#### Step 8: 基于develop创建Spec 4-5

```bash
cd /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend

# 确保基于develop分支（包含Spec 2的接口）
cd /Users/jesseqin/Documents/Explore/what-to-eat
git checkout develop
cd /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend

# Spec 4: 菜谱详情
python spec_runner.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --task "创建菜谱详情页RecipeDetail.vue（全屏，含主图/食材/步骤/技巧/营养/操作栏）和RecipeCardCompact.vue（紧凑列表卡片），集成useShare实现原生分享，添加/recipe/:id路由，图片懒加载，页面切换动画" \
  --complexity standard \
  --interactive

# Spec 5: 主页表单
python spec_runner.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --task "重构Home.vue为分步表单：使用useWizard管理3个步骤（StepIngredients/StepCuisine/StepConfirm），添加进度指示器，大按钮（≥44px），步骤动画，保留现有功能（拍照识别/快速选择/菜系网格），底部操作栏避开BottomTabBar" \
  --complexity standard \
  --interactive
```

#### Step 9: 并行运行

```bash
# Terminal 1: 菜谱详情
python run.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --spec 004-recipe-detail-page

# Terminal 2: 主页表单
python run.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --spec 005-home-wizard-refactor
```

#### Step 10: 测试并合并

```bash
# 测试Spec 4
cd /Users/jesseqin/Documents/Explore/what-to-eat/.worktrees/auto-claude-004-recipe-detail-page
npm run dev
# 访问 http://localhost:5173/recipe/1（假设recipe ID为1）
# 验证全屏详情页、分享功能、图片懒加载

# 测试Spec 5
cd /Users/jesseqin/Documents/Explore/what-to-eat/.worktrees/auto-claude-005-home-wizard-refactor
npm run dev
# 访问 http://localhost:5173/
# 验证分步表单、进度条、步骤切换动画

# 满意后合并
cd /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend
git checkout develop
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 004 --merge
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 005 --merge

cd /Users/jesseqin/Documents/Explore/what-to-eat
git checkout develop
git push origin develop
```

---

### 执行阶段3: 集成和优化（Day 8-10）

#### Step 11: 手动集成（在develop分支）

```bash
cd /Users/jesseqin/Documents/Explore/what-to-eat
git checkout develop

# 1. 集成BottomTabBar到App.vue
# 编辑 src/App.vue
```

```vue
<!-- src/App.vue -->
<template>
  <div class="app-container pb-20">  <!-- 为底部导航留空间 -->
    <GlobalNavigation class="hidden md:block" />  <!-- 桌面端显示 -->

    <main class="min-h-screen">
      <RouterView v-slot="{ Component, route }">
        <Transition :name="route.meta.transition || 'fade'" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>

    <!-- 移动端底部导航 -->
    <BottomTabBar class="md:hidden" />  <!-- 仅移动端显示 -->

    <GlobalNoticeModal />
  </div>
</template>

<script setup lang="ts">
import BottomTabBar from '@/components/BottomTabBar.vue'
// 其他导入...
</script>
```

```bash
# 2. 更新路由配置（添加动画和详情页路由）
# 编辑 src/router/index.ts
```

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { transition: 'fade' }
  },
  {
    path: '/recipe/:id',
    name: 'RecipeDetail',
    component: () => import('@/views/RecipeDetail.vue'),
    meta: { transition: 'slide-up' }
  },
  {
    path: '/today-eat',
    name: 'TodayEat',
    component: () => import('@/views/TodayEat.vue'),
    meta: { transition: 'slide-left' }
  },
  // 其他路由...
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0, behavior: 'smooth' }
  }
})

export default router
```

```bash
# 3. 添加全局触摸优化样式
# 编辑 src/style.css
```

```css
/* src/style.css 添加 */

/* 全局触摸优化 */
* {
  -webkit-tap-highlight-color: transparent;
}

button, a, [role="button"], .clickable {
  touch-action: manipulation;
  user-select: none;
  transition: transform 0.1s ease, opacity 0.1s ease;
}

button:active, a:active, .clickable:active {
  transform: scale(0.95);
  opacity: 0.8;
}

input, textarea {
  user-select: text;
}

/* 页面切换动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active, .slide-left-leave-active {
  transition: transform 0.3s ease;
}
.slide-left-enter-from {
  transform: translateX(100%);
}
.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.3s ease;
}
.slide-up-enter-from {
  transform: translateY(100%);
}
.slide-up-leave-to {
  transform: translateY(-100%);
}

/* iOS safe area */
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

```bash
# 4. 提交集成
git add .
git commit -m "feat: 集成所有PWA优化组件到主应用"
git push origin develop
```

#### Step 12: 性能优化

```bash
# 1. 确保所有路由使用懒加载（上面已完成）
# 2. 检查图片使用loading="lazy"
# 3. 检查依赖是否可以tree-shaking

# 构建并分析
npm run build

# 查看打包体积
ls -lh dist/assets/

# 如果有vite-plugin-compression，启用gzip
# vite.config.ts
```

```typescript
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    vue(),
    compression()  // 启用gzip
  ]
})
```

#### Step 13: 全面测试

```bash
# 1. 开发模式测试
npm run dev
# 访问 http://localhost:5173
# 测试所有功能：
# - 底部导航切换
# - 分步表单流程
# - 菜谱详情页
# - PWA离线功能

# 2. 生产模式测试
npm run build
npm run preview
# 访问 http://localhost:4173

# 3. 移动端模拟测试
# Chrome DevTools > Toggle Device Toolbar
# 测试各种设备：
# - iPhone SE (375x667)
# - iPhone 14 Pro Max (430x932)
# - iPad Air (820x1180)

# 4. PWA审计
# Chrome DevTools > Lighthouse
# 运行PWA审计，目标>90分

# 5. 离线测试
# Application > Service Workers > Offline
# 刷新页面，验证离线可访问
```

#### Step 14: 合并到master并发布

```bash
cd /Users/jesseqin/Documents/Explore/what-to-eat

# 合并develop到master
git checkout master
git merge develop

# 创建tag
git tag v2.0.0-pwa

# 推送
git push origin master --tags

# 部署（根据你的部署流程）
# 例如：
# npm run build
# firebase deploy
# 或 vercel deploy
```

---

## 🔧 故障排除

### 问题1: Auto-Claude找不到项目文件

**症状**:
```
Error: Unable to detect project type
```

**解决**:
```bash
# 手动创建 .auto-claude/project_index.json
cd /Users/jesseqin/Documents/Explore/what-to-eat
mkdir -p .auto-claude
```

```json
{
  "project_type": "single",
  "services": {
    "frontend": {
      "path": ".",
      "tech_stack": ["typescript", "vue", "vite"],
      "port": 5173,
      "dev_command": "npm run dev",
      "test_command": "npm run test",
      "entry_point": "src/main.ts"
    }
  }
}
```

### 问题2: Worktree创建失败

**症状**:
```
fatal: '.worktrees/xxx' already exists
```

**解决**:
```bash
# 清理旧的worktree
cd /Users/jesseqin/Documents/Explore/what-to-eat
git worktree prune
rm -rf .worktrees/auto-claude-xxx

# 重新运行spec
python run.py --spec xxx
```

### 问题3: Spec依赖接口不存在

**症状**:
```
Error: Cannot find module 'useWizard'
```

**解决**:
```bash
# 确保Spec 2已完成并合并
cd /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend
python run.py --spec 002 --qa-status

# 如果未完成，等待完成后：
python run.py --spec 002 --merge

# 然后重新运行依赖的spec
python run.py --spec 005
```

### 问题4: QA一直失败

**症状**:
```
QA Status: rejected (3 attempts)
```

**解决**:
```bash
# 1. 查看QA报告
cd /Users/jesseqin/Documents/Explore/what-to-eat/.auto-claude/specs/xxx
cat qa_report.md
cat QA_FIX_REQUEST.md

# 2. 手动修复（在worktree中）
cd /Users/jesseqin/Documents/Explore/what-to-eat/.worktrees/auto-claude-xxx
# 修复问题
git add .
git commit -m "fix: 解决QA问题"

# 3. 重新运行QA
cd /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend
python run.py --spec xxx --qa
```

### 问题5: 合并冲突

**症状**:
```
CONFLICT (content): Merge conflict in src/App.vue
```

**解决**:
```bash
# 1. 查看冲突
cd /Users/jesseqin/Documents/Explore/what-to-eat
git status

# 2. 手动解决（Auto-Claude会尝试自动解决，但有时需要人工）
# 编辑冲突文件
nano src/App.vue

# 3. 标记为已解决
git add src/App.vue
git commit -m "merge: 解决来自auto-claude/xxx的冲突"
```

---

## 📊 预期成果

### 时间线总结

| 阶段 | 任务 | 时间 | 累计 |
|------|------|------|------|
| **准备** | 设置Auto-Claude + 定义接口 | 0.5天 | 0.5天 |
| **阶段1** | 并行Spec 1-3（PWA/Composables/导航） | 2天 | 2.5天 |
| **阶段2** | 并行Spec 4-5（详情页/主页） | 3天 | 5.5天 |
| **阶段3** | 集成 + 优化 + 测试 | 2.5天 | 8天 |
| **总计** | | **8天** | |

**对比单线程**: 15-20天 → **节省 40-60%时间**

### 交付物清单

#### 1. PWA基础设施 ✅
- [x] manifest.json
- [x] Service Worker (sw.js)
- [x] 应用图标（9个尺寸）
- [x] index.html PWA meta标签
- [x] main.ts SW注册

#### 2. Composables工具库 ✅
- [x] useWizard.ts
- [x] useSwipe.ts, useLongPress.ts
- [x] useShare.ts
- [x] usePWAInstall.ts
- [x] haptics.ts

#### 3. 底部导航系统 ✅
- [x] BottomTabBar.vue
- [x] TabItem.vue
- [x] iOS safe-area支持
- [x] 响应式适配

#### 4. 菜谱详情页 ✅
- [x] RecipeDetail.vue（全屏）
- [x] RecipeCardCompact.vue（紧凑）
- [x] /recipe/:id 路由
- [x] 原生分享集成
- [x] 图片懒加载

#### 5. 主页分步表单 ✅
- [x] Home.vue重构
- [x] StepIngredients.vue
- [x] StepCuisine.vue
- [x] StepConfirm.vue
- [x] 进度指示器
- [x] 步骤动画

#### 6. 集成和优化 ✅
- [x] App.vue集成
- [x] 路由动画配置
- [x] 全局触摸样式
- [x] 性能优化
- [x] PWA Lighthouse >90

---

## 🎓 最佳实践总结

### DO ✅

1. **提前定义接口** - 在develop分支预先定义所有TypeScript类型
2. **一次一批** - 不要同时运行超过5个spec
3. **渐进式合并** - 每完成一批就合并到develop
4. **测试每个worktree** - 在合并前在worktree中手动验证
5. **使用develop作为集成分支** - 保持master干净
6. **信任QA流程** - 让Auto-Claude的QA自动运行
7. **清理worktrees** - 定期运行`git worktree prune`

### DON'T ❌

1. **不要跳过spec创建** - 即使任务简单，也要创建spec（可追踪）
2. **不要直接修改worktree中的代码** - 让agent自主工作
3. **不要忽略QA_FIX_REQUEST.md** - 这是重要的反馈
4. **不要在spec未完成时合并** - 等待QA通过
5. **不要过度并行** - 考虑依赖关系
6. **不要忘记推送develop** - 其他spec可能依赖

---

## 🚀 快速开始命令集合

```bash
# ========== 环境设置 ==========
cd /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend
uv venv && uv pip install -r requirements.txt
cp .env.example .env
# 编辑.env添加CLAUDE_CODE_OAUTH_TOKEN和OPENAI_API_KEY

# ========== 项目准备 ==========
cd /Users/jesseqin/Documents/Explore/what-to-eat
git checkout -b develop && git push -u origin develop
# 编辑 src/types/index.ts 添加接口
git add . && git commit -m "feat: 添加PWA接口定义" && git push

# ========== 创建Spec 1-3 ==========
cd /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend
python spec_runner.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --task "PWA基础..." --interactive
python spec_runner.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --task "Composables..." --interactive
python spec_runner.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --task "底部导航..." --interactive

# ========== 并行运行 ==========
# Terminal 1-3分别运行：
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 001
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 002
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 003

# ========== 测试和合并 ==========
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 001 --review
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 001 --merge
# 重复002, 003

# ========== 创建Spec 4-5 ==========
python spec_runner.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --task "菜谱详情..." --interactive
python spec_runner.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --task "主页表单..." --interactive

# ========== 运行并合并 ==========
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 004
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 005
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 004 --merge
python run.py --project-dir /Users/jesseqin/Documents/Explore/what-to-eat --spec 005 --merge

# ========== 手动集成 ==========
cd /Users/jesseqin/Documents/Explore/what-to-eat
git checkout develop
# 编辑 App.vue, router/index.ts, style.css
git add . && git commit -m "feat: 集成PWA组件"

# ========== 测试和发布 ==========
npm run build && npm run preview
# Lighthouse PWA审计
git checkout master && git merge develop
git tag v2.0.0-pwa && git push origin master --tags
```

---

**准备好开始了吗？** 🚀

运行第一个命令来设置环境，然后按照上面的流程一步步执行！

如果有任何问题，参考"故障排除"章节或查看Auto-Claude的日志：
```bash
tail -f /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend/.auto-claude/logs/latest.log
```

祝您开发顺利！✨
