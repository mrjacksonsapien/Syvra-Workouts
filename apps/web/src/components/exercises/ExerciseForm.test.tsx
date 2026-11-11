import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Exercise } from '@syvra/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createExercise, updateExercise } from '../../api/exercises';
import { ExerciseForm } from './ExerciseForm';

// No real HTTP: the api module is replaced by mocks.
vi.mock('../../api/exercises');

const existing: Exercise = {
  id: 7,
  name: 'Back Squat',
  muscleGroup: 'legs',
  description: 'Barbell on the back',
  equipment: 'Barbell',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

afterEach(cleanup); // Testing Library only cleans up by itself when Vitest globals are on.

beforeEach(() => {
  vi.resetAllMocks();
});

describe('ExerciseForm', () => {
  it('shows validation errors and does not save when submitted empty', async () => {
    const user = userEvent.setup();
    render(<ExerciseForm onSaved={vi.fn()} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Must be at least 2 characters')).toBeTruthy();
    expect(createExercise).not.toHaveBeenCalled();
  });

  it('creates an exercise with the typed values', async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();
    vi.mocked(createExercise).mockResolvedValue(existing);
    render(<ExerciseForm onSaved={onSaved} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText('Name'), 'Goblet Squat');
    await user.selectOptions(screen.getByLabelText('Muscle group'), 'legs');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(createExercise).toHaveBeenCalledWith({
      name: 'Goblet Squat',
      muscleGroup: 'legs',
      description: null,
      equipment: null,
    });
  });

  it('pre-fills the fields and updates in edit mode', async () => {
    const user = userEvent.setup();
    vi.mocked(updateExercise).mockResolvedValue(existing);
    render(<ExerciseForm exercise={existing} onSaved={vi.fn()} onCancel={vi.fn()} />);

    expect((screen.getByLabelText('Name') as HTMLInputElement).value).toBe('Back Squat');
    expect((screen.getByLabelText('Muscle group') as HTMLSelectElement).value).toBe('legs');
    expect((screen.getByLabelText('Equipment (optional)') as HTMLInputElement).value).toBe(
      'Barbell',
    );

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(updateExercise).toHaveBeenCalledWith(7, expect.any(Object)));
  });
});
