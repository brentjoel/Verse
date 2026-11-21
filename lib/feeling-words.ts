/**
 * On-device feeling finder: a visitor's own words are scored against a hand-written lexicon
 * of plain phrases (built from the feeling names, their descriptions and everyday words, never
 * from Scripture). It only picks existing feelings; it never writes or paraphrases Bible text.
 * Pure and synchronous: nothing is stored, sent or logged.
 */

export interface FeelingMatch { feeling: string; specific: string | null; score: number }

/** Feelings in their canonical order (ties keep this order). */
export const FEELING_ORDER = ["anxious", "sad", "angry", "tired", "guilty", "grateful", "hopeful", "doubtful"] as const;
export const MAX_WORDS_LENGTH = 500;

/** [feeling, specific or "", weight, "cue|multi word cue|..."]. Same cue in several rows adds up. */
const GROUPS: readonly (readonly [string, string, number, string])[] = [
  ["anxious", "", 3, "anxious|anxiety|nervous|uneasy|restless|panic|panicky|panicking|stressed|stress|stressful|tense|on edge|jittery|jumpy|uptight|freaking out|worked up|can not relax|racing thoughts|mind racing|overthinking|overthink|what if|butterflies|thoughts feel restless"],
  ["anxious", "worried-about-the-future", 3, "worried|worry|worrying|worries|future|uncertain|uncertainty|the unknown|what will happen|deadline|bills|money|finances|diagnosis|test results|interview|exam"],
  ["anxious", "cant-sleep", 3, "not sleep|sleepless|insomnia|awake at night|lying awake|up all night|no sleep|nightmare|nightmares|toss and turn|tossing and turning|middle of the night|trouble sleeping|cant sleep"],
  ["anxious", "overwhelmed", 3, "overwhelmed|overwhelming|too much|swamped|drowning|buried|so much to do|can not cope|falling apart|spinning|out of control|pressure|crushed"],
  ["anxious", "afraid", 3, "afraid|scared|fear|fears|fearful|frightened|terrified|terror|dread|dreading|petrified|unsafe|threatened|danger"],
  ["sad", "", 3, "sad|sadness|unhappy|depressed|depression|heavy heart|heart feels heavy|heartbroken|broken hearted|crying|cry|tears|weeping|sorrow|miserable|gloomy|melancholy|despair|hopeless|hopelessness|no hope|feel down|feeling down|so down|feel low|feeling low|blue"],
  ["sad", "", 2, "heavy|hurting|broken|hurt|upset|devastated|breakup|broke up|divorce|divorced|hate myself|hate my life"],
  ["sad", "grieving", 3, "grief|grieving|grieve|mourning|mourn|loss|lost my|lost someone|passed away|died|death|funeral|miss him|miss her|miss them|missing|widow|widowed|bereaved|miscarriage|gone forever|dad passed|mom passed|father passed|mother passed|grandma passed|grandpa passed|friend passed|husband passed|wife passed"],
  ["sad", "lonely", 3, "lonely|loneliness|alone|isolated|isolation|left out|no friends|nobody|no one cares|nobody cares|unwanted|abandoned|forgotten|rejected|invisible|by myself|on my own"],
  ["sad", "disappointed", 3, "disappointed|disappointment|disappointing|let down|let me down|did not work out|fell through|setback|not what i hoped|did not get|missed out|lost my job"],
  ["sad", "feeling-empty", 3, "empty|emptiness|numb|hollow|nothing matters|meaningless|pointless|void|flat|no purpose|purposeless|feel nothing|meh|blah|can not feel anything"],
  ["angry", "", 3, "angry|anger|mad|furious|rage|raging|livid|irritated|irritable|annoyed|pissed|fuming|hate|hatred|outraged|snapped|yelled|yelling|shouting|room to breathe"],
  ["angry", "", 1, "upset|hurt"],
  ["angry", "frustrated", 3, "frustrated|frustrating|frustration|fed up|nothing works|unfair|injustice|aggravated|sick of"],
  ["angry", "betrayed", 3, "betrayed|betrayal|lied to|lied to me|cheated on|cheated on me|backstabbed|stabbed in the back|used me|broke my trust|two faced|behind my back|gossip|turned on me"],
  ["angry", "resentful", 3, "resentful|resentment|resent|bitter|bitterness|grudge|can not forgive|will not forgive|jealous|jealousy|envy|envious|unforgiveness|still hurt"],
  ["angry", "need-patience", 3, "patience|impatient|short tempered|short fuse|losing my temper|lose my temper|temper|annoying|irritating|waiting forever|testing me"],
  ["tired", "", 3, "tired|exhausted|exhaustion|weary|worn out|drained|fatigue|fatigued|sleepy|wiped out|depleted|running on empty|no energy|low energy|need rest|need a rest|little rest"],
  ["tired", "burned-out", 3, "burned out|burnt out|burnout|overworked|too many hours|nothing left|can not keep up|work is|at work|my job"],
  ["tired", "discouraged", 3, "discouraged|discouraging|defeated|deflated|losing heart|lost heart|failing|failure|what is the point|whats the point|stuck|getting nowhere"],
  ["tired", "need-strength", 3, "strength|weak|weakness|sick|illness|ill|pain|chronic|hospital|surgery|recovery|cancer|treatment|keep going|carry on|hold on|struggling|is hard|so hard|hard time|tough time"],
  ["tired", "wanting-to-quit", 3, "quit|quitting|give up|giving up|want to stop|done with|can not go on|ready to quit|throw in the towel|walk away|so done"],
  ["guilty", "", 3, "guilty|guilt|regret|regrets|remorse|my fault|blame myself|conscience|i was wrong|feel bad about|fresh start"],
  ["guilty", "ashamed", 3, "ashamed|shame|hate myself|embarrassed|embarrassing|humiliated|disgusted with myself|dirty|unworthy|worthless|not good enough"],
  ["guilty", "need-forgiveness", 3, "forgive|forgive me|forgiveness|forgiven|mercy|make it right|apologize|apology|confess|repent|repentance|second chance|sorry"],
  ["guilty", "made-a-mistake", 3, "mistake|mistakes|messed up|screwed up|blew it|i failed|i lied|lied|hurt someone|said something|should not have|did something wrong"],
  ["guilty", "struggling-with-sin", 3, "struggling with sin|struggle with sin|sin|sins|sinful|sinning|temptation|tempted|addiction|addicted|relapse|relapsed|lust|porn|drinking|bad habit|keep falling"],
  ["grateful", "", 3, "grateful|gratitude|thankful|thanks|thank|thank you|appreciate|appreciative|notice the good|so good|good day|at peace|content"],
  ["grateful", "", 2, "happy|joy|joyful|glad|delighted"],
  ["grateful", "blessed", 3, "blessed|blessing|blessings|abundance|provided|provision|gift|gifts|fortunate|lucky"],
  ["grateful", "celebrating", 3, "celebrate|celebrating|celebration|birthday|anniversary|wedding|married|engaged|graduated|graduation|promotion|promoted|good news|got the job|passed my"],
  ["grateful", "thankful-for-people", 1, "friends|friend|family|husband|wife|kids|children|parents|mom|dad|community|people|church family|loved ones"],
  ["grateful", "answered-prayer", 3, "answered prayer|prayer answered|prayers answered|god answered|came through|finally happened|healed|miracle|breakthrough"],
  ["hopeful", "", 3, "hopeful|hope|hoping|optimistic|looking forward|expectant|eager|look toward tomorrow|things are looking up|getting better"],
  ["hopeful", "", 2, "excited|dream|dreams|tomorrow|happy"],
  ["hopeful", "starting-something-new", 3, "something new|new job|new start|new beginning|starting over|starting|moving|new city|new school|college|pregnant|new chapter|adventure|fresh start|first day"],
  ["hopeful", "waiting-on-god", 3, "waiting|wait|not yet|someday|how long|waiting on god|god timing|in his timing|in god timing"],
  ["hopeful", "facing-a-big-decision", 3, "decision|decide|deciding|choice|choose|choosing|crossroads|options|torn between|which way|big decision"],
  ["hopeful", "need-direction", 3, "direction|guidance|guide me|calling|my path|what to do|where to go|next step|feel lost|feeling lost|so lost"],
  ["doubtful", "", 3, "doubt|doubts|doubting|doubtful|skeptical|questions|holding questions|confused|confusion|hard to believe|unsure"],
  ["doubtful", "questioning-faith", 3, "faith|believe|belief|is god real|god real|god exist|does god exist|bible true|religion|why does god|why would god"],
  ["doubtful", "feeling-far-from-god", 3, "far from god|god feels far|god is far|distant from god|god is silent|god feels silent|can not feel god|abandoned by god|spiritually dry|dry|drifted|drifting|far away"],
  ["doubtful", "unanswered-prayer", 3, "unanswered|unanswered prayer|prayed|praying|no answer|not listening|not answering|ignored my prayer|nothing changes"],
  ["doubtful", "seeking-peace", 3, "peace|need peace|want peace|calm|quiet|stillness|unsettled|settle my heart"],
];

