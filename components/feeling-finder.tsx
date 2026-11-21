"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FINDER_QUESTIONS, suggestFeelings } from "@/lib/feeling-finder";

interface Feeling { id: string; name: string; description: string }

export function FeelingFinder({ emotions }: { emotions: readonly Feeling[] }) {
  const [answers, setAnswers] = useState<number[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const step = answers.length;
  const done = step >= FINDER_QUESTIONS.length;
  useEffect(() => { if (step > 0) heading.current?.focus(); }, [step]);
  if (done) {
    const found = suggestFeelings(answers, emotions.map(emotion => emotion.id)).map(id => emotions.find(emotion => emotion.id === id)!).filter(Boolean);
    return <section className="finder" aria-labelledby="finder-result">
      <h2 id="finder-result" ref={heading} tabIndex={-1}>{found.length ? `This sounds like ${found[0].name}` : "Let us start with the wheel"}</h2>
      {found.length > 0 && <p className="lede">{found[0].description}. You can change your mind at any time.</p>}
      <div className="check-in-links">
        {found.map((feeling, index) => <Link key={feeling.id} className={index === 0 ? "pill" : "compare-link"} href={`/emotions/${feeling.id}`}>{index === 0 ? `Find verses for ${feeling.name}` : `Or try ${feeling.name}`}</Link>)}
        {found.length === 0 && <Link className="pill" href="/#choose-a-feeling">Choose a feeling</Link>}
      </div>
      <button type="button" className="quiet-link" onClick={() => setAnswers([])}>Start over</button>
    </section>;
  }
  const question = FINDER_QUESTIONS[step];
  return <section className="finder" aria-labelledby="finder-question">
    <p className="local-help">Question {step + 1} of {FINDER_QUESTIONS.length}</p>
    <h2 id="finder-question" ref={heading} tabIndex={-1}>{question.prompt}</h2>
    <ul className="finder-options">{question.options.map((option, index) => <li key={option.label}><button type="button" className="finder-option" onClick={() => setAnswers([...answers, index])}>{option.label}</button></li>)}</ul>
    {step > 0 && <button type="button" className="quiet-link" onClick={() => setAnswers(answers.slice(0, -1))}>Back</button>}
  </section>;
}
