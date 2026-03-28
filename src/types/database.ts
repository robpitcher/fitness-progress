// Entity types matching supabase/migrations/20260324000001_create_schema.sql

export interface Profile {
  id: string;
  display_name: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  user_id: string | null;
  created_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string | null;
  category_id: string | null;
  user_id: string | null;
  training_notes: string | null;
  created_at: string;
}

export interface Workout {
  id: string;
  user_id: string;
  date: string;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  order: number;
  created_at: string;
}

export interface Set {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  reps: number | null;
  weight: number | null;
  created_at: string;
}

export interface BodyWeight {
  id: string;
  user_id: string;
  date: string;
  weight: number;
  created_at: string;
}

export interface ExerciseMuscle {
  id: string;
  exercise_id: string;
  muscle_name: string;
  muscle_role: 'primary' | 'secondary';
  notes: string | null;
  created_at: string;
}

// Insert types (omit server-generated fields)

export type ProfileInsert = Omit<Profile, "created_at">;

export type CategoryInsert = Omit<Category, "id" | "created_at">;

export type ExerciseInsert = Omit<Exercise, "id" | "created_at">;

export type WorkoutInsert = Omit<Workout, "id" | "created_at">;

export type WorkoutExerciseInsert = Omit<WorkoutExercise, "id" | "created_at">;

export type SetInsert = Omit<Set, "id" | "created_at">;

export type BodyWeightInsert = Omit<BodyWeight, "id" | "created_at">;

export type ExerciseMuscleInsert = Omit<ExerciseMuscle, "id" | "created_at">;

// Update types (all fields optional except id)

export type ProfileUpdate = Pick<Profile, "id"> &
  Partial<Omit<Profile, "id" | "created_at">>;

export type CategoryUpdate = Pick<Category, "id"> &
  Partial<Omit<Category, "id" | "created_at">>;

export type ExerciseUpdate = Pick<Exercise, "id"> &
  Partial<Omit<Exercise, "id" | "created_at">>;

export type WorkoutUpdate = Pick<Workout, "id"> &
  Partial<Omit<Workout, "id" | "created_at">>;

export type WorkoutExerciseUpdate = Pick<WorkoutExercise, "id"> &
  Partial<Omit<WorkoutExercise, "id" | "created_at">>;

export type SetUpdate = Pick<Set, "id"> &
  Partial<Omit<Set, "id" | "created_at">>;

export type BodyWeightUpdate = Pick<BodyWeight, "id"> &
  Partial<Omit<BodyWeight, "id" | "created_at">>;

export type ExerciseMuscleUpdate = Pick<ExerciseMuscle, "id"> &
  Partial<Omit<ExerciseMuscle, "id" | "created_at">>;
