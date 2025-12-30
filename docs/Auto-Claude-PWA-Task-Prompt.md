# Auto-Claude PWA 转换任务 Prompt

> 用于Auto-Claude自动创建PWA移动端优化任务的完整prompt
>
> **使用方式**: 复制下面的完整prompt，粘贴到Auto-Claude的交互式创建流程中

---

## 📝 完整任务描述 Prompt

```
将Vue 3美食菜谱生成应用"一饭封神"转换为Progressive Web App (PWA)，实现原生移动应用级别的用户体验，同时保持所有现有功能不变。

【项目背景】
当前应用是一个桌面优先的网页应用，使用Vue 3.4 + TypeScript + Vite + Tailwind CSS构建。主要功能包括：
- AI驱动的菜谱生成（基于食材、菜系、自定义要求）
- 美食盲盒（随机推荐）
- 满汉全席（多菜推荐）
- 我的收藏管理
- 封神图鉴

虽然已有基础响应式设计（Tailwind断点），但整体UI/UX仍然是桌面思维，移动端体验不佳。

【核心目标】
将应用转换为可安装的PWA，用户体验要达到原生移动应用水平，包括：
1. 可以添加到手机主屏幕，像原生app一样独立窗口打开
2. 支持离线访问（静态资源缓存）
3. UI/UX完全适配移动端交互习惯
4. 触摸操作流畅，无误触
5. 加载快速，动画流畅（60fps）

【技术要求】

1. PWA核心功能
   - 创建完整的manifest.json（应用名称、图标、主题色、启动模式）
   - 实现Service Worker，采用分层缓存策略：
     * Cache First: 静态资源（JS/CSS/字体/图标）
     * Network First: API请求（OpenRouter AI调用）
     * Stale While Revalidate: 菜谱图片
   - 生成各尺寸应用图标：72x72, 96x96, 128x128, 144x144, 192x192, 384x384, 512x512
   - 生成maskable图标（192x192, 512x512）用于Android自适应
   - iOS特殊支持：apple-touch-icon, apple-mobile-web-app-capable meta标签
   - 在index.html添加所有必需的PWA meta标签
   - 在main.ts注册Service Worker并处理更新通知

2. 移动端导航系统重构
   【当前问题】
   - 顶部导航在小屏幕占用过多空间
   - 横向滚动标签不够直观
   - 次要功能挤占主导航

   【改进方案】
   - 创建底部Tab Bar导航（固定在屏幕底部）
   - 4个主要Tab：🏠生成、🎲盲盒、🍽️满汉、❤️收藏
   - 支持iOS安全区域（safe-area-inset-bottom）
   - 响应式：移动端显示底部导航，桌面端（≥768px）隐藏
   - 精简顶部导航：仅保留Logo和设置按钮（移动端）
   - Tab切换带流畅动画
   - 当前路由Tab高亮显示

3. 主页面交互优化（菜谱生成流程）
   【当前问题】
   - 4个步骤在一屏展示，移动端需要大量滚动
   - Step 2/3网格在小屏体验差
   - 按钮间距小容易误触
   - 自定义输入框太小

   【改进方案】
   - 重构为分步表单（Wizard模式），每次只显示一个步骤
   - Step 1: 食材选择（全屏焦点）
     * 已选食材列表（大标签，易于删除）
     * 食材输入框（大尺寸，py-4）
     * 快速选择网格（大按钮，≥44x44px）
     * 拍照识别按钮（直接调用相机：capture="environment"）

   - Step 2: 菜系选择（全屏卡片）
     * 中华八大菜系大卡片网格（2列，大触摸区域）
     * 国际菜系网格
     * 或自定义要求（场景/口味预设大按钮）

   - Step 3: 确认生成（配置预览）
     * 显示选中的食材和菜系
     * 大号"开始生成"按钮

   - 顶部进度指示器（固定）
   - 步骤切换动画（slide-fade）
   - 底部操作按钮（[上一步] [下一步]/[生成]）
   - 底部按钮避开BottomTabBar（pb-24）
   - 表单状态保存（localStorage，避免刷新丢失）

4. 菜谱展示优化
   【当前问题】
   - RecipeCard信息密集，移动端难以快速浏览
   - "展开步骤"交互不够明显

   【改进方案】
   - 列表视图使用紧凑卡片（RecipeCardCompact）：
     * 缩略图（80x80）+ 菜名 + 元信息（一行）
     * 食材预览（前3个 + "+N"）
     * 右侧"查看详情→"按钮

   - 点击卡片 → 全屏详情页（新路由：/recipe/:id）：
     * 顶部固定导航（← 返回 + 标题 + ⋮ 更多）
     * 主图区域（高度256px，带悬浮标签：菜系/时间/难度）
     * 食材清单（网格2列）
     * 烹饪步骤（大序号 + 步骤文字）
     * 烹饪技巧（可折叠）
     * 营养分析（可折叠）
     * 底部固定操作栏（[❤️ 收藏] [分享]）

   - 实现原生分享API：
     * 使用navigator.share（如果支持）
     * 降级方案：复制链接到剪贴板

   - 图片懒加载：
     * 使用loading="lazy"
     * 响应式srcset（提供400w, 800w两个尺寸）
     * 占位符（低质量模糊图 → 高清图渐入）

5. 手势操作
   - 左滑删除（收藏列表中）：
     * 检测左滑手势（阈值100px）
     * 显示删除确认
     * 带删除动画

   - 长按显示菜单（菜谱卡片）：
     * 长按500ms触发
     * 振动反馈（50ms）
     * 显示操作菜单：编辑备注/重新生成图片/删除

   - 下拉刷新（可选，列表页面）

   - 使用@vueuse/core库的useSwipe等composables

6. 触摸体验优化
   - 所有可点击元素最小尺寸44x44px（Apple HIG标准）
   - 按钮按下视觉反馈：
     * :active { transform: scale(0.95); opacity: 0.8; }
     * 禁用tap-highlight-color

   - 波纹效果（Material Design风格，可选）

   - 振动反馈（使用Navigator Vibration API）：
     * 轻触：10ms
     * 中等：20ms
     * 重要操作：50ms
     * 成功：[10, 50, 10]
     * 错误：[50, 100, 50]

   - 禁用长按菜单（-webkit-touch-callout: none，需要时单独启用）
   - 防止双击缩放（touch-action: manipulation）

7. 页面切换和动画
   - 路由过渡动画：
     * fade: 默认（淡入淡出，200ms）
     * slide-left: 前进（从右滑入，300ms）
     * slide-up: 详情页（从下滑入，300ms）

   - 所有动画使用transform（硬件加速）
   - 目标帧率：60fps
   - 禁用动画（prefers-reduced-motion媒体查询）

8. 性能优化
   - 路由懒加载（所有页面组件使用动态import）
   - 组件异步加载（非关键组件使用defineAsyncComponent）
   - 图片优化：
     * 懒加载
     * 响应式尺寸
     * WebP格式（带降级）

   - 虚拟滚动（如果收藏列表>50项，使用@tanstack/vue-virtual）
   - Code splitting（vendor chunk分离）
   - CSS优化（PurgeCSS移除未使用的Tailwind类）
   - 字体优化：
     * font-display: swap
     * 预加载关键字体

9. 响应式断点优化
   当前仅有144个md:断点，需要完善：
   - xs: 375px（小屏手机，iPhone SE）
   - sm: 640px（大屏手机）
   - md: 768px（平板竖屏）
   - lg: 1024px（平板横屏/小桌面）
   - xl: 1280px（桌面）

   移动优先原则：
   - 默认样式为手机（<640px）
   - 使用sm:及以上的断点逐步增强

10. PWA安装体验
    - 实现"添加到主屏幕"提示组件（InstallPrompt.vue）：
      * 监听beforeinstallprompt事件
      * 延迟5秒显示（避免打扰）
      * 优雅的卡片设计（底部悬浮）
      * [立即安装] [稍后] 按钮
      * 记住用户选择（1周后再提示）

    - 检测安装状态：
      * 如果已安装（display-mode: standalone），不显示提示

    - iOS特殊处理（Safari不支持beforeinstallprompt）：
      * 检测iOS Safari
      * 显示手动安装说明："点击分享按钮 → 添加到主屏幕"

【必须保持不变的功能】
✓ AI菜谱生成功能（OpenRouter GPT-4o Mini）
✓ AI图片生成功能（OpenRouter Gemini 2.5 Flash Image）
✓ 拍照识别食材功能
✓ 美食盲盒随机推荐
✓ 满汉全席多菜推荐
✓ 收藏管理（localStorage）
✓ 封神图鉴
✓ 设置面板（模型配置）
✓ 所有现有的AI提示词逻辑
✓ 现有的路由结构（可以新增，不要删除）

【UI/UX改进清单】
从桌面思维 → 移动优先思维：

| 维度 | 当前（桌面） | 改为（移动） |
|------|-------------|-------------|
| 导航位置 | 顶部 | 底部Tab Bar |
| 内容布局 | 多列并排 | 单列滚动 |
| 表单流程 | 一屏展示 | 分步引导 |
| 卡片详情 | 展开/收起 | 全屏页面 |
| 按钮尺寸 | 可小（鼠标精确） | ≥44x44px |
| 交互反馈 | Hover | Active + 振动 |
| 操作触发 | 点击 | 点击 + 手势 |
| 图片加载 | 全部加载 | 懒加载 |
| 页面切换 | 无动画 | 流畅动画 |

【验收标准】

1. PWA基础功能
   - [ ] 可以添加到手机主屏幕（Android Chrome, iOS Safari）
   - [ ] 独立窗口打开（无浏览器地址栏）
   - [ ] 静态资源可离线访问
   - [ ] Lighthouse PWA审计评分 ≥ 95

2. 性能指标
   - [ ] Lighthouse Performance ≥ 90
   - [ ] First Contentful Paint (FCP) < 1.5s
   - [ ] Largest Contentful Paint (LCP) < 2.5s
   - [ ] Time to Interactive (TTI) < 3s
   - [ ] 打包体积 < 500KB (gzipped)

3. 移动端体验
   - [ ] 所有可点击元素 ≥ 44x44px
   - [ ] 触摸响应时间 < 100ms
   - [ ] 页面切换动画 60fps
   - [ ] 无水平滚动条（除非设计需要）
   - [ ] 文字可读性：最小字号14px
   - [ ] 在iPhone SE (375px) 到 iPad Pro (1024px) 都正常显示

4. 功能完整性
   - [ ] 所有现有功能正常工作
   - [ ] AI生成速度不受影响
   - [ ] 收藏数据不丢失
   - [ ] 图片生成和显示正常

5. 多设备兼容性
   - [ ] iOS Safari 15+
   - [ ] Android Chrome 90+
   - [ ] 桌面Chrome/Firefox/Safari（响应式降级）
   - [ ] 深色模式适配（可选，使用系统偏好）

6. 用户体验
   - [ ] 首次访问有PWA安装提示
   - [ ] 离线时显示友好提示（而非浏览器默认错误）
   - [ ] 加载状态有骨架屏或进度指示
   - [ ] 操作有即时反馈（按钮状态、振动、动画）
   - [ ] 错误提示清晰友好

【技术栈和约束】
- 框架：Vue 3.4 (Composition API)
- 语言：TypeScript 5.3+
- 构建：Vite 5.0+
- 样式：Tailwind CSS 3.4
- 路由：Vue Router 4.2
- 工具库：@vueuse/core 10.7 (已安装)
- 不要添加新的UI组件库（保持轻量）
- 不要重写现有的AI服务逻辑（aiService.ts, imageService.ts）
- 遵循现有的代码风格和目录结构

【项目结构参考】
src/
├── views/              # 页面组件（可新增RecipeDetail.vue）
├── components/         # UI组件（新增Bottom, Tab, Wizard等组件）
├── composables/        # 新增目录：useWizard, useSwipe, useShare等
├── services/           # 保持不变
├── config/             # 保持不变
├── types/              # 扩展类型定义
├── utils/              # 新增工具函数（haptics.ts等）
└── router/             # 更新路由配置

public/
├── manifest.json       # 新增
├── sw.js              # 新增
└── icons/             # 新增目录

【开发环境】
- Node.js 18+
- 本地开发端口：5173
- 项目路径：/Users/jesseqin/Documents/Explore/what-to-eat
- Git分支策略：使用feature分支，合并前需测试

【特别注意】
1. 不要删除或重写现有的AI调用逻辑
2. 保持现有的数据结构（Recipe类型等）
3. 所有新组件需要TypeScript类型定义
4. 新增的依赖需要说明理由（尽量使用已安装的库）
5. iOS Safari的PWA限制（无推送通知、Service Worker限制50MB）
6. 考虑降级方案（不支持的API要有fallback）

【参考资料】
- PWA最佳实践：https://web.dev/progressive-web-apps/
- Material Design触摸目标：https://m3.material.io/foundations/accessible-design/accessibility-basics
- Apple Human Interface Guidelines：https://developer.apple.com/design/human-interface-guidelines/ios
- Service Worker生命周期：https://web.dev/service-worker-lifecycle/

【期望输出】
请将此任务拆分为合理的phases和subtasks，考虑：
1. 依赖关系（例如：useWizard需要先创建才能被Home.vue使用）
2. 并行可能性（例如：PWA配置和Composables创建可以并行）
3. 风险等级（核心功能改动vs新增组件）
4. 验证方式（浏览器测试、命令行验证、手动检查）

建议workflow_type：feature（这是一个大型多服务功能添加）

【最终目标】
完成后，用户应该能够：
1. 在手机上访问应用，看到"添加到主屏幕"提示
2. 安装后，点击主屏幕图标，像原生app一样打开（无浏览器UI）
3. 享受流畅的移动端体验：大按钮、滑动手势、分步表单、全屏详情
4. 离线时仍能访问已缓存的页面
5. 所有原有功能（AI生成、收藏、盲盒等）完全正常工作

这个改造应该让用户感觉"这就是一个原生移动应用"，而不是"移动网页"。
```

