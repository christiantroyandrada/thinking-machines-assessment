import { useCallback, useEffect, useRef, useState } from 'react';

export function useAsync(callback, deps = [], { immediate = true } = {}) {
  const [state, setState] = useState({ data: null, loading: immediate, error: null });
  const callbackRef = useRef(callback);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  callbackRef.current = callback;

  const run = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await callbackRef.current();
      if (mountedRef.current && requestId === requestIdRef.current) {
        setState({ data, loading: false, error: null });
      }
      return data;
    } catch (err) {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setState({ data: null, loading: false, error: err.message });
      }
      return null;
    }
  }, []);

  const setError = useCallback((message) => {
    setState((s) => ({ ...s, error: message }));
  }, []);

  useEffect(() => {
    if (immediate) run();
  }, deps);

  useEffect(() => () => {
    mountedRef.current = false;
    requestIdRef.current += 1;
  }, []);

  return { data: state.data, loading: state.loading, error: state.error, run, setError };
}
