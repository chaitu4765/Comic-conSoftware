import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import AnswerBoard from "../components/feud/answer-board";

function play(src) {
  const audio = new Audio(src);
  audio.play().catch(() => {});
}

export default function Host() {
  const [games, setGames] = useState([]);
  const [filter, setFilter] = useState("");
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let stop = false;
    fetch("/api/games")
      .then((res) => res.json())
      .then((data) => {
        if (!stop) setGames(data.games || []);
      })
      .catch(() => {
        if (!stop) setError("Could not list games");
      });
    fetch("/api/board?view=host")
      .then((res) => res.json())
      .then((data) => {
        if (!stop) setState(data);
      })
      .catch(() => {
        if (!stop) setError("Could not reach the game");
      });
    return () => {
      stop = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return games;
    return games.filter((file) => file.toLowerCase().includes(query));
  }, [games, filter]);

  async function act(payload) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "That action failed");
        return;
      }
      setState(data);
    } catch (err) {
      setError("Lost the connection to the game");
    } finally {
      setBusy(false);
    }
  }

  function onUpload(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const game = JSON.parse(String(reader.result));
        act({ action: "load", game, name: file.name.replace(/\.json$/i, "") });
      } catch (err) {
        setError("That file is not valid JSON");
      }
    };
    reader.readAsText(file);
  }

  const round =
    state && state.loaded ? state.rounds[state.round] : null;
  const revealed =
    state && state.loaded ? state.revealed[state.round] : [];
  const strikes = state && state.loaded ? state.strikes[state.round] : 0;
  const previewAnswers = round
    ? round.answers.map((answer, index) => ({
        revealed: revealed[index],
        text: revealed[index] ? answer.text : "",
        points: revealed[index] ? answer.points : null,
      }))
    : [];
  const availablePoints = previewAnswers.reduce(
    (total, answer, index) => total + (
      answer.revealed && (!state.answerAwards || !state.answerAwards[state.round] || state.answerAwards[state.round][index] === null)
        ? Number(answer.points || 0)
        : 0
    ),
    0
  );

  return (
    <>
      <Head>
        <title>Family Feud host</title>
      </Head>
      <main className="min-h-screen text-white">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section>
            <p className="uppercase tracking-widest text-blue-100 text-sm mb-3">
              Game window
            </p>
            {round ? (
              <AnswerBoard
                question={round.question}
                answers={previewAnswers}
                strikes={strikes}
                round={state.round}
                roundCount={state.rounds.length}
                buzz={state.buzz}
                teams={state.teams}
              />
            ) : (
              <div
                className="rounded-3xl border-4 border-dashed border-blue-200 flex items-center justify-center p-10 text-center text-xl"
                style={{ minHeight: "16rem" }}
              >
                Load a game to put a question on the board.
              </div>
            )}
          </section>

          <section className="bg-blue-900 bg-opacity-40 rounded-3xl p-5 border border-blue-300 border-opacity-40">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-3xl font-bold">Host controller</h2>
                <p className="text-blue-100 mt-1">
                  {state && state.loaded
                    ? state.name
                    : "Pick a game or upload a JSON file"}
                </p>
              </div>
              <button
                type="button"
                className="flex-shrink-0 rounded-xl bg-white text-blue-900 font-bold px-4 py-3"
                onClick={() => window.open("/game", "feud-board")}
              >
                Open game window
              </button>
            </div>

            <label className="block text-sm uppercase tracking-wide text-blue-100 mb-1">
              Find a game
            </label>
            <input
              className="w-full rounded-xl px-3 py-2 text-black mb-2"
              placeholder="Search game files"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
            <div className="flex flex-col sm:flex-row gap-2 mb-5">
              <select
                className="flex-1 rounded-xl px-3 py-2 text-black"
                defaultValue=""
                onChange={(event) => {
                  if (event.target.value) {
                    act({ action: "load-file", file: event.target.value });
                  }
                }}
                disabled={busy}
              >
                <option value="">Load a saved game</option>
                {filtered.map((file) => (
                  <option key={file} value={file}>
                    {file.replace(/\.json$/i, "").replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <label className="rounded-xl bg-white text-blue-900 font-bold px-4 py-2 text-center cursor-pointer">
                Upload JSON
                <input
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={onUpload}
                />
              </label>
            </div>

            <div className="flex gap-2 mb-5">
              <button
                type="button"
                className="flex-1 rounded-xl bg-blue-700 font-bold py-3 disabled:opacity-40"
                disabled={!round || state.round === 0 || busy}
                onClick={() => act({ action: "prev" })}
              >
                Previous
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl bg-white text-blue-900 font-bold py-3 disabled:opacity-40"
                disabled={!round || state.round >= state.rounds.length - 1 || busy}
                onClick={() => act({ action: "next" })}
              >
                Next question
              </button>
            </div>

            <div className="flex flex-col gap-2 mb-5 max-h-80 overflow-auto pr-1">
              {round
                ? round.answers.map((answer, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-xl px-3 py-2"
                      style={{ backgroundColor: "rgba(6, 32, 84, 0.45)" }}
                    >
                      <span className="w-8 text-xl font-black">{index + 1}</span>
                      <span className="flex-1 font-semibold uppercase">
                        {answer.text}
                      </span>
                      <span className="w-12 text-right text-2xl font-black">
                        {answer.points}
                      </span>
                      <button
                        type="button"
                        className="rounded-lg px-3 py-2 font-bold bg-yellow-400 text-black disabled:opacity-40"
                        disabled={busy}
                        onClick={() => {
                          if (!revealed[index]) play("/good-answer.mp3");
                          act({
                            action: revealed[index] ? "hide" : "reveal",
                            index,
                          });
                        }}
                      >
                        {revealed[index] ? "Hide" : "Show"}
                      </button>
                    </div>
                  ))
                : null}
            </div>

            <button
              type="button"
              className="w-full rounded-2xl bg-red-600 text-white text-3xl font-black py-5 tracking-wide disabled:opacity-40"
              disabled={!round || busy}
              onClick={() => {
                play("/wrong.mp3");
                act({ action: "wrong" });
              }}
            >
              Wrong answer
            </button>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              {(state && state.teams ? state.teams : []).map((team, index) => (
                <div key={index} className="rounded-xl bg-blue-950 p-3 border border-blue-300">
                  <label className="block text-xs uppercase tracking-wider text-blue-100 mb-1">Team {index + 1}</label>
                  <input className="w-full rounded-lg px-2 py-1 text-black font-bold" value={team.name} onChange={(event) => act({ action: "set-team-name", team: index, name: event.target.value })} disabled={busy} />
                  <input type="number" min="0" className="w-full rounded-lg px-2 py-1 text-black text-center text-3xl font-black my-2" value={team.score} onChange={(event) => act({ action: "set-team-score", team: index, score: event.target.value })} disabled={busy} aria-label={`${team.name} score`} />
                  <button type="button" className="w-full rounded-lg bg-yellow-400 text-black font-black py-2 disabled:opacity-40" disabled={!round || availablePoints === 0 || busy} onClick={() => act({ action: "add-shown-points", team: index })}>
                    {availablePoints === 0 ? "Points awarded" : `Add ${availablePoints} new points`}
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="w-full mt-2 text-blue-100 underline disabled:opacity-40"
              disabled={!round || strikes === 0 || busy}
              onClick={() => act({ action: "clear-strikes" })}
            >
              Clear Xs
            </button>

            {error ? <p className="mt-4 text-red-200 text-lg">{error}</p> : null}
          </section>
        </div>
      </main>
    </>
  );
}
