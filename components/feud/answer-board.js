export default function AnswerBoard({
  question,
  answers,
  strikes,
  round,
  roundCount,
  buzz,
  teams = [],
  flashStrike = false,
}) {
  return (
    <div className="w-full relative">
      {flashStrike ? <div className="strike-flash" aria-label="Wrong answer"><span>✕</span></div> : null}
      {teams.length ? (
        <div className="grid grid-cols-2 gap-3 mb-5 text-center">
          {teams.map((team, index) => (
            <div key={index} className="rounded-2xl border-2 border-yellow-300 bg-blue-950 px-3 py-2 text-white shadow-lg">
              <p className="uppercase text-xs md:text-sm tracking-wider text-blue-100 truncate">{team.name}</p>
              <p className="text-3xl md:text-5xl font-black leading-none">{team.score}</p>
            </div>
          ))}
        </div>
      ) : null}
      <div className="text-center text-white mb-5">
        <p className="uppercase tracking-widest text-sm text-blue-100">
          {roundCount > 0 ? `Question ${round + 1} of ${roundCount}` : "Family Feud"}
        </p>
        <h1
          className="text-2xl md:text-4xl font-bold mt-2 leading-tight"
          style={{
            fontFamily: "Roboto Bold, Roboto, sans-serif",
            textShadow: "0 2px 0 #083a86",
          }}
        >
          {question || "Waiting for a question"}
        </h1>
      </div>

      <div
        className="rounded-3xl bg-black p-3 md:p-4"
        style={{ boxShadow: "inset 0 0 0 6px #f5c518" }}
      >
        <div className="flex flex-col gap-3">
          {(answers || []).map((answer, index) => (
            <div
              key={`${round}-${index}`}
              className="h-16 md:h-20 rounded-lg overflow-hidden border-2 border-black bg-gradient-to-b from-blue-400 to-blue-800"
            >
              {answer.revealed ? (
                <div className="h-full flex items-stretch">
                  <p
                    className="flex-1 flex items-center justify-center text-center text-white text-xl md:text-3xl font-extrabold uppercase px-4"
                    style={{ textShadow: "1px 2px 3px #000" }}
                  >
                    {answer.text}
                  </p>
                  <div className="w-20 md:w-28 flex items-center justify-center bg-gradient-to-b from-blue-700 to-blue-900 border-l-2 border-black text-white text-3xl md:text-4xl font-black">
                    {answer.points}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <span className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-blue-200 bg-blue-900 text-white text-2xl md:text-3xl font-black flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-5 mt-6" key={buzz}>
        {[0, 1, 2].map((slot) => {
          const on = slot < strikes;
          return (
            <div
              key={slot}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-black flex items-center justify-center text-5xl font-black ${
                on ? "bg-red-600 text-white strike-pop" : "text-transparent"
              }`}
              style={on ? undefined : { backgroundColor: "#083a86" }}
            >
              X
            </div>
          );
        })}
      </div>
    </div>
  );
}
