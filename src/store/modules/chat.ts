import { defineStore } from "pinia";
import { router } from "@/router";
import { ss } from "@/utils/storage";

// 根据首条消息生成会话标题：优先文字，纯附件消息用附件类型兜底，避免左侧列表出现空标题
function buildTitle(chat: Chat.Chat): string {
  const text = chat.text?.trim()
  if (text) return text.substring(0, 50)
  const imgCount = chat.images?.length || 0
  const fileCount = chat.files?.length || 0
  if (imgCount && fileCount) return '[图片 + 文件]'
  if (imgCount) return '[图片]'
  if (fileCount) {
    const name = chat.files?.[0]?.name || ''
    return name ? `[文件] ${name}` : '[文件]'
  }
  return '新建会话'
}

// 缓存写入防抖计时器：流式输出期间高频更新时合并写，避免每条 chunk 都全量序列化整个 store
let recordTimer: ReturnType<typeof setTimeout> | null = null

export const useChatStore = defineStore("chat-store", {
  state: (): Chat.ChatState => {
    const uuid = 1002;
    const localState = ss.get("chatStore");
    return {
      ...{
        history: [], // 历史对话列表
        active: uuid, // 当前对话id
        chat: [{ uuid, data: [] }], // 对话数据
        usingContext: true, // 开启多轮对话
      },
      ...localState,
    };
  },
  getters: {
    getChatHistoryByCurrentActive(state: Chat.ChatState) {
      const index = state.history.findIndex(
        (item) => item.uuid === state.active
      );
      if (index !== -1) return state.history[index];
      return null;
    },
    // 根据id获取对话信息
    getChatByUuid(state: Chat.ChatState) {
      return (uuid?: number) => {
        if (uuid) {
          return state.chat.find((item) => item.uuid === uuid)?.data ?? [];
        } else {
          return (
            state.chat.find((item) => item.uuid === state.active)?.data ?? []
          );
        }
      };
    },
  },
  actions: {
    createNewChat() {
      this.active = 1002;
      this.reloadRoute('');
    },
    addHistory(history: Chat.History, chatData: Chat.Chat[] = []) {
      this.history.unshift(history);
      this.chat.unshift({ uuid: history.uuid, data: chatData });
      this.active = history.uuid;
      this.reloadRoute(history.uuid);
    },
    deleteHistory(uuid: number) {
      const index = this.history.findIndex((item) => item.uuid === uuid);
      if (index !== -1) {
        this.history.splice(index, 1);
        this.recordState()
      }
      const chatIndex = this.chat.findIndex((item) => item.uuid === uuid);
      if (chatIndex !== -1) {
        this.chat.splice(chatIndex, 1);
        this.recordState()
      }
      if (this.active === uuid) {
        this.active = 1002;
        this.reloadRoute('');
      }
    },
    updateHistory(uuid: number, edit: Partial<Chat.History>) {
      const index = this.history.findIndex((item) => item.uuid === uuid);
      if (index !== -1) {
        this.history[index] = { ...this.history[index], ...edit };
        this.recordState()
      }
    },
    async setActive(uuid: number | undefined) {
      this.active = uuid || 1002;
      return await this.reloadRoute(uuid);
    },
    async reloadRoute(uuid?: number | '') {
      this.recordState()
      await router.push({ name: "Chat", params: { uuid } });
    },
    // 根据uuid添加对话
    addChatByUuid(uuid: number, chat: Chat.Chat) {
      if (!uuid || uuid === 0) {
        if (this.history.length === 0) {
          const uuid = Date.now();
          this.history.push({ uuid, title: buildTitle(chat), isEdit: false, visible: false });
          this.chat.push({ uuid, data: [chat] });
          this.active = uuid;
          this.recordState()
        } else {
          this.chat[0].data.push(chat);
          if (this.history[0].title === "新建会话")
            this.history[0].title = buildTitle(chat);
          this.recordState()
        }
      }
      const index = this.chat.findIndex((item) => item.uuid === uuid);
      if (index !== -1) {
        this.chat[index].data.push(chat);
        if (this.history[index].title === "新建会话")
          this.history[index].title = buildTitle(chat);
        this.recordState()
      }
    },
    updateChatByUuid(uuid: number, index: number, chat: Chat.Chat) {
      if (!uuid || uuid === 0) {
        if (this.chat.length) {
          if (this.chat[0].data[index].reasoning == "思考中...") {
            this.chat[0].data[index].reasoning = "";
          }
          if(chat.reasoning) {
            chat.reasoning = this.chat[0].data[index].reasoning! + chat.reasoning;
          }
          if (chat.text) {
            chat.text = this.chat[0].data[index].text! + chat.text
          }
          const newChat = {
            ...this.chat[0].data[index],
            ...chat,
          };
          this.chat[0].data[index] = newChat;
          this.scheduleRecord()
        }
        return;
      }

      const chatIndex = this.chat.findIndex((item) => item.uuid === uuid);
      if (chatIndex !== -1) {
        if (this.chat[chatIndex].data[index].reasoning == "思考中...") {
          this.chat[chatIndex].data[index].reasoning = "";
        }
        if(chat.reasoning) {
          chat.reasoning = this.chat[chatIndex].data[index].reasoning! + chat.reasoning;
        }
        if (chat.text) {
          chat.text = this.chat[chatIndex].data[index].text! + chat.text
        }
        const newChat = {
          ...this.chat[chatIndex].data[index],
          ...chat,
        };
        this.chat[chatIndex].data[index] = newChat;
        this.scheduleRecord()
      }
    },
    recordState() {
      ss.set("chatStore", this.$state);
    },
    // 防抖写入：用于流式高频更新场景，合并多次写为一次
    scheduleRecord() {
      if (recordTimer) return
      recordTimer = setTimeout(() => {
        recordTimer = null
        this.recordState()
      }, 500)
    },
    // 设置：是否默认开启多轮上下文
    setUsingContext(value: boolean) {
      this.usingContext = value
      this.recordState()
    },
    // 清空所有本地聊天记录，回到新建对话
    clearChats() {
      if (recordTimer) {
        clearTimeout(recordTimer)
        recordTimer = null
      }
      this.history = []
      this.chat = [{ uuid: 1002, data: [] }]
      this.active = 1002
      this.recordState()
      this.reloadRoute('')
    },
    // 导入聊天记录（JSON 备份恢复）
    importChats(data: Chat.ChatState) {
      if (!data || !Array.isArray(data.history) || !Array.isArray(data.chat))
        throw new Error('备份文件格式不正确')
      this.history = data.history
      this.chat = data.chat
      this.active = data.active ?? 1002
      this.usingContext = data.usingContext ?? true
      this.recordState()
    },
  },
});
