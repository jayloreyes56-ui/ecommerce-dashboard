import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, MessageSquare, CheckCheck, Lock, Unlock } from 'lucide-react'
import { messagesApi } from '@/api/messages'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { cn, formatRelativeTime, truncate } from '@/lib/utils'
import type { Conversation } from '@/types'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'

export default function Messages() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeId, setActiveId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Handle conversation from URL query parameter
  useEffect(() => {
    const conversationId = searchParams.get('conversation')
    if (conversationId) {
      setActiveId(Number(conversationId))
      // Clear the conversation param from URL after applying
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])

  const { data: conversationsData, isLoading: listLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagesApi.listConversations({ per_page: 30 }).then((r) => r.data),
    refetchInterval: 15_000,
  })

  const { data: activeConversation, isLoading: convLoading } = useQuery({
    queryKey: ['conversation', activeId],
    queryFn: () => messagesApi.getConversation(activeId!).then((r) => r.data.data),
    enabled: !!activeId,
    refetchInterval: 10_000,
  })

  const sendMutation = useMutation({
    mutationFn: () => messagesApi.sendMessage(activeId!, message, isInternal),
    onSuccess: () => {
      setMessage('')
      queryClient.invalidateQueries({ queryKey: ['conversation', activeId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: () => toast.error('Failed to send message.'),
  })

  const closeMutation = useMutation({
    mutationFn: (id: number) => messagesApi.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversation', activeId] })
    },
  })

  const reopenMutation = useMutation({
    mutationFn: (id: number) => messagesApi.reopen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversation', activeId] })
    },
  })

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !activeId) return
    sendMutation.mutate()
  }

  const conversations = conversationsData?.data ?? []

  return (
    <PageWrapper title="Messages" subtitle="Customer conversations">
      <div className="flex h-[calc(100vh-10rem)] gap-5 overflow-hidden">
        {/* Conversation List */}
        <Card padding="none" className="flex w-80 shrink-0 flex-col overflow-hidden">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-700">Conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {listLoading ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="mb-2 h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-400">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  active={conv.id === activeId}
                  onClick={() => setActiveId(conv.id)}
                />
              ))
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <Card padding="none" className="flex flex-1 flex-col overflow-hidden">
          {!activeId ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <MessageSquare className="mb-3 h-12 w-12 text-gray-200" />
              <p className="text-sm font-medium text-gray-400">Select a conversation</p>
              <p className="text-xs text-gray-300">Choose from the list on the left</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              {activeConversation && (
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={activeConversation.customer.name} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {activeConversation.customer.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {activeConversation.subject ?? 'No subject'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={activeConversation.status === 'open' ? 'success' : 'default'}
                    >
                      {activeConversation.status}
                    </Badge>
                    {activeConversation.status === 'open' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Lock className="h-3.5 w-3.5" />}
                        onClick={() => closeMutation.mutate(activeConversation.id)}
                        loading={closeMutation.isPending}
                      >
                        Close
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Unlock className="h-3.5 w-3.5" />}
                        onClick={() => reopenMutation.mutate(activeConversation.id)}
                        loading={reopenMutation.isPending}
                      >
                        Reopen
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {convLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeConversation?.messages?.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex gap-3',
                          msg.is_from_staff ? 'flex-row-reverse' : 'flex-row'
                        )}
                      >
                        <Avatar
                          name={msg.sender?.name ?? 'Unknown'}
                          size="sm"
                          className="shrink-0"
                        />
                        <div
                          className={cn(
                            'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm',
                            msg.is_from_staff
                              ? 'rounded-tr-sm bg-brand-600 text-white'
                              : 'rounded-tl-sm bg-gray-100 text-gray-800',
                            msg.is_internal && 'border-2 border-dashed border-amber-300 bg-amber-50 text-amber-800'
                          )}
                        >
                          {msg.is_internal && (
                            <p className="mb-1 text-xs font-semibold text-amber-600">
                              Internal note
                            </p>
                          )}
                          <p className="leading-relaxed">{msg.body}</p>
                          <p
                            className={cn(
                              'mt-1 text-right text-xs',
                              msg.is_from_staff ? 'text-blue-200' : 'text-gray-400'
                            )}
                          >
                            {formatRelativeTime(msg.created_at)}
                            {msg.read_at && msg.is_from_staff && (
                              <CheckCheck className="ml-1 inline h-3 w-3" />
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              {activeConversation?.status === 'open' && (
                <div className="border-t border-gray-100 px-5 py-3">
                  <div className="mb-2 flex items-center gap-3">
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-500">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-amber-500"
                      />
                      Internal note
                    </label>
                  </div>
                  <form onSubmit={handleSend} className="flex gap-2">
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={isInternal ? 'Add an internal note…' : 'Type a message…'}
                      className={cn(
                        'flex-1 rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2',
                        isInternal
                          ? 'border-amber-300 bg-amber-50 focus:ring-amber-300/30'
                          : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500/20'
                      )}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSend(e)
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      size="md"
                      loading={sendMutation.isPending}
                      disabled={!message.trim()}
                      icon={<Send className="h-4 w-4" />}
                    >
                      Send
                    </Button>
                  </form>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </PageWrapper>
  )
}

function ConversationItem({
  conversation,
  active,
  onClick,
}: {
  conversation: Conversation
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 border-b border-gray-50 px-4 py-3 text-left transition-colors',
        active ? 'bg-brand-50' : 'hover:bg-gray-50'
      )}
    >
      <Avatar name={conversation.customer.name} size="sm" className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-gray-800">
            {conversation.customer.name}
          </p>
          {conversation.last_message_at && (
            <span className="shrink-0 text-xs text-gray-400">
              {formatRelativeTime(conversation.last_message_at)}
            </span>
          )}
        </div>
        <p className="truncate text-xs text-gray-500">
          {conversation.subject ?? truncate(conversation.messages?.[0]?.body ?? 'No messages', 40)}
        </p>
        <div className="mt-1">
          <Badge variant={conversation.status === 'open' ? 'success' : 'default'}>
            {conversation.status}
          </Badge>
        </div>
      </div>
    </button>
  )
}
