import { Database } from './supabase';

export type ProgressionType = 'single' | 'double' | 'triple';

export interface Variable {
  id: string;
  exerciseId: string;
  variableType: string;
  currentValue: number;
  startValue: number;
  incrementSize?: number;
  percentageIncrease?: number;
  minValue?: number;
  maxValue?: number;
  numberOfIncrements: number;
  isPrimary: boolean;
  isSecondary: boolean;
  isTertiary: boolean;
  unit?: string;
  shouldResetCycle: boolean;
  customName?: string;
}

export interface Exercise {
  id: string;
  workoutId: string;
  name: string;
  progressionType: ProgressionType;
  orderIndex: number;
  maintenanceMode: boolean;
  prepTimerDuration: number;
  notes?: string;
  variables: Variable[];
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  orderIndex: number;
  notes?: string;
  exercises: Exercise[];
}

export interface Programme {
  id: string;
  userId: string;
  name: string;
  description?: string;
  orderIndex: number;
  workouts: Workout[];
}

export interface ProgressionSequence {
  values: number[];
  currentIndex: number;
  isComplete: boolean;
  nextValue: number | null;
}

export type VariableRole = 'primary' | 'secondary' | 'tertiary';

export interface ProgressionRules {
  requiresTime: boolean;
  maxVariables: number;
  allowedRoles: VariableRole[];
}