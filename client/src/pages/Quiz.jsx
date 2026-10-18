import { useMemo, useRef, useState } from "react";
import api from "../utils/api";
import { QUIZ_DIFFICULTIES, QUIZ_GENRES, hintsPerQuiz } from "../utils/progression";

function decodeHtml(input = "") {
  try {
    const doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent || "";
  } catch {
    return input;
  }
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function newQuizId() {
  // Avoid adding a dependency just for UUIDs.
  // crypto.randomUUID is supported in modern browsers.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function Quiz({ setUser, user }) {
  const level = Math.max(1, Number(user?.level) || 1);
  const [status, setStatus] = useState("idle"); // idle | loading | inProgress | lose | complete
  const [questions, setQuestions] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [triesLeft, setTriesLeft] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState("");

  // XP is awarded once the user completes all five questions.
  const [quizId, setQuizId] = useState(null);
  const awardedCorrectRef = useRef(0);
  const [xpAdded, setXpAdded] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState("general");
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hiddenOptions, setHiddenOptions] = useState([]);

  const genre = QUIZ_GENRES.find((item) => item.id === selectedGenre) || QUIZ_GENRES[0];
  const difficulty = QUIZ_DIFFICULTIES.find((item) => item.id === selectedDifficulty) || QUIZ_DIFFICULTIES[0];
  const hintsAvailable = hintsPerQuiz(level);

  const currentQuestion = useMemo(() => {
    if (!questions || !Array.isArray(questions) || questions.length === 0) return null;
    return questions[currentIndex] || null;
  }, [questions, currentIndex]);

  const startQuiz = async () => {
    setStatus("loading");
    setFeedback("");
    setXpAdded(0);
    awardedCorrectRef.current = 0;
    setQuizId(newQuizId());
    setHintsUsed(0);
    setHiddenOptions([]);

    try {
      const params = new URLSearchParams({ amount: "5", category: String(genre.categoryId), difficulty: difficulty.id, type: "multiple" });
      const res = await fetch(`https://opentdb.com/api.php?${params.toString()}`);
      if (!res.ok) throw new Error(`Quiz provider returned HTTP ${res.status}`);
      const data = await res.json();
      if (data?.response_code !== 0) throw new Error("No questions are available for that selection right now. Try another genre or difficulty.");

      const normalized = (data?.results || []).map((q, idx) => {
        const question = decodeHtml(q.question);
        const correctText = decodeHtml(q.correct_answer);
        const incorrect = Array.isArray(q.incorrect_answers)
          ? q.incorrect_answers.map((x) => decodeHtml(x))
          : [];

        const options = shuffle([...incorrect, correctText]);
        const correctIndex = options.findIndex((o) => o === correctText);

        return {
          id: idx,
          category: decodeHtml(q.category),
          difficulty: decodeHtml(q.difficulty),
          question,
          options,
          correctIndex,
        };
      });

      if (!normalized.length) {
        throw new Error("No questions returned");
      }

      setQuestions(normalized);
      setCurrentIndex(0);
      setTriesLeft(3);
      setCorrectCount(0);
      setHiddenOptions([]);
      setStatus("inProgress");
    } catch (error) {
      setStatus("idle");
      alert(error?.message || "Failed to fetch quiz questions. Please try another selection.");
    }
  };

  const awardXpProgress = async ({ correct, total }) => {
    // Only start awarding XP once they have completed at least 5 questions.
    if (correct < 5) return;

    // Avoid redundant calls; server is also idempotent per quizId.
    if (correct <= awardedCorrectRef.current) return;

    try {
      const res = await api.post("/user/interaction", {
        event: "quizProgress",
        quizId,
        correct,
        total,
        difficulty: selectedDifficulty,
        categoryId: genre.categoryId,
      });

      const gained = res?.data?.xpAdded ?? Math.max(0, correct - awardedCorrectRef.current) * difficulty.xpPerCorrect;
      setXpAdded((prev) => prev + gained);
      awardedCorrectRef.current = Math.max(awardedCorrectRef.current, correct);

      if (res?.data?.user && typeof setUser === "function") {
        setUser((prev) => ({ ...(prev || {}), ...res.data.user }));
      }
    } catch {
      // Do not claim XP was earned unless the server confirms it.
      setFeedback("Your quiz finished, but XP could not be saved. Please check your connection and try again later.");
    }
  };

  const finishQuiz = async (finalCorrect) => {
    setStatus("complete");
    setFeedback("");
    await awardXpProgress({ correct: finalCorrect, total: questions?.length || 5 });
  };

  const useHint = () => {
    if (!currentQuestion || hintsUsed >= hintsAvailable) return;
    const wrongOptions = currentQuestion.options
      .map((_, index) => index)
      .filter((index) => index !== currentQuestion.correctIndex && !hiddenOptions.includes(index));
    const toHide = shuffle(wrongOptions).slice(0, Math.min(2, wrongOptions.length));
    setHiddenOptions((previous) => [...new Set([...previous, ...toHide])]);
    setHintsUsed((previous) => previous + 1);
    setFeedback("Hint used: two incorrect answers have been removed.");
  };

  const handleAnswer = async (pickedIndex) => {
    if (status !== "inProgress" || !currentQuestion) return;

    const isCorrect = pickedIndex === currentQuestion.correctIndex;

    if (isCorrect) {
      const nextCorrect = correctCount + 1;
      setCorrectCount(nextCorrect);
      setFeedback("Correct! Moving on...");

      const nextIndex = currentIndex + 1;
      if (!questions || nextIndex >= questions.length) {
        await finishQuiz(nextCorrect);
        return;
      }

      // The server only awards XP for a full five-question quiz.

      // Small delay feels nicer; also prevents rapid double-clicks.
      window.setTimeout(() => {
        setCurrentIndex(nextIndex);
        setTriesLeft(3);
        setHiddenOptions([]);
        setFeedback("");
      }, 400);

      return;
    }

    const nextTries = triesLeft - 1;
    if (nextTries <= 0) {
      alert("You Lose");
      setFeedback("");

      setStatus("lose");
      return;
    }

    setTriesLeft(nextTries);
    setFeedback(`Wrong answer. ${nextTries} ${nextTries === 1 ? "try" : "tries"} left.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-purple-600 to-blue-500 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-white drop-shadow-lg mb-8">
          Quiz Center
        </h1>

        {status === "idle" && (
          <section className="rounded-3xl border border-white/25 bg-white/15 p-6 shadow-2xl backdrop-blur-md sm:p-8">
            <p className="mb-5 text-center text-white/90">Choose your subject and challenge. New choices unlock as you level up.</p>
            <h2 className="mb-3 text-lg font-bold text-white">Quiz genre</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {QUIZ_GENRES.map((item) => {
                const locked = level < item.minLevel;
                const active = selectedGenre === item.id;
                return (
                  <button key={item.id} type="button" disabled={locked} onClick={() => setSelectedGenre(item.id)} className={`rounded-2xl border p-4 text-left transition ${active ? "border-white bg-white text-purple-800 shadow-lg" : "border-white/25 bg-white/10 text-white hover:bg-white/20"} ${locked ? "cursor-not-allowed opacity-55" : ""}`}>
                    <span className="block font-bold">{item.label}</span>
                    <span className={`mt-1 block text-xs ${active ? "text-purple-700" : "text-white/75"}`}>{locked ? `Unlocks at Level ${item.minLevel}` : item.description}</span>
                  </button>
                );
              })}
            </div>
            <h2 className="mb-3 mt-6 text-lg font-bold text-white">Difficulty</h2>
            <div className="flex flex-wrap gap-3">
              {QUIZ_DIFFICULTIES.map((item) => {
                const locked = level < item.minLevel;
                const active = selectedDifficulty === item.id;
                return (
                  <button key={item.id} type="button" disabled={locked} onClick={() => setSelectedDifficulty(item.id)} className={`rounded-full border px-5 py-2 font-semibold transition ${active ? "border-white bg-white text-purple-800" : "border-white/25 bg-white/10 text-white hover:bg-white/20"} ${locked ? "cursor-not-allowed opacity-55" : ""}`}>
                    {item.label}{locked ? ` · Level ${item.minLevel}` : ""}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-white/80">Hints: {hintsAvailable ? `${hintsAvailable} per quiz` : "Unlock your first hint at Level 2"}. Harder quizzes earn more XP per correct answer.</p>
            <button onClick={startQuiz} className="mx-auto mt-6 block rounded-full bg-white px-10 py-4 text-lg font-bold text-purple-700 shadow-xl transition hover:scale-105">Start {difficulty.label} {genre.label} Quiz</button>
          </section>
        )}

        {status === "loading" && (
          <div className="text-center text-white text-xl font-semibold">
            Loading questions...
          </div>
        )}

        {status === "lose" && (
          <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-3xl p-8 shadow-2xl text-center text-white">
            <h2 className="text-3xl font-extrabold mb-3">You Lose</h2>
            <p className="text-white/90 mb-2">You used all 3 tries on a question.</p>
            {correctCount >= 5 && (
              <p className="text-white/90 mb-6">You still earned +{xpAdded} XP for completing {correctCount} questions.</p>
            )}
            {correctCount < 5 && (
              <p className="text-white/90 mb-6">Answer all 5 questions correctly to earn XP. This run scored {correctCount}/5.</p>
            )}
            <button
              onClick={startQuiz}
              className="bg-white text-purple-700 px-10 py-4 rounded-full text-lg font-bold shadow-xl hover:scale-105 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {status === "complete" && (
          <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-3xl p-8 shadow-2xl text-center text-white">
            <h2 className="text-3xl font-extrabold mb-3">Quiz Complete!</h2>
            <p className="mb-2 text-white/90">{genre.label} · {difficulty.label}</p>
            <p className="text-xl mb-2">
              Score: <span className="font-bold">{correctCount}</span>/{questions?.length || 10}
            </p>
            {correctCount >= 5 ? (
              <p className="text-lg text-white/90 mb-6">+{xpAdded} XP</p>
            ) : (
              <p className="text-lg text-white/90 mb-6">Complete at least 5 questions to earn XP.</p>
            )}
            {feedback && <p role="alert" className="mb-5 text-sm text-amber-100">{feedback}</p>}
            <button
              onClick={startQuiz}
              className="bg-white text-purple-700 px-10 py-4 rounded-full text-lg font-bold shadow-xl hover:scale-105 transition"
            >
              Play Again
            </button>
          </div>
        )}

        {status === "inProgress" && currentQuestion && (
          <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-3xl p-8 shadow-2xl text-white">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <p className="text-white/90">
                Question <span className="font-bold">{currentIndex + 1}</span> / {questions.length}
              </p>
              <p className="text-white/90">
                Tries left: <span className="font-bold">{triesLeft}</span> / 3
              </p>
              <p className="text-white/90">{genre.label} · {difficulty.label}</p>
            </div>

            <div className="mb-6">
              <p className="text-2xl font-bold leading-snug">{currentQuestion.question}</p>
              <p className="text-sm text-white/80 mt-2">
                {currentQuestion.category} • {currentQuestion.difficulty}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQuestion.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={hiddenOptions.includes(idx)}
                  className={`text-left border rounded-2xl px-5 py-4 font-semibold shadow-lg transition ${hiddenOptions.includes(idx) ? "invisible" : "bg-white/10 hover:bg-white/20 border-white/20"}`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="mt-5 flex justify-center">
              <button type="button" onClick={useHint} disabled={hintsUsed >= hintsAvailable} className="rounded-full border border-white/40 px-5 py-2 font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50">
                {hintsAvailable ? `Use Hint · ${hintsAvailable - hintsUsed} left` : "Hint unlocks at Level 2"}
              </button>
            </div>

            {feedback && <p className="mt-6 text-center font-semibold">{feedback}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
