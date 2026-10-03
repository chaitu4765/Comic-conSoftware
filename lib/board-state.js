const fs = require("fs");
const path = require("path");
const glob = require("glob");

const gamesRoot = path.resolve(process.cwd(), "games");

function emptyState() {
  return {
    loaded: false,
    name: "",
    rounds: [],
    round: 0,
    revealed: [],
    strikes: [],
    buzz: 0,
  };
}

const globalKey = "__familyFeudBoard";

function getState() {
  if (!global[globalKey]) {
    global[globalKey] = emptyState();
  }
  return global[globalKey];
}

function setState(next) {
  global[globalKey] = next;
}

function normalizeGame(data) {
  const source = data && Array.isArray(data.rounds) ? data.rounds : null;
  if (!source) {
    throw new Error("Game file needs a rounds array of questions");
  }

  const rounds = source
    .map((round) => {
      const answers = (round.answers || [])
        .map((answer) => ({
          text: String(answer.ans ?? answer.text ?? answer.answer ?? "").trim(),
          points: Number(answer.pnt ?? answer.points ?? answer.score ?? 0) || 0,
        }))
        .filter((answer) => answer.text.length > 0);

      return {
        question: String(round.question || "").trim(),
        answers,
      };
    })
    .filter((round) => round.question && round.answers.length > 0);

  if (rounds.length === 0) {
    throw new Error("No questions with answers were found in that file");
  }

  return rounds;
}

function applyRounds(rounds, name) {
  setState({
    loaded: true,
    name: name || "Custom game",
    rounds,
    round: 0,
    revealed: rounds.map((round) => round.answers.map(() => false)),
    strikes: rounds.map(() => 0),
    buzz: 0,
  });
}

function loadFromFile(relPath) {
  const cleaned = String(relPath || "")
    .replace(/^\/+/, "")
    .replace(/\\/g, "/");
  const abs = path.resolve(gamesRoot, cleaned);
  const rootPrefix = gamesRoot.endsWith(path.sep) ? gamesRoot : gamesRoot + path.sep;
  if (abs !== gamesRoot && !abs.startsWith(rootPrefix)) {
    throw new Error("That game path is not allowed");
  }
  if (path.extname(abs).toLowerCase() !== ".json") {
    throw new Error("Game file must be a .json file");
  }
  if (!fs.existsSync(abs)) {
    throw new Error("Game file was not found");
  }

  const parsed = JSON.parse(fs.readFileSync(abs, "utf8"));
  const label = cleaned.replace(/\.json$/i, "").replace(/_/g, " ");
  applyRounds(normalizeGame(parsed), label);
}

function listGames() {
  return glob
    .sync("**/*.json", { cwd: gamesRoot, nodir: true })
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
}

function requireGame() {
  if (!getState().loaded) {
    throw new Error("Load a game first");
  }
}

function reveal(index) {
  requireGame();
  const state = getState();
  const flags = state.revealed[state.round];
  const i = Number(index);
  if (!flags || !Number.isInteger(i) || i < 0 || i >= flags.length) {
    throw new Error("That answer is not on this question");
  }
  flags[i] = true;
}

function hide(index) {
  requireGame();
  const state = getState();
  const flags = state.revealed[state.round];
  const i = Number(index);
  if (!flags || !Number.isInteger(i) || i < 0 || i >= flags.length) {
    throw new Error("That answer is not on this question");
  }
  flags[i] = false;
}

function go(delta) {
  requireGame();
  const state = getState();
  const next = state.round + delta;
  if (next < 0 || next >= state.rounds.length) {
    return;
  }
  state.round = next;
}

function wrong() {
  requireGame();
  const state = getState();
  if (state.strikes[state.round] < 3) {
    state.strikes[state.round] += 1;
  }
  state.buzz += 1;
}

function clearStrikes() {
  requireGame();
  getState().strikes[getState().round] = 0;
}

function hostView() {
  return JSON.parse(JSON.stringify(getState()));
}

function boardView() {
  const state = getState();
  if (!state.loaded) {
    return {
      loaded: false,
      name: "",
      buzz: state.buzz,
      strikes: 0,
      round: 0,
      roundCount: 0,
      question: "",
      answers: [],
    };
  }

  const round = state.rounds[state.round];
  const revealed = state.revealed[state.round];
  return {
    loaded: true,
    name: state.name,
    buzz: state.buzz,
    strikes: state.strikes[state.round],
    round: state.round,
    roundCount: state.rounds.length,
    question: round.question,
    answers: round.answers.map((answer, index) => ({
      revealed: revealed[index],
      text: revealed[index] ? answer.text : "",
      points: revealed[index] ? answer.points : null,
    })),
  };
}

module.exports = {
  listGames,
  loadFromFile,
  normalizeGame,
  applyRounds,
  reveal,
  hide,
  go,
  wrong,
  clearStrikes,
  hostView,
  boardView,
};
