import assert from 'node:assert/strict';
import test from 'node:test';
const { findFeelings, lexiconTargets, tokenize, FEELING_ORDER, MAX_WORDS_LENGTH } = await import('../lib/feeling-words.ts');
const { default: emotions } = await import('../data/emotions.json', { with: { type: 'json' } });

const top = text => findFeelings(text)[0];

test('the lexicon points only at real feelings and specifics, in the real order', () => {
  assert.deepEqual([...FEELING_ORDER], emotions.map(emotion => emotion.id));
  for (const { feeling, specific } of lexiconTargets()) {
    const emotion = emotions.find(item => item.id === feeling);
    assert.ok(emotion, `${feeling} is not a feeling`);
    if (specific) assert.ok(emotion.specifics.some(item => item.id === specific), `${feeling}/${specific} is not a specific`);
  }
});

test('every feeling is reachable from its own name and its description', () => {
  for (const emotion of emotions) {
    assert.equal(top(emotion.name).feeling, emotion.id, emotion.name);
    assert.equal(top(emotion.description).feeling, emotion.id, emotion.description);
  }
});

test('every specific is reachable from its own name', () => {
  for (const emotion of emotions) for (const specific of emotion.specifics) {
    const match = top(specific.name);
    assert.deepEqual([match?.feeling, match?.specific], [emotion.id, specific.id], specific.name);
  }
});

const samples = [
  ["I can't stop worrying about my exams next week", 'anxious', 'worried-about-the-future'],
  ["It's 3am and I can't sleep again", 'anxious', 'cant-sleep'],
  ['There is just too much going on and I am drowning', 'anxious', 'overwhelmed'],
  ['I am scared of what the doctor will say', 'anxious', 'afraid'],
  ['My grandma passed away last week and I miss her', 'sad', 'grieving'],
  ['Nobody really cares, I feel so alone', 'sad', 'lonely'],
  ['I did not get the job and I am really let down', 'sad', 'disappointed'],
  ['I just feel numb and empty inside', 'sad', 'feeling-empty'],
  ['I am so fed up, nothing works no matter what I try', 'angry', 'frustrated'],
  ['My best friend lied to me and went behind my back', 'angry', 'betrayed'],
  ['I still hold a grudge and feel bitter about it', 'angry', 'resentful'],
  ['I keep losing my temper with my kids', 'angry', 'need-patience'],
  ['I am completely burnt out at work', 'tired', 'burned-out'],
  ['I feel defeated, what is the point of trying', 'tired', 'discouraged'],
  ['Chronic pain makes every day hard, I need strength', 'tired', 'need-strength'],
  ['I want to give up on everything', 'tired', 'wanting-to-quit'],
  ['I feel so ashamed of myself', 'guilty', 'ashamed'],
  ['Please forgive me, I hurt someone I love', 'guilty', null],
  ['I really messed up today', 'guilty', 'made-a-mistake'],
  ['I relapsed again and the temptation is strong', 'guilty', 'struggling-with-sin'],
  ['Thankful for my family and friends today', 'grateful', 'thankful-for-people'],
  ['We are celebrating our anniversary', 'grateful', 'celebrating'],
  ['God answered my prayer, she is healed', 'grateful', 'answered-prayer'],
  ['Starting a new job on Monday and a bit excited', 'hopeful', 'starting-something-new'],
  ['I have a big decision to make about moving', 'hopeful', null],
  ['I feel lost and do not know what to do with my life', 'hopeful', 'need-direction'],
  ['Still waiting and wondering how long this will take', 'hopeful', 'waiting-on-god'],
  ['Is God even real? I have so many doubts', 'doubtful', null],
  ['God feels far away lately', 'doubtful', 'feeling-far-from-god'],
  ['I have prayed for years and there is no answer', 'doubtful', 'unanswered-prayer'],
  ['I just want some peace and quiet in my heart', 'doubtful', 'seeking-peace'],
];

test('sample phrases map sensibly', () => {
  for (const [text, feeling, specific] of samples) {
    const match = top(text);
    assert.equal(match?.feeling, feeling, `${text} -> ${JSON.stringify(findFeelings(text))}`);
    if (specific) assert.equal(match.specific, specific, `${text} -> ${match.specific}`);
  }
});

test('negation leans away from a feeling', () => {
  assert.notEqual(top('I am not angry, just really sad')?.feeling, 'angry');
  assert.equal(top('I am not hopeful at all')?.feeling, 'doubtful');
  assert.equal(top('not grateful, just heavy')?.feeling, 'sad');
  assert.deepEqual(findFeelings('not angry'), []);
});

test('mixed words give up to three suggestions, strongest first, no duplicates', () => {
  const result = findFeelings('Anxious and tired and a little sad and angry too');
  assert.ok(result.length >= 2 && result.length <= 3);
  assert.equal(new Set(result.map(match => match.feeling)).size, result.length);
  for (let i = 1; i < result.length; i++) assert.ok(result[i - 1].score >= result[i].score);
  assert.equal(findFeelings('anxious tired sad', 1).length, 1);
});

test('empty, unrelated or hostile input finds nothing and never throws', () => {
  for (const text of ['', '   ', 'the quick brown fox', '<script>alert(1)</script>', '\u0000￿', '!!!']) assert.deepEqual(findFeelings(text), [], text);
  assert.equal(findFeelings('x'.repeat(100000)).length, 0);
  assert.ok(tokenize('sad '.repeat(1000)).length <= MAX_WORDS_LENGTH);
  assert.deepEqual(findFeelings('sad', 0), []);
});

test('curly apostrophes and contractions read the same as plain ones', () => {
  assert.deepEqual(findFeelings('I can’t sleep'), findFeelings("I cannot sleep"));
  assert.deepEqual(tokenize("don't"), ['do', 'not']);
});
