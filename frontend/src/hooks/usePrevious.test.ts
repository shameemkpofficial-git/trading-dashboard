import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { usePrevious } from './usePrevious';

describe('usePrevious', () => {
  it('should return undefined on initial render', () => {
    const { result } = renderHook(() => usePrevious(1));
    expect(result.current).toBeUndefined();
  });

  it('should return the previous value after update', () => {
    const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
      initialProps: { value: 1 }
    });
    
    expect(result.current).toBeUndefined();

    rerender({ value: 2 });
    expect(result.current).toBe(1);

    rerender({ value: 3 });
    expect(result.current).toBe(2);
  });
});
