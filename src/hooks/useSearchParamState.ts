import { useCallback, useEffect, useState } from 'react';

type HistoryMode = 'push' | 'replace';

export type SearchParamUpdateSource = 'initial' | 'user' | 'history';

type SetAction =
  | string
  | null
  | undefined
  | ((current: string) => string | null | undefined);

interface SetOptions {
  history?: HistoryMode;
}

const isBrowser = typeof window !== 'undefined';

const readParamValue = (key: string, defaultValue: string) => {
  if (!isBrowser) {
    return defaultValue;
  }

  const params = new URLSearchParams(window.location.search);
  return params.get(key) ?? defaultValue;
};

const applyHistoryUpdate = (
  key: string,
  nextValue: string | null,
  history: HistoryMode
) => {
  if (!isBrowser) {
    return;
  }

  const url = new URL(window.location.href);

  if (!nextValue) {
    url.searchParams.delete(key);
  } else {
    url.searchParams.set(key, nextValue);
  }

  const method = history === 'push' ? 'pushState' : 'replaceState';
  window.history[method](
    window.history.state,
    '',
    `${url.pathname}${url.search}${url.hash}`
  );
};

export const useSearchParamState = (
  key: string,
  defaultValue = ''
): [
  string,
  (action: SetAction, options?: SetOptions) => void,
  SearchParamUpdateSource,
] => {
  const [value, setValue] = useState(() => readParamValue(key, defaultValue));
  const [updateSource, setUpdateSource] =
    useState<SearchParamUpdateSource>('initial');

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    const handlePopState = () => {
      setUpdateSource('history');
      setValue(readParamValue(key, defaultValue));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [defaultValue, key]);

  const setParam = useCallback(
    (action: SetAction, options?: SetOptions) => {
      setUpdateSource('user');
      setValue((current) => {
        const nextValue =
          typeof action === 'function' ? action(current) : action;
        const normalized = nextValue ?? '';
        applyHistoryUpdate(
          key,
          nextValue ?? null,
          options?.history ?? 'replace'
        );
        return normalized;
      });
    },
    [key]
  );

  return [value, setParam, updateSource];
};
