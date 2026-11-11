import { MUSCLE_GROUPS, type MuscleGroup } from '@syvra/shared';
import { muscleGroupLabel } from '../../utils/format';
import styles from './MuscleGroupFilter.module.css';

interface MuscleGroupFilterProps {
  value: MuscleGroup | undefined;
  onChange: (group: MuscleGroup | undefined) => void;
}

// "All" + one chip per muscle group. The active chip has aria-pressed="true".
export function MuscleGroupFilter({ value, onChange }: MuscleGroupFilterProps) {
  return (
    <div className={styles.filter} role="group" aria-label="Filter by muscle group">
      <button
        type="button"
        className={styles.chip}
        aria-pressed={value === undefined}
        onClick={() => onChange(undefined)}
      >
        All
      </button>
      {MUSCLE_GROUPS.map((group) => (
        <button
          key={group}
          type="button"
          className={styles.chip}
          aria-pressed={value === group}
          onClick={() => onChange(group)}
        >
          {muscleGroupLabel(group)}
        </button>
      ))}
    </div>
  );
}
