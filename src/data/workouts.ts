import type { ExerciseDefinition, TrainingMode, WorkoutDefinition, WorkoutId } from '../domain/models'

export const exercises: Record<string, ExerciseDefinition> = {
  'easy-cardio': { id: 'easy-cardio', name: 'Easy cardio warm-up', category: 'warmup', muscles: ['Heart', 'legs'], why: 'Raise your temperature gradually before strength work.', how: 'Walk or cycle at a pace where you can still talk comfortably.', avoid: 'Starting hard or chasing a speed target.', defaultRepGuidance: '5 min', cardioFields: ['duration', 'speed', 'incline'] },
  'leg-press': { id: 'leg-press', name: 'Leg press', category: 'strength', muscles: ['Quads', 'glutes'], why: 'Build lower-body capacity with a stable machine path.', how: 'Use a comfortable range. Push through the whole foot and keep the movement controlled.', avoid: 'Locking knees hard or letting the lower back roll off the pad.', defaultRepGuidance: '2 × 10–12' },
  'chest-press': { id: 'chest-press', name: 'Machine chest press', category: 'strength', muscles: ['Chest', 'triceps'], why: 'Practice a stable upper-body push.', how: 'Set handles near chest height. Press smoothly and return with control.', avoid: 'Shrugging shoulders or bouncing the weight.', defaultRepGuidance: '2 × 8–12' },
  'lat-pulldown': { id: 'lat-pulldown', name: 'Lat pulldown', category: 'strength', muscles: ['Lats', 'upper back'], why: 'Build pulling strength and shoulder control.', how: 'Pull the bar toward upper chest with elbows moving down. Return slowly.', avoid: 'Leaning far back or pulling behind the neck.', defaultRepGuidance: '2 × 10–12' },
  'leg-curl': { id: 'leg-curl', name: 'Seated leg curl', category: 'strength', muscles: ['Hamstrings'], why: 'Strengthen the back of the legs with simple setup.', how: 'Align the machine with your knee joint. Curl smoothly and release slowly.', avoid: 'Jerking the pad or lifting hips from the seat.', defaultRepGuidance: '2 × 10–12' },
  'cable-row': { id: 'cable-row', name: 'Seated cable row', category: 'strength', muscles: ['Mid back', 'biceps'], why: 'Balance pressing with a controlled horizontal pull.', how: 'Sit tall, draw elbows back, and pause briefly before returning.', avoid: 'Swinging your torso to move the weight.', defaultRepGuidance: '2 × 10–12' },
  'shoulder-press': { id: 'shoulder-press', name: 'Machine shoulder press', category: 'strength', muscles: ['Shoulders', 'triceps'], why: 'Add a gentle overhead push if shoulders feel comfortable.', how: 'Use a light load and a pain-free range. Keep ribs relaxed.', avoid: 'Forcing range or pressing through discomfort.', defaultRepGuidance: '2 × 8–10' },
  'easy-finish': { id: 'easy-finish', name: 'Easy cardio finish', category: 'cardio', muscles: ['Heart', 'legs'], why: 'Finish with comfortable movement, without chasing intensity.', how: 'Walk or cycle easily and let breathing settle.', avoid: 'Turning the finish into a test.', defaultRepGuidance: '5–8 min', cardioFields: ['duration', 'speed', 'incline'] },
  'box-squat': { id: 'box-squat', name: 'Sit-to-stand / box squat', category: 'strength', muscles: ['Quads', 'glutes'], why: 'Practice a useful lower-body movement with a clear depth.', how: 'Use a stable bench. Stand tall, then sit back under control.', avoid: 'Dropping onto the bench or pushing through knee pain.', defaultRepGuidance: '2 × 8–10' },
  'incline-press': { id: 'incline-press', name: 'Incline chest press machine', category: 'strength', muscles: ['Upper chest', 'triceps'], why: 'A second stable pressing angle for balanced strength.', how: 'Adjust seat for comfortable handles. Press smoothly.', avoid: 'Flaring elbows sharply or arching excessively.', defaultRepGuidance: '2 × 8–12' },
  'assisted-row': { id: 'assisted-row', name: 'Chest-supported row', category: 'strength', muscles: ['Upper back', 'biceps'], why: 'Train the back while the torso has support.', how: 'Keep chest on the pad and pull elbows back slowly.', avoid: 'Lifting your chest from the pad.', defaultRepGuidance: '2 × 10–12' },
  'calf-raise': { id: 'calf-raise', name: 'Supported calf raise', category: 'strength', muscles: ['Calves'], why: 'Build ankle and lower-leg capacity for the road back to running.', how: 'Hold a stable support. Rise and lower with control.', avoid: 'Bouncing at the bottom.', defaultRepGuidance: '2 × 10–12' },
}

export const workouts: Record<WorkoutId, WorkoutDefinition> = {
  'strength-a': {
    id: 'strength-a', title: 'Strength A', subtitle: 'Full body · calibration', estimatedMinutes: { GREEN: 45, AMBER: 28, RESET: 18 },
    modeExerciseIds: {
      AMBER: ['easy-cardio', 'leg-press', 'chest-press', 'lat-pulldown', 'leg-curl', 'easy-finish'],
      RESET: ['easy-cardio', 'leg-press', 'lat-pulldown', 'easy-finish'],
    },
    exercises: [
      { exerciseId: 'easy-cardio', repGuidance: '5 min' },
      { exerciseId: 'leg-press', sets: 2, repGuidance: '10–12 reps' },
      { exerciseId: 'chest-press', sets: 2, repGuidance: '8–12 reps' },
      { exerciseId: 'lat-pulldown', sets: 2, repGuidance: '10–12 reps' },
      { exerciseId: 'leg-curl', sets: 2, repGuidance: '10–12 reps' },
      { exerciseId: 'cable-row', sets: 2, repGuidance: '10–12 reps' },
      { exerciseId: 'shoulder-press', sets: 2, repGuidance: '8–10 reps', optional: true },
      { exerciseId: 'easy-finish', repGuidance: '5–8 min', optional: true },
    ],
  },
  'strength-b': {
    id: 'strength-b', title: 'Strength B', subtitle: 'Full body · calibration', estimatedMinutes: { GREEN: 44, AMBER: 27, RESET: 18 },
    modeExerciseIds: {
      AMBER: ['easy-cardio', 'box-squat', 'incline-press', 'assisted-row', 'leg-curl', 'easy-finish'],
      RESET: ['easy-cardio', 'box-squat', 'assisted-row', 'easy-finish'],
    },
    exercises: [
      { exerciseId: 'easy-cardio', repGuidance: '5 min' },
      { exerciseId: 'box-squat', sets: 2, repGuidance: '8–10 reps' },
      { exerciseId: 'incline-press', sets: 2, repGuidance: '8–12 reps' },
      { exerciseId: 'assisted-row', sets: 2, repGuidance: '10–12 reps' },
      { exerciseId: 'leg-curl', sets: 2, repGuidance: '10–12 reps' },
      { exerciseId: 'lat-pulldown', sets: 2, repGuidance: '10–12 reps' },
      { exerciseId: 'calf-raise', sets: 2, repGuidance: '10–12 reps', optional: true },
      { exerciseId: 'easy-finish', repGuidance: '5–8 min', optional: true },
    ],
  },
}

export function workoutPlan(id: WorkoutId, mode: TrainingMode) {
  const workout = workouts[id]
  const ids = mode === 'AMBER' || mode === 'RESET' ? workout.modeExerciseIds[mode] : undefined
  return ids ? workout.exercises.filter(item => ids.includes(item.exerciseId)) : workout.exercises
}