const NEGATORS = new Set(["not", "no", "never", "without", "nor"]);
const INTENSIFIERS = new Set(["so", "very", "really", "extremely", "completely", "totally", "deeply", "incredibly", "super", "too"].map(word => stem(word)));
/** A negated cue for a bright feeling leans toward this one instead ("not hopeful" sounds doubtful). */
const NEGATED_SHIFT: Readonly<Record<string, string>> = { hopeful: "doubtful", grateful: "sad" };

/** A light, consistent stemmer: the same rules apply to the lexicon and the input, so only consistency matters. */
export function stem(word: string): string {
  let w = word;
  if (w.length > 4 && w.endsWith("ies")) w = `${w.slice(0, -3)}y`;
  else if (w.length > 3 && w.endsWith("s") && !/(ss|us|is)$/.test(w)) w = w.slice(0, -1);
  if (w.length > 4 && w.endsWith("ied")) return `${w.slice(0, -3)}y`;
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith("ly")) return w.slice(0, -2);
  return w;
}

const BREAK = "|";
/** Lowercase words, contractions opened up, clause breaks kept as "|" so negation and phrases stop there. */
export function tokenize(text: string): string[] {
  const clean = text.slice(0, MAX_WORDS_LENGTH).toLowerCase().replace(/[‘’ʼ]/g, "'")
    .replace(/\bcan'?t\b|\bcannot\b/g, "can not").replace(/\bwon'?t\b/g, "will not").replace(/n't\b/g, " not")
    .replace(/'/g, "").replace(/[.,;:!?\n()]+|\bbut\b/g, ` ${BREAK} `);
  return clean.split(/[^a-z|]+/).filter(Boolean).map(word => (word === BREAK ? word : stem(word)));
}

interface Target { feeling: string; specific: string; weight: number }
interface Cue { tokens: string[]; targets: Target[] }

function buildLexicon(): Map<string, Cue[]> {
  const byKey = new Map<string, Cue>();
  for (const [feeling, specific, weight, list] of GROUPS) for (const entry of list.split("|")) {
    const tokens = tokenize(entry);
    const key = tokens.join(" ");
    const cue = byKey.get(key) ?? { tokens, targets: [] };
    if (cue.targets.some(target => target.feeling === feeling && target.specific === specific)) continue;
    cue.targets.push({ feeling, specific, weight });
    byKey.set(key, cue);
  }
  const byFirst = new Map<string, Cue[]>();
  for (const cue of byKey.values()) byFirst.set(cue.tokens[0], [...(byFirst.get(cue.tokens[0]) ?? []), cue]);
  for (const cues of byFirst.values()) cues.sort((a, b) => b.tokens.length - a.tokens.length);
  return byFirst;
}
const LEXICON = buildLexicon();

/** Every feeling and specific the lexicon can point to, for tests. */
export function lexiconTargets(): { feeling: string; specific: string }[] {
  return GROUPS.map(([feeling, specific]) => ({ feeling, specific }));
}

/** Up to `limit` feelings for the words, strongest first, each with its strongest specific (or null). */
export function findFeelings(text: string, limit = 3): FeelingMatch[] {
  const tokens = tokenize(text);
  const feelings = new Map<string, number>();
  const specifics = new Map<string, Map<string, number>>();
  let negateUntil = -1;
  let boostUntil = -1;
  for (let index = 0; index < tokens.length;) {
    const token = tokens[index];
    if (token === BREAK) { negateUntil = boostUntil = -1; index++; continue; }
    const cue = LEXICON.get(token)?.find(candidate => candidate.tokens.every((part, offset) => tokens[index + offset] === part));
    if (!cue) {
      if (NEGATORS.has(token)) negateUntil = index + 3;
      else if (INTENSIFIERS.has(token)) boostUntil = index + 2;
      index++;
      continue;
    }
    const negated = index <= negateUntil;
    const boost = index <= boostUntil ? 1.5 : 1;
    for (const { feeling, specific, weight } of cue.targets) {
      const amount = weight * boost;
      if (negated) {
        feelings.set(feeling, (feelings.get(feeling) ?? 0) - amount / 2);
        const shift = NEGATED_SHIFT[feeling];
        if (shift) feelings.set(shift, (feelings.get(shift) ?? 0) + amount / 2);
        continue;
      }
      feelings.set(feeling, (feelings.get(feeling) ?? 0) + amount);
      if (specific) {
        const inner = specifics.get(feeling) ?? new Map<string, number>();
        inner.set(specific, (inner.get(specific) ?? 0) + amount);
        specifics.set(feeling, inner);
      }
    }
    index += cue.tokens.length;
  }
  const ranked = FEELING_ORDER.filter(id => (feelings.get(id) ?? 0) > 0)
    .sort((a, b) => feelings.get(b)! - feelings.get(a)! || FEELING_ORDER.indexOf(a) - FEELING_ORDER.indexOf(b));
  const top = ranked.length ? feelings.get(ranked[0])! : 0;
  return ranked.filter(id => feelings.get(id)! >= Math.max(1, top * 0.4)).slice(0, Math.max(0, limit)).map(feeling => {
    const inner = [...(specifics.get(feeling) ?? new Map<string, number>())].sort((a, b) => b[1] - a[1]);
    return { feeling, specific: inner[0]?.[0] ?? null, score: feelings.get(feeling)! };
  });
}
