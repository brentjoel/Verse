// Feelings whose Results carry a quiet "If you are struggling" note.
const HELP_FEELINGS: ReadonlySet<string> = new Set(["sad", "anxious", "doubtful", "tired"]);

export const HELPLINE_URL = "https://findahelpline.com";

export function showsHelpNote(emotionId: string): boolean {
  return HELP_FEELINGS.has(emotionId);
}
