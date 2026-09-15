# 聚玻明视 - AI 助手（Vue3 DeepSeek Chat）

面向玻璃检测场景的 AI 助手 Web 前端。整体采用「玻璃拟态 + 深色主题」的视觉风格，内置**双后端切换**：

- **DeepSeek**：直连 OpenAI 兼容网关（`/v1/chat/completions`），通用对话，SSE 流式逐字输出，支持思维链（`reasoning_content`）展示；
- **玻璃智能体**：对接 `glass-inspection-agent-server`（FastAPI + LangGraph）智能体服务，支持**部门知识库问答**、**检测数据查询与图表/看板**、**图片 / 文档多模态上传**，并实时可视化每一步执行过程。

> 技术栈：Vue 3.5 + TypeScript + Vite 6 + Pinia + Element Plus + ECharts + UnoCSS + Markdown-it（KaTeX / Mermaid / highlight.js）。

---

## 功能特性

- **双后端一键切换**：输入框下方可切「DeepSeek / 玻璃智能体」，选择持久化到本地，刷新后保留；
- **流式输出与打断**：SSE 逐字/逐帧输出，可随时中止生成；DeepSeek 模式渲染思考过程（reasoning），智能体模式渲染各节点执行轨迹；
- **智能体过程可视化**：将 LangGraph 节点（路由识别 → 参数解析 → 数据执行 → 数据分析…）以「思考过程」形式折叠展示；
- **意图标签**：知识问答 / 数据分析 / 闲聊，按智能体返回的 `intent` 着色显示；
- **图表与 KPI 看板**：基于 ECharts 渲染智能体返回的图表配置，支持单图与「layout=dashboard」的多图看板（KPI 卡片 + 弹性网格子图），并内置主题适配；
- **多模态附件**：玻璃智能体支持上传多张图片与多个文档（md / txt / pdf / docx / pptx / xlsx），与文字一并发送；消息气泡内图片可点击放大、文档以卡片展示；
- **AI 回复下载**：单条回复可导出为自包含 HTML（Markdown + ECharts 图表保留交互），离线可直接打开；
- **富文本渲染**：Markdown、代码块（高亮 + 一键复制）、LaTeX（KaTeX）、Mermaid 流程图；
- **会话管理**：新建 / 重命名 / 删除会话，多会话历史持久化到浏览器本地，刷新不丢失；
- **多轮上下文**：开关多轮对话，开启后携带前文历史；
- **主题切换**：暗色（默认）/ 亮色，随系统与本地偏好初始化，无首屏闪烁；
- **玻璃拟态 UI**：半透明毛玻璃面板、渐变品牌色、悬浮发送按钮（光扫动画）、侧边栏可收起/视口自适应；
- **建议话题**：空态展示部门问答 / 数据类示例问题，点击直达。

---

## 环境要求

- Node.js 18+（推荐 20 / 22 LTS）
- 包管理器：`pnpm`（推荐）或 `npm`

## 快速开始

```bash
# 1. 安装依赖
pnpm install
# 或 npm install

# 2. 复制环境变量并填写
#    仓库已内置 .env 示例值，按需修改（见下方“环境变量”）
cp .env .env.local   # 可选：开发环境覆盖

# 3. 启动开发服务器（端口 3002，自动打开浏览器）
pnpm dev
# 或 npm run dev

# 4. 生产构建与预览
pnpm build        # vue-tsc 类型检查 + vite build
pnpm preview
```

> 开发模式下 `/api`、`/agent` 请求由 Vite 代理转发，无需前端跨域配置（见 vite.config.ts）。

## 环境变量

编辑项目根目录 `.env`（或新建 `.env.local` 覆盖）：

