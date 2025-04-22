import { 
  ProgressionType, 
  Variable, 
  ProgressionSequence,
  ProgressionRules
} from '@/types/progression';

// Progression rules for each type
export const progressionRules: Record<ProgressionType, ProgressionRules> = {
  single: {
    requiresTime: true,
    maxVariables: 1,
    allowedRoles: ['primary']
  },
  double: {
    requiresTime: true,
    maxVariables: 2,
    allowedRoles: ['primary', 'secondary']
  },
  triple: {
    requiresTime: true,
    maxVariables: 3,
    allowedRoles: ['primary', 'secondary', 'tertiary']
  }
};

// Generate the sequence of values for a variable
export function generateSequence(variable: Variable): ProgressionSequence {
  const sequence: number[] = [variable.startValue];
  let currentValue = variable.startValue;

  for (let i = 0; i < variable.numberOfIncrements; i++) {
    let nextValue: number;

    if (variable.percentageIncrease) {
      nextValue = currentValue * (1 + variable.percentageIncrease / 100);
    } else if (variable.incrementSize) {
      nextValue = currentValue + variable.incrementSize;
    } else {
      break;
    }

    // Apply bounds
    if (variable.maxValue != null && nextValue > variable.maxValue) {
      nextValue = variable.maxValue;
    }
    if (variable.minValue != null && nextValue < variable.minValue) {
      nextValue = variable.minValue;
    }

    sequence.push(nextValue);
    currentValue = nextValue;

    if (variable.maxValue != null && currentValue >= variable.maxValue) {
      break;
    }
  }

  const currentIndex = sequence.findIndex(
    value => Math.abs(value - variable.currentValue) < 0.0001
  );

  return {
    values: sequence,
    currentIndex,
    isComplete: currentIndex === sequence.length - 1,
    nextValue: currentIndex < sequence.length - 1 ? sequence[currentIndex + 1] : null
  };
}

// Validate variable configuration
export function validateVariable(
  variable: Partial<Variable>,
  progressionType: ProgressionType,
  existingVariables: Variable[] = []
): string[] {
  const errors: string[] = [];
  const rules = progressionRules[progressionType];

  // Check if we can add more variables
  if (existingVariables.length >= rules.maxVariables) {
    errors.push(`Maximum of ${rules.maxVariables} variables allowed for ${progressionType} progression`);
    return errors;
  }

  // Validate time variable requirements
  if (rules.requiresTime && variable.isPrimary && variable.variableType !== 'time') {
    errors.push('Primary variable must be time for this progression type');
  }

  // Basic validation
  if (!variable.startValue && variable.startValue !== 0) {
    errors.push('Start value is required');
  }

  if (!variable.numberOfIncrements) {
    errors.push('Number of increments is required');
  }

  if (!variable.incrementSize && !variable.percentageIncrease) {
    errors.push('Either increment size or percentage increase is required');
  }

  // Validate bounds
  if (variable.minValue != null && variable.maxValue != null) {
    if (variable.minValue >= variable.maxValue) {
      errors.push('Minimum value must be less than maximum value');
    }
  }

  // Validate role assignment
  const role = variable.isPrimary ? 'primary' : 
               variable.isSecondary ? 'secondary' : 
               variable.isTertiary ? 'tertiary' : null;

  if (!role) {
    errors.push('Variable must have a role (primary, secondary, or tertiary)');
  } else if (!rules.allowedRoles.includes(role)) {
    errors.push(`${role} role is not allowed for ${progressionType} progression`);
  }

  return errors;
}

// Calculate next values for all variables
export function calculateNextValues(
  variables: Variable[],
  progressionType: ProgressionType
): Record<string, number | null> {
  const nextValues: Record<string, number | null> = {};
  
  variables.forEach(variable => {
    const sequence = generateSequence(variable);
    nextValues[variable.id] = sequence.nextValue;
  });

  return nextValues;
}

// Check if a variable should reset
export function shouldResetVariable(
  variable: Variable,
  higherVariable: Variable | null
): boolean {
  if (!higherVariable) return false;

  const higherSequence = generateSequence(higherVariable);
  return higherSequence.isComplete;
}

// Format value for display
export function formatVariableValue(value: number, variable: Variable): string {
  if (variable.variableType === 'time') {
    const minutes = Math.floor(value / 60);
    const seconds = Math.floor(value % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return variable.unit ? `${value}${variable.unit}` : value.toString();
}