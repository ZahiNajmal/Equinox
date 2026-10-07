import { useMemo, useRef, useState } from "react";
import api from "../utils/api";

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

export default function Quiz({ setUser }) {
  const [status, setStatus] = useState("idle"); // idle | loading | inProgress | lose | complete
  const [questions, setQuestions] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [triesLeft, setTriesLeft] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState("");

  // XP is awarded once the user completes at least 5 questions.
  // After that, XP increments as they complete more questions (so the Dashboard updates immediately).
  const [quizId, setQuizId] = useState(null);
  const [awardedCorrect, setAwardedCorrect] = useState(0);
  const awardedCorrectRef = useRef(0);
  const [xpAdded, setXpAdded] = useState(0);

  const currentQuestion = useMemo(() => {
    if (!questions || !Array.isArray(questions) || questions.length === 0) return null;
    return questions[currentIndex] || null;
  }, [questions, currentIndex]);

  const startQuiz = async () => {
    setStatus("loading");
    setFeedback("");
    setXpAdded(0);
    setAwardedCorrect(0);
    awardedCorrectRef.current = 0;
    setQuizId(newQuizId());

    try {
      const res = await fetch("https://opentdb.com/api.php?amount=5");
      const data = await res.json();

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
      setStatus("inProgress");
    } catch {
      setStatus("idle");
      alert("Failed to fetch quiz questions");
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
      });

      const gained = res?.data?.xpAdded ?? Math.max(0, correct - awardedCorrectRef.current) * 20;
      setXpAdded((prev) => prev + gained);
      awardedCorrectRef.current = Math.max(awardedCorrectRef.current, correct);
      setAwardedCorrect(awardedCorrectRef.current);

      if (res?.data?.user && typeof setUser === "function") {
        setUser((prev) => ({ ...(prev || {}), ...res.data.user }));
      }
    } catch {
      // Non-fatal: still reflect XP locally for the session UI.
      const gained = Math.max(0, correct - awardedCorrectRef.current) * 20;
      setXpAdded((prev) => prev + gained);
      awardedCorrectRef.current = Math.max(awardedCorrectRef.current, correct);
      setAwardedCorrect(awardedCorrectRef.current);
    }
  };

  const finishQuiz = async (finalCorrect) => {
    setStatus("complete");
    setFeedback("");
    await awardXpProgress({ correct: finalCorrect, total: questions?.length || 10 });
  };

  const handleAnswer = async (pickedIndex) => {
    if (status !== "inProgress" || !currentQuestion) return;

    const isCorrect = pickedIndex === currentQuestion.correctIndex;

    if (isCorrect) {
      const nextCorrect = correctCount + 1;
      setCorrectCount(nextCorrect);
      setFeedback("Correct! Moving on...");

      // Once they hit 5 completed questions, start awarding XP as they progress.
      void awardXpProgress({ correct: nextCorrect, total: questions?.length || 10 });

      const nextIndex = currentIndex + 1;
      if (!questions || nextIndex >= questions.length) {
        await finishQuiz(nextCorrect);
        return;
      }

      // Small delay feels nicer; also prevents rapid double-clicks.
      window.setTimeout(() => {
        setCurrentIndex(nextIndex);
        setTriesLeft(3);
        setFeedback("");
      }, 400);

      return;
    }

    const nextTries = triesLeft - 1;
    if (nextTries <= 0) {
      alert("You Lose");
      setFeedback("");

      // Top off any remaining XP for this quiz session (only kicks in once >= 5 are completed).
      await awardXpProgress({ correct: correctCount, total: questions?.length || correctCount });

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
          <button
            onClick={startQuiz}
            className="block mx-auto bg-white/15 hover:bg-white/25 text-white px-12 py-6 rounded-full text-xl font-bold backdrop-blur-md border border-white/25 shadow-2xl hover:scale-105 transition"
          >
            Generate Quiz
          </button>
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
              <p className="text-white/90 mb-6">Complete at least 5 questions to earn XP.</p>
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
            <p className="text-xl mb-2">
              Score: <span className="font-bold">{correctCount}</span>/{questions?.length || 10}
            </p>
            {correctCount >= 5 ? (
              <p className="text-lg text-white/90 mb-6">+{xpAdded} XP</p>
            ) : (
              <p className="text-lg text-white/90 mb-6">Complete at least 5 questions to earn XP.</p>
            )}
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
                  className="text-left bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl px-5 py-4 font-semibold shadow-lg transition"
                >
                  {opt}
                </button>
              ))}
            </div>

            {feedback && <p className="mt-6 text-center font-semibold">{feedback}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
