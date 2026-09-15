declare namespace Chat {

	/** 用户消息附带的上传文件元数据（用于历史展示） */
	interface AttachmentFile {
		/** 文件名 */
		name: string
		/** 文件大小（字节） */
		size?: number
	}

	interface Chat {
		dateTime?: string
		text?: string
		reasoning?: string
		reasoningTime?: string
		inversion?: boolean
		error?: boolean
		loading?: boolean
		intent?: string
		chart?: any
		/** 用户消息附带的图片（缩略 dataURL，用于消息气泡展示） */
		images?: string[]
		/** 用户消息附带的文档附件（元数据，用于消息气泡展示） */
		files?: AttachmentFile[]
	}

	interface History {
		title?: string
		isEdit: boolean
		uuid: number
		visible: boolean
	}

	interface ChatState {
		active: number | null
		usingContext: boolean;
		history: History[]
		chat: { uuid: number; data: Chat[] }[]
	}

	interface ConversationRequest {
		conversationId?: string
		parentMessageId?: string
	}
	interface ConversationMessage {
		role: string
		content: string
	}
	interface ConversationResponse {
		model: string
		messages: ConversationMessage[]
		stream: boolean
		stream_options: {
			include_usage: boolean
		}
	}
}
