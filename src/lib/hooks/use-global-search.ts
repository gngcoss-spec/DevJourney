'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query-keys';
import { globalSearch } from '@/lib/supabase/queries/search';

export function useGlobalSearch(debounceMs: number = 300) {
  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const client = createClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, debounceMs]);

  const { data: results, isLoading } = useQuery({
    queryKey: queryKeys.globalSearch.query(debouncedQuery),
    queryFn: () => globalSearch(client, debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
  });

  const reset = () => {
    setInputValue('');
    setDebouncedQuery('');
  };

  return {
    inputValue,
    setInputValue,
    results: results ?? null,
    isLoading,
    reset,
  };
}
