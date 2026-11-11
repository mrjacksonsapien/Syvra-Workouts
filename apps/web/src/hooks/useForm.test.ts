import { act, renderHook } from '@testing-library/react';
import type { FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { ApiError } from '../api/client';
import { toNumber, toTextOrNull } from '../utils/form';
import { useForm } from './useForm';

const schema = z.object({
  name: z.string().min(2, 'Too short'),
  sets: z.number().int().min(1, 'At least 1'),
  notes: z.string().nullable(),
});

const initialValues = { name: '', sets: '', notes: '' };
const toInput = (v: typeof initialValues) => ({
  name: v.name,
  sets: toNumber(v.sets),
  notes: toTextOrNull(v.notes),
});

const fakeEvent = { preventDefault: () => {} } as FormEvent;

describe('useForm', () => {
  it('exposes the initial values and no errors', () => {
    const { result } = renderHook(() => useForm(schema, initialValues, toInput));

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
  });

  it('shows errors and does not call onSubmit when values are invalid', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useForm(schema, initialValues, toInput));

    await act(() => result.current.handleSubmit(onSubmit)(fakeEvent));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.name).toBe('Too short');
    expect(result.current.errors.sets).toBeDefined();
  });

  it('calls onSubmit with parsed data: numbers converted, empty optionals null', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useForm(schema, initialValues, toInput));

    act(() => result.current.setField('name', 'Squat'));
    act(() => result.current.setField('sets', '3'));
    await act(() => result.current.handleSubmit(onSubmit)(fakeEvent));

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Squat', sets: 3, notes: null });
    expect(result.current.errors).toEqual({});
  });

  it('re-validates a field as it changes after the first submit', async () => {
    const { result } = renderHook(() => useForm(schema, initialValues, toInput));
    await act(() => result.current.handleSubmit(vi.fn())(fakeEvent));
    expect(result.current.errors.name).toBe('Too short');

    act(() => result.current.setField('name', 'Squat'));

    expect(result.current.errors.name).toBeUndefined();
  });

  it('puts API fieldErrors on the matching fields', async () => {
    const { result } = renderHook(() => useForm(schema, initialValues, toInput));
    const failing = () => {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid', {
        fieldErrors: { name: ['Already taken'] },
      });
    };

    act(() => result.current.setField('name', 'Squat'));
    act(() => result.current.setField('sets', '3'));
    await act(() => result.current.handleSubmit(failing)(fakeEvent));

    expect(result.current.errors.name).toBe('Already taken');
  });
});