---

## 📖 使用说明

### 方式1: 交互式创建（推荐）

```bash
cd /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend

python spec_runner.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --interactive
```

当提示输入任务描述时，**粘贴上面的完整prompt**。

### 方式2: 直接命令行（简化版）

```bash
python spec_runner.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --task "$(cat /Users/jesseqin/Documents/Explore/what-to-eat/docs/Auto-Claude-PWA-Task-Prompt.md)" \
  --complexity standard
```

### 方式3: 批量创建（如果Auto-Claude支持）

创建 `pwa-tasks.json`:

```json
{
  "tasks": [
    {
      "title": "PWA Mobile Optimization",
      "description": "[粘贴上面的完整prompt]",
      "workflow_type": "feature",
      "complexity": "complex",
      "priority": 10
    }
  ]
}
```

然后运行：
```bash
python run.py --batch-create pwa-tasks.json
```

---

## 🎯 Prompt设计理念

这个prompt包含了：

### ✅ 清晰的结构
- **项目背景**：让AI理解当前状态
- **核心目标**：明确期望结果
- **技术要求**：详细的实现规范（10个方面）
- **保持不变**：明确边界
- **验收标准**：可测量的成功指标

### ✅ 具体的细节
- 不是"优化移动端体验"，而是"底部Tab Bar，4个按钮，支持iOS safe-area"
- 不是"添加手势"，而是"左滑阈值100px，长按500ms，振动50ms"
- 包含具体的文件路径、组件名称、样式类名

