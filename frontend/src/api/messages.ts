import api from '@/lib/axios'
import type { ApiResponse, PaginatedResponse, Conversation, Message } from '@/types'

export const messagesApi = {
  listConversations: (params: Record<string, unknown> = {}) =>
    api.get<PaginatedResponse<Conversation>>('/conversations', { params }),

  getConversation: (id: number) =>
    api.get<ApiResponse<Conversation>>(`/conversations/${id}`),

  startConversation: (customer_id: number, subject?: string) =>
    api.post<ApiResponse<Conversation>>('/conversations', { customer_id, subject }),

  sendMessage: (conversationId: number, body: string, is_internal = false) =>
    api.post<ApiResponse<Message>>(`/conversations/${conversationId}/messages`, {
      body,
      is_internal,
    }),

  markRead: (conversationId: number) =>
    api.post(`/conversations/${conversationId}/read`),

  assign: (conversationId: number, user_id: number) =>
    api.patch(`/conversations/${conversationId}/assign`, { user_id }),

  close: (conversationId: number) =>
    api.patch(`/conversations/${conversationId}/close`),

  reopen: (conversationId: number) =>
    api.patch(`/conversations/${conversationId}/reopen`),
}