```bash
# axios / fetch 请求统一前缀
VITE_APP_BASE_API=/api

# DeepSeek（OpenAI 兼容）网关地址与密钥
VITE_APP_API_BASE_URL=https://newapi.jubocloud.com
VITE_APP_API_KEY=sk-xxxxx   # 请替换为你的真实密钥，勿外泄

# 玻璃检测智能体（FastAPI + LangGraph）服务地址
VITE_AGENT_API_BASE_URL=http://127.0.0.1:8000

# 是否支持长回复（会提高模型调用费用）
VITE_GLOB_OPEN_LONG_REPLY=false

# 是否启用 PWA
VITE_GLOB_APP_PWA=false
```

| 变量 | 说明 |
|---|---|
| `VITE_APP_BASE_API` | 接口统一前缀，axios 与 fetch 封装共用 |
| `VITE_APP_API_BASE_URL` | DeepSeek 网关地址（OpenAI 兼容，`/api` 代理目标） |
| `VITE_APP_API_KEY` | DeepSeek 网关密钥，以 `Authorization: Bearer` 下发（登录等标 `no-auth` 的请求除外） |
| `VITE_AGENT_API_BASE_URL` | 玻璃检测智能体服务地址（`/agent` 代理目标，无鉴权、独立地址） |
| `VITE_GLOB_OPEN_LONG_REPLY` | 长回复开关 |
| `VITE_GLOB_APP_PWA` | PWA 开关 |

### 代理规则（vite.config.ts）

| 前端路径 | 目标 | 行为 |
|---|---|---|
| `/api/*` | `VITE_APP_API_BASE_URL` | 去掉 `/api` 前缀后转发，即 DeepSeek 真实路径需以站点接口为准（当前实测为 `/v1/chat/completions`） |
| `/agent/*` | `VITE_AGENT_API_BASE_URL` | 去掉 `/agent` 前缀后转发，即 `/agent/api/chat/stream` → `{agent}:8000/api/chat/stream` |

> ⚠️ `.env` 含网关密钥，请勿提交到公开仓库；如仓库已跟踪 `.env`，建议执行 `git rm --cached .env` 并加入 `.gitignore`，改用 `.env.local` 维护本地差异。

## 接口约定

### DeepSeek（src/api/chat.ts）

- `chatCompletions(stream, messages)`：POST `/v1/chat/completions`，`model=deepseek-v4-flash`、`stream=true`；
- 支持 `choices[].delta.content`（正文）与 `choices[].delta.reasoning_content`（思维链）；
- 可用模型可通过网关 `GET /v1/models` 实时查询。

### 玻璃智能体（src/api/agent.ts）

| 接口 | 说明 |
|---|---|
| `agentChat(message, threadId)` | 一问一答（非流式）：返回 `{ intent, answer, chart }`，适合一次性问答、大屏摘要 |
| `agentChatStream(q, threadId, signal)` | SSE 流式：逐节点推送，每帧形如 `data: {"<节点名>": {<增量>}}`，`[DONE]` 结束 |
| `agentChatUpload(message, threadId, { images, files }, signal)` | 多模态 multipart 上传：图片 + 文档一次性发送，非流式返回 `{ intent, answer, chart }` |

流式帧字段约定（前端解析逻辑位于 `src/views/chat/index.vue`）：

| 字段 | 含义 |
|---|---|
| `intent` | 意图标签，映射为徽标：`qa` 知识问答 / `data` 数据分析 / `chat` 闲聊 |
| `final_answer` | 最终回答（Markdown 正文） |
| `chart_config` | ECharts 图表配置（`layout=dashboard` 时为 KPI + 多子图看板） |
| 其余字段 | 归入「思考过程」，如 `router` 路由识别、`data_parse` 参数解析、`data_execute` 数据执行、`data_analyze` 数据分析、`report_generate` 报告生成 |

---

## 目录结构

