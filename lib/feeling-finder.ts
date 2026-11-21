/** "Not sure what I feel?": three plain questions, scored by fixed rules. Nothing is stored or sent. */
export interface FinderOption { label: string; /** Feeling ids, strongest first: 2 points, then 1 for each after. */ leans: readonly string[] }
export interface FinderQuestion { id: string; prompt: string; options: readonly FinderOption[] }

export const FINDER_QUESTIONS: readonly FinderQuestion[] = [
  { id: "where", prompt: "Where do you notice it most?", options: [
    { label: "In my mind, going round and round", leans: ["anxious", "doubtful"] },
    { label: "In my chest, a heaviness", leans: ["sad", "guilty"] },
    { label: "In my body, tight and tense", leans: ["angry", "anxious"] },
    { label: "Everywhere, I am worn out", leans: ["tired", "sad"] },
    { label: "Light and warm", leans: ["grateful", "hopeful"] },
  ] },
  { id: "about", prompt: "What is it mostly about?", options: [
    { label: "Something ahead of me", leans: ["anxious", "hopeful"] },
    { label: "Something or someone I lost", leans: ["sad", "doubtful"] },
    { label: "Something someone did", leans: ["angry", "sad"] },
    { label: "Something I did", leans: ["guilty", "sad"] },
    { label: "Questions I cannot answer", leans: ["doubtful", "anxious"] },
    { label: "Something good", leans: ["grateful", "hopeful"] },
    { label: "Everything and nothing", leans: ["tired", "sad"] },
  ] },
  { id: "need", prompt: "What would help most right now?", options: [
    { label: "Quiet and rest", leans: ["tired", "anxious"] },
    { label: "Comfort", leans: ["sad", "guilty"] },
    { label: "Room to let it out", leans: ["angry", "tired"] },
    { label: "A fresh start", leans: ["guilty", "hopeful"] },
    { label: "A reason to hope", leans: ["hopeful", "doubtful"] },
    { label: "Peace about my questions", leans: ["doubtful", "anxious"] },
    { label: "A way to say thank you", leans: ["grateful", "hopeful"] },
  ] },
];

/** Feelings ranked by score. Ties keep the order of `order` so results are stable. Returns at most two, never a zero score. */
export function suggestFeelings(answers: readonly number[], order: readonly string[], questions: readonly FinderQuestion[] = FINDER_QUESTIONS): string[] {
  const score = new Map<string, number>();
  questions.forEach((question, index) => {
    const option = question.options[answers[index]];
    option?.leans.forEach((id, place) => score.set(id, (score.get(id) ?? 0) + (place === 0 ? 2 : 1)));
  });
  return order.filter(id => (score.get(id) ?? 0) > 0)
    .sort((a, b) => (score.get(b) ?? 0) - (score.get(a) ?? 0) || order.indexOf(a) - order.indexOf(b))
    .slice(0, 2);
}
