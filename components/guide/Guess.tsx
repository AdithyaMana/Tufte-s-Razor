import React, { useId, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useIsArticle } from '../site/view.ts';

export interface GuessOption<T extends string> {
  value: T;
  label: string;
}

interface GuessProps<T extends string> {
  question: React.ReactNode;
  options: GuessOption<T>[];
  answer: T;
  /** What actually happens, shown once the reader has guessed. */
  reveal: React.ReactNode;
  /** Said first after a right guess, and after a wrong one. */
  right?: string;
  wrong?: string;
  onGuess?: (guess: T) => void;
  className?: string;
}

/**
 * Asks the reader to predict before the page shows them: a guess, even a wrong one, makes
 * the answer stick. Nothing waits on it; scrolling on shows the answer anyway. In the article
 * view it is simply the question and its answer.
 */
function Guess<T extends string>({
  question,
  options,
  answer,
  reveal,
  right = 'Right.',
  wrong = 'Not quite.',
  onGuess,
  className = '',
}: GuessProps<T>) {
  const [guess, setGuess] = useState<T | null>(null);
  const questionId = useId();
  const article = useIsArticle();
  const correct = guess === answer;

  if (article) {
    return (
      <>
        <p>
          <em>{question}</em>
        </p>
        <p>
          <strong className="font-bold">{options.find((o) => o.value === answer)!.label}.</strong> {reveal}
        </p>
      </>
    );
  }

  const choose = (value: T) => {
    if (guess) return;
    setGuess(value);
    onGuess?.(value);
  };

  return (
    <div className={className}>
      <div className="kicker">Guess first</div>
      <p id={questionId} className="mt-2 font-serif text-[1.3rem] md:text-[1.45rem] leading-snug text-content text-pretty">
        {question}
      </p>
      <div role="group" aria-labelledby={questionId} className="mt-4 flex flex-col gap-2">
        {options.map((option) => {
          const chosen = guess === option.value;
          const isAnswer = guess !== null && option.value === answer;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => choose(option.value)}
              aria-pressed={chosen}
              aria-disabled={guess !== null}
              className={`flex items-center justify-between gap-3 min-h-11 px-4 rounded-md border text-left font-sans text-[0.9375rem] transition-colors ${
                guess === null
                  ? 'border-line-2 text-content hover:border-content hover:bg-content/[0.03]'
                  : isAnswer
                    ? 'border-content text-content font-medium'
                    : chosen
                      ? 'border-line-2 text-content-2 line-through decoration-1'
                      : 'border-line text-chrome'
              } ${guess !== null ? 'cursor-default' : ''}`}
            >
              {option.label}
              {isAnswer && (
                <span className="shrink-0">
                  <Check size={16} aria-hidden="true" />
                  <span className="sr-only">(the answer)</span>
                </span>
              )}
              {chosen && !isAnswer && (
                <span className="shrink-0">
                  <X size={16} aria-hidden="true" />
                  <span className="sr-only">(your guess)</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {guess !== null && (
          <p className="mt-4 font-serif text-[1.1875rem] md:text-[1.3125rem] leading-[1.55] text-content">
            <strong className="font-bold">{correct ? right : wrong}</strong> {reveal}
          </p>
        )}
      </div>
    </div>
  );
}

export default Guess;
