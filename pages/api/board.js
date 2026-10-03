const board = require("../../lib/board-state");

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  try {
    if (req.method === "GET") {
      const view =
        req.query.view === "host" ? board.hostView() : board.boardView();
      res.status(200).json(view);
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const body = req.body || {};
    if (body.action === "load-file") {
      board.loadFromFile(body.file);
    } else if (body.action === "load") {
      board.applyRounds(board.normalizeGame(body.game), body.name || "Custom game");
    } else if (body.action === "reveal") {
      board.reveal(body.index);
    } else if (body.action === "hide") {
      board.hide(body.index);
    } else if (body.action === "next") {
      board.go(1);
    } else if (body.action === "prev") {
      board.go(-1);
    } else if (body.action === "wrong") {
      board.wrong();
    } else if (body.action === "clear-strikes") {
      board.clearStrikes();
    } else {
      res.status(400).json({ error: "Unknown action" });
      return;
    }

    res.status(200).json(board.hostView());
  } catch (error) {
    res.status(400).json({ error: error.message || "Request failed" });
  }
}
