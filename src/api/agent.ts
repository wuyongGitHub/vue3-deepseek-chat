/**
 * 玻璃检测部门智能体接口（FastAPI + LangGraph）
 *
 * 说明：
 * 1. 服务无鉴权，且地址独立，因此不经过带 Bearer 的通用封装。
 * 2. 前端请求路径以 /agent 开头，走 Vite 代理转发到 VITE_AGENT_API_BASE_URL。
 */

const AGENT_BASE = "/agent";

/** 智能体意图分类 */
export type AgentIntent = "qa" | "data" | "chat";

/** 非流式对话响应体 */
export interface AgentChatResult {
  intent: AgentIntent;
  answer: string;
  chart: Record<string, any> | null;
}

/**
 * 一问一答（非流式）：返回意图 + 文字答案 + 可选图表。
 * 适用于一次性问答、大屏摘要等场景。
 */
export function agentChat(message: string, threadId: string): Promise<Response> {
  return fetch(`${AGENT_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, thread_id: threadId }),
  });
}

/**
 * 流式对话（SSE）：逐节点推送智能体执行过程。
 * 每帧形如 data: {"<节点名>": {<增量>}}，收到 [DONE] 表示结束。
 * 适合类 ChatGPT 的逐字/逐步输出与「思考过程可视化」。
 */
export function agentChatStream(
  q: string,
  threadId: string,
  signal: AbortSignal,
): Promise<Response> {
  const url = `${AGENT_BASE}/api/chat/stream?q=${encodeURIComponent(
    q,
  )}&thread_id=${encodeURIComponent(threadId)}`;
  return fetch(url, { signal });
}

/**
 * 多模态一站式上传（multipart）：文字 + 多张图片文件 + 多个文档文件同时发送。
 * 后端将图片送入视觉分析流、文档解析后走文件问答流（图片优先）。
 * 非流式：一次性返回 { intent, answer, chart }。
 */
export function agentChatUpload(
  message: string,
  threadId: string,
  attachments: { images: File[]; files: File[] },
  signal?: AbortSignal,
): Promise<Response> {
  const fd = new FormData();
  fd.append("message", message);
  fd.append("thread_id", threadId);
  attachments.images.forEach((f) => fd.append("images", f, f.name));
  attachments.files.forEach((f) => fd.append("files", f, f.name));
  return fetch(`${AGENT_BASE}/api/chat/upload`, {
    method: "POST",
    body: fd,
    signal,
  });
}
