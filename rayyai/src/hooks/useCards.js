import { useCallback } from 'react';
import { useFetch, useMutation } from './useAsync';
import { cardsApi } from '@/services/api';

/**
 * Hook for fetching all credit cards
 */
export function useCards(options = {}) {
  const fetchCards = useCallback(() => cardsApi.getAll(), []);

  return useFetch(fetchCards, [], options);
}

/**
 * Hook for fetching a single card
 */
export function useCard(cardId, options = {}) {
  const fetchCard = useCallback(() => {
    if (!cardId) return Promise.resolve(null);
    return cardsApi.getById(cardId);
  }, [cardId]);

  return useFetch(fetchCard, [cardId], {
    ...options,
    immediate: !!cardId,
  });
}

/**
 * Hook for fetching card overview metrics
 */
export function useCardOverview(options = {}) {
  const fetchOverview = useCallback(() => cardsApi.getOverview(), []);

  return useFetch(fetchOverview, [], options);
}

/**
 * Hook for fetching card terms history
 */
export function useCardHistory(cardId, options = {}) {
  const fetchHistory = useCallback(() => {
    if (!cardId) return Promise.resolve([]);
    return cardsApi.getHistory(cardId);
  }, [cardId]);

  return useFetch(fetchHistory, [cardId], {
    ...options,
    immediate: !!cardId,
  });
}

/**
 * Hook for fetching AI card recommendations
 */
export function useCardRecommendations(maxResults = 5, options = {}) {
  const fetchRecommendations = useCallback(
    () => cardsApi.getRecommendations(maxResults),
    [maxResults]
  );

  return useFetch(fetchRecommendations, [maxResults], options);
}

/**
 * Hook for card mutations (create, update, delete)
 */
export function useCardMutations(options = {}) {
  const { onSuccess, invalidate } = options;

  const createCard = useMutation(
    (data) => cardsApi.create(data),
    { onSuccess, invalidate }
  );

  const updateCard = useMutation(
    ({ id, data }) => cardsApi.update(id, data),
    { onSuccess, invalidate }
  );

  const deleteCard = useMutation(
    (id) => cardsApi.delete(id),
    { onSuccess, invalidate }
  );

  return {
    createCard,
    updateCard,
    deleteCard,
  };
}

export default useCards;
