import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import AnswerBoard from "../components/feud/answer-board";

export default function GameWindow() {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState(null);
  const lastBuzz = useRef(null);
  const lastReveal = useRef(null);
  const [flashStrike, setFlashStrike] = useState(false);

  useEffect(() => {
    if (!ready) return undefined;
    let stop = false;
    const wrong = new Audio("/wrong.mp3");
    const reveal = new Audio("/good-answer.mp3");
    wrong.volume = 0.9;
    reveal.volume = 0.9;

    async function tick() {
      try {
        const res = await fetch("/api/board");
        const data = await res.json();
        if (stop) return;

        const shown = (data.answers || []).filter((answer) => answer.revealed).length;
        if (lastBuzz.current != null && data.buzz > lastBuzz.current) {
          wrong.currentTime = 0;
          wrong.play().catch(() => {});
          setFlashStrike(true);
          window.setTimeout(() => setFlashStrike(false), 900);
        }
        if (
          lastReveal.current != null &&
          data.round === lastReveal.current.round &&
          shown > lastReveal.current.shown
        ) {
          reveal.currentTime = 0;
          reveal.play().catch(() => {});
        }
        lastBuzz.current = data.buzz;
        lastReveal.current = { round: data.round, shown };
        setState(data);
      } catch (err) {
        if (!stop) {
          setState((prev) => prev);
        }
      }
    }

    tick();
    const id = setInterval(tick, 400);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [ready]);

  return (
    <>
      <Head>
        <title>Family Feud</title>
      </Head>
      <main className="min-h-screen flex items-center justify-center px-4 py-8">
        {!ready ? (
          <button
            type="button"
            className="text-white text-3xl font-bold border-4 border-white rounded-3xl px-10 py-8"
            onClick={() => setReady(true)}
          >
            Click to show the board
          </button>
        ) : state && state.loaded ? (
          <div className="w-full max-w-5xl">
            <AnswerBoard
              question={state.question}
              answers={state.answers}
              strikes={state.strikes}
              round={state.round}
              roundCount={state.roundCount}
              buzz={state.buzz}
              teams={state.teams}
              flashStrike={flashStrike}
            />
          </div>
        ) : (
          <div className="text-white text-3xl text-center">
            <img src="/comicon-vizag-logo.svg" alt="Comic Con Vizag" className="waiting-logo" />
            Waiting for the host to load a game.
          </div>
        )}
      </main>
    </>
  );
}