```text
vue3-deepseek-chat
├─ index.html                 # 入口 HTML（主题预初始化，防闪烁）
├─ vite.config.ts             # Vite 配置：/api、/agent 代理 / 自动按需引入
├─ uno.config.ts              # UnoCSS（class 模式暗色）
├─ auto-imports.d.ts          # 自动导入类型（生成物）
├─ components.d.ts            # 组件自动注册类型（生成物）
├─ src
│  ├─ main.ts                 # 启动：Store → 主题初始化 → Router → 挂载
│  ├─ App.vue                 # 根组件（仅 RouterView）
│  ├─ api                     # 接口封装
│  │  ├─ agent.ts             #   玻璃智能体：一问一答 / SSE 流式 / 多模态上传
│  │  ├─ chat.ts              #   OpenAI 兼容对话（/v1/chat/completions）
│  │  └─ login.ts             #   登录（占位实现）
│  ├─ router/index.ts         # 路由：/chat/:uuid?、/login、/404
│  ├─ store                   # Pinia
│  │  ├─ helper.ts            #   createPinia
│  │  └─ modules
│  │     ├─ app.ts            #   主题 / 后端类型 / 侧边栏 / token
│  │     └─ chat.ts           #   会话列表、消息、上下文开关（本地持久化）
│  ├─ views
│  │  ├─ chat                 # 聊天主界面
│  │  │  ├─ index.vue         #   消息区 + 输入区 + 双后端流式逻辑
│  │  │  ├─ hooks             #   useChat / useReadStream / useScroll
│  │  │  ├─ layout            #   布局：Layout.vue、侧边栏 sider（会话列表/主题）、header
│  │  │  └─ components/Message
│  │  │     ├─ index.vue      #   单条消息：头像 / 时间 / 意图徽标
│  │  │     ├─ Text.vue       #   Markdown/KaTeX/Mermaid/代码高亮渲染 + 思考过程折叠
│  │  │     ├─ Chart.vue      #   ECharts 单图 / KPI 多图看板
│  │  │     └─ style.scss
│  │  ├─ login.vue            # 登录页（占位）
│  │  └─ exception            # 404 / 500 异常页
│  ├─ components              # 全局通用组件
│  ├─ utils
│  │  ├─ request              # axios 实例（Bearer 注入）/ fetch 封装 / 请求源
│  │  ├─ storage/index.ts     #   带过期时间的 localStorage 封装（ls / ss）
│  │  ├─ chartTheme.ts        #   ECharts 主题叠加（适配暗/亮色）
│  │  ├─ exportHtml.ts        #   AI 回复导出为自包含 HTML
│  │  └─ copy.ts              #   复制到剪贴板
│  ├─ types                   # chat.d.ts（全局类型）/ env.d.ts / vite-env.d.ts
│  ├─ styles                  # 全局样式（主题变量、玻璃拟态、暗色变量）
│  └─ assets
└─ public
```

## 本地存储键位（便于排查）

| key | 存储 | 内容 |
|---|---|---|
| `chatStore` | localStorage | 会话历史与消息数据 |
| `app-theme` | localStorage | 主题：`light` / `dark` |
| `chat-backend` | localStorage | 当前后端：`deepseek` / `agent` |
| `siderCollapsedApp` / `tokenApp` | localStorage | 侧边栏折叠偏好 / 登录 token |
| `chatSubmitPrompt` | localStorage | 新建会话时暂存的待发送输入 |

## 常见问题

- **发送后无响应 / 500**：先确认浏览器 Network 中代理落点是否可达 —— DeepSeek 看 `/v1/chat/completions` 是否 401/超时（检查 `VITE_APP_API_KEY`）；玻璃智能体看 `VITE_AGENT_API_BASE_URL` 服务是否启动、`/health` 是否 200。
- **智能体无图表返回**：确认后端 `data` 相关节点已执行且有 `chart_config` 帧；图表组件兼容单图与 `layout=dashboard` 两种结构。
- **修改 `.env` 不生效**：环境变量在 Vite 启动时读取，修改后需重启 `pnpm dev`。

## 关联项目

- 玻璃检测智能体服务端（本前端「玻璃智能体」后端）：`glass-inspection-agent-server`（FastAPI + LangGraph），知识库问答 / 数据查询 / 报告生成。
