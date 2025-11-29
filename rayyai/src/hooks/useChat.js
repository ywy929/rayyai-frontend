import { useCallback, useState } from 'react';
import { useFetch, useMutation } from './useAsync';
import { chatApi } from '@/services/api';

/**
 * Hook for fetching all conversations
 */
export function useConversations(params = {}, options = {}) {
  const fetchConversations = useCallback(
    () => chatApi.getConversations(params),
    [JSON.stringify(params)]
  );

  return useFetch(fetchConversations, [JSON.stringify(params)], options);
}

/**
 * Hook for fetching a single conversation
 */
export function useConversation(conversationId, options = {}) {
  const fetchConversation = useCallback(() => {
    if (!conversationId) return Promise.resolve(null);
    return chatApi.getConversation(conversationId);
  }, [conversationId]);

  return useFetch(fetchConversation, [conversationId], {
    ...options,
    immediate: !!conversationId,
  });
}

/**
 * Hook for fetching messages of a conversation
 */
export function useMessages(conversationId, limit = null, options = {}) {
  const fetchMessages = useCallback(() => {
    if (!conversationId) return Promise.resolve([]);
    return chatApi.getMessages(conversationId, limit);
  }, [conversationId, limit]);

  return useFetch(fetchMessages, [conversationId, limit], {
    ...options,
    immediate: !!conversationId,
  });
}

/**
 * Hook for chat mutations (send message, delete, update)
 */
export function useChatMutations(options = {}) {
  const { onSuccess, invalidate } = options;

  const createConversation = useMutation(
    (data) => chatApi.createConversation(data),
    { onSuccess, invalidate }
  );

  const sendMessage = useMutation(
    ({ message, files }) => chatApi.sendMessage(message, files),
    { onSuccess, invalidate }
  );

  const sendMessageToConversation = useMutation(
    ({ conversationId, message, files, options: opts }) =>
      chatApi.sendMessageToConversation(conversationId, message, files, opts),
    { onSuccess, invalidate }
  );

  const updateMessage = useMutation(
    ({ messageId, content }) => chatApi.updateMessage(messageId, content),
    { onSuccess, invalidate }
  );

  const deleteMessage = useMutation(
    (messageId) => chatApi.deleteMessage(messageId),
    { onSuccess, invalidate }
  );

  const deleteConversation = useMutation(
    (conversationId) => chatApi.deleteConversation(conversationId),
    { onSuccess, invalidate }
  );

  const updateConversation = useMutation(
    ({ conversationId, title }) => chatApi.updateConversation(conversationId, title),
    { onSuccess, invalidate }
  );

  const refreshContext = useMutation(
    () => chatApi.refreshContext(),
    { onSuccess, invalidate }
  );

  const summarizeContext = useMutation(
    () => chatApi.summarizeContext(),
    { onSuccess, invalidate }
  );

  return {
    createConversation,
    sendMessage,
    sendMessageToConversation,
    updateMessage,
    deleteMessage,
    deleteConversation,
    updateConversation,
    refreshContext,
    summarizeContext,
  };
}

/**
 * Combined hook for managing a single conversation with messages
 */
export function useChatSession(initialConversationId = null) {
  const [conversationId, setConversationId] = useState(initialConversationId);

  const conversations = useConversations();
  const messages = useMessages(conversationId);
  const mutations = useChatMutations({
    invalidate: () => {
      conversations.refetch();
      if (conversationId) {
        messages.refetch();
      }
    },
  });

  const selectConversation = useCallback((id) => {
    setConversationId(id);
  }, []);

  const startNewConversation = useCallback(() => {
    setConversationId(null);
  }, []);

  return {
    conversationId,
    conversations,
    messages,
    ...mutations,
    selectConversation,
    startNewConversation,
  };
}

export default useConversations;
