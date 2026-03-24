// Query key factory for TanStack Query cache management.
// Usage: queryKeys.workouts.list(userId) → ["workouts", "list", userId]

export const queryKeys = {
  profiles: {
    all: ["profiles"] as const,
    detail: (id: string) => ["profiles", "detail", id] as const,
  },
  exercises: {
    all: ["exercises"] as const,
    list: (userId?: string) => ["exercises", "list", userId] as const,
    detail: (id: string) => ["exercises", "detail", id] as const,
  },
  workouts: {
    all: ["workouts"] as const,
    list: (userId: string) => ["workouts", "list", userId] as const,
    detail: (id: string) => ["workouts", "detail", id] as const,
    dates: (userId: string, month: string) =>
      ["workouts", "dates", userId, month] as const,
    byDate: (userId: string, date: string) =>
      ["workouts", "byDate", userId, date] as const,
  },
  workoutExercises: {
    all: ["workoutExercises"] as const,
    list: (workoutId: string) =>
      ["workoutExercises", "list", workoutId] as const,
    detail: (id: string) => ["workoutExercises", "detail", id] as const,
  },
  sets: {
    all: ["sets"] as const,
    list: (workoutExerciseId: string) =>
      ["sets", "list", workoutExerciseId] as const,
    detail: (id: string) => ["sets", "detail", id] as const,
  },
  bodyWeights: {
    all: ["bodyWeights"] as const,
    list: (userId: string) => ["bodyWeights", "list", userId] as const,
    detail: (id: string) => ["bodyWeights", "detail", id] as const,
  },
  exerciseProgress: {
    all: ["exerciseProgress"] as const,
    detail: (exerciseId: string) =>
      ["exerciseProgress", "detail", exerciseId] as const,
    exerciseList: (userId: string) =>
      ["exerciseProgress", "exerciseList", userId] as const,
  },
} as const;
