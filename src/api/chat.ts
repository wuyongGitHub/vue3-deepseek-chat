import request from "@/utils/request";
import fetchRequest from "@/utils/request/fetch";
/** 对话列表数据 */
export interface TypeChatList {
  /** 页码 */
  page: string;
}
// 获取对话列表
export function chatList(params: TypeChatList) {
  return request({
    url: "/v1/chats/?page=1",
    method: "get",
    params,
  });
}

// 发送对话
// 注意：URL 以 /api 开头会走 vite 代理转发到 VITE_APP_API_BASE_URL，
// 因此这里的路径必须是站点 OpenAI 兼容接口的真实路径（如 /v1/chat/completions）。
// 当前站点实测仅支持 /v1/chat/completions，不支持 /compatible-mode/ 前缀。
// 可用模型（GET /v1/models 实时查询）：
//   deepseek-v4-flash / deepseek-v4-pro / MiniMax-M2.7 / MiniMax-M3 ...
export function chatCompletions(stream: AbortSignal ,messages: Chat.ConversationMessage[]) {
  return fetchRequest("/v1/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model: "deepseek-v4-flash",
      messages: messages,
      stream: true,
      stream_options: {
        include_usage: true,
      },
    }),
    signal: stream
  });
}