### ✅ 技术约束
- 明确已安装的库
- 禁止删除的代码
- 必须遵循的模式
- 降级方案

### ✅ 可验证性
- 每个要求都有对应的验收标准
- 提供具体的测试方法
- 包含性能指标

---

## 🔍 预期Auto-Claude会如何拆分

基于Auto-Claude的Planner逻辑，它可能会这样拆分：

### Phase 1: PWA基础设施（并行安全）
- Subtask: 创建manifest.json
- Subtask: 实现Service Worker
- Subtask: 生成应用图标
- Subtask: 更新index.html和main.ts

### Phase 2: 移动端工具库（并行安全）
- Subtask: 创建useWizard composable
- Subtask: 创建useSwipe/useLongPress
- Subtask: 创建useShare
- Subtask: 创建usePWAInstall
- Subtask: 创建haptics工具

### Phase 3: 底部导航系统（并行安全）
- Subtask: 创建BottomTabBar组件
- Subtask: 创建TabItem组件
- Subtask: 添加iOS safe-area支持

### Phase 4: 主页重构（依赖Phase 2）
- Subtask: 重构Home.vue为Wizard容器
- Subtask: 创建StepIngredients组件
- Subtask: 创建StepCuisine组件
- Subtask: 创建StepConfirm组件

### Phase 5: 菜谱展示优化（依赖Phase 2）
- Subtask: 创建RecipeCardCompact组件
- Subtask: 创建RecipeDetail页面
- Subtask: 添加/recipe/:id路由
- Subtask: 集成分享功能

### Phase 6: 手势和交互（依赖Phase 2, 5）
- Subtask: 实现收藏列表左滑删除
- Subtask: 实现卡片长按菜单
- Subtask: 添加振动反馈

### Phase 7: 性能优化（依赖所有前面）
- Subtask: 路由懒加载
- Subtask: 图片优化（懒加载、srcset）
- Subtask: Code splitting

### Phase 8: 集成和测试（最后）
- Subtask: 集成BottomTabBar到App.vue
- Subtask: 更新全局样式
- Subtask: PWA测试和优化
- Subtask: 性能基准测试

**parallelism分析**:
- Phase 1, 2, 3 可以并行（不同文件，无依赖）
- Phase 4, 5 可以并行（依赖Phase 2完成后）
- Phase 6, 7 需要串行（依赖前面的组件）

---

## ⚡ 下一步

准备好了吗？复制上面的prompt，然后：

```bash
cd /Users/jesseqin/Documents/Explore/Auto-Claude/apps/backend

python spec_runner.py \
  --project-dir /Users/jesseqin/Documents/Explore/what-to-eat \
  --interactive
```

**粘贴prompt → 等待Auto-Claude分析 → 审查生成的implementation_plan.json → 运行！**

祝您好运！🚀
