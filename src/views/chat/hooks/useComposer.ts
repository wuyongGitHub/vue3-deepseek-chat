/** 待发送附件（输入区预览；真实 File 走 multipart 上传） */
export interface PendingAttachment {
  uid: string
  kind: 'image' | 'file'
  name: string
  size: number
  type: string
  file: File
  thumbUrl?: string // 图片本地预览 objectURL
}

/** 新建会话第一次点击发送时暂存的内容（跨组件重建传递） */
export interface PendingSubmit {
  prompt: string
  attachments: PendingAttachment[]
}

/**
 * 模块级暂存：新建会话第一次点击发送会先创建会话并跳转路由，
 * 路由跳转导致 Chat 组件因 key 变化被销毁重建，本地 ref（文字、附件）全部丢失。
 * File 对象无法序列化进 localStorage，因此用内存变量在组件实例间传递。
 */
let pendingSubmit: PendingSubmit | null = null

export function setPendingSubmit(data: PendingSubmit) {
  pendingSubmit = data
}

export function takePendingSubmit(): PendingSubmit | null {
  const data = pendingSubmit
  pendingSubmit = null
  return data
}
