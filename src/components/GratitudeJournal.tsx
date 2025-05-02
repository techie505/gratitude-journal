import React, { useEffect, useState, useRef } from "react";
import { getGratitudePrompts } from "./prompts";
import Sentiment from "sentiment";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

const sentiment = new Sentiment();

const moods = [
  { value: "happy", label: "😊 Happy" },
  { value: "sad", label: "😔 Sad" },
  { value: "angry", label: "😠 Angry" },
  { value: "tired", label: "😴 Tired" },
  { value: "crying", label: "😢 Crying" },
  { value: "anxious", label: "😰 Anxious" },
  { value: "lonely", label: "🥺 Lonely" },
  { value: "depressed", label: "😞 Depressed" },
  { value: "empty", label: "😶 Empty" },
  { value: "guilty", label: "😔 Guilty" },
];

const themes = {
  lavender: "from-purple-100 via-pink-100 to-indigo-100",
  sky: "from-blue-100 via-cyan-100 to-indigo-100",
  forest: "from-green-100 via-teal-100 to-emerald-100",
  sunset: "from-yellow-100 via-rose-200 to-pink-300",
  dusk: "from-indigo-100 via-fuchsia-100 to-blue-200",
};

const getMotivationalQuote = (tone: string): string => {
  const quotes: Record<string, string[]> = {
    positive: [
      "Keep shining. Your energy is contagious 🌟",
      "Joy is strength. Stay with it 🌼",
      "You are the reason someone smiled today 😊",
    ],
    neutral: [
      "Even quiet days are part of your growth 🌱",
      "Peace is progress — honor the calm 🕊️",
      "You don’t have to feel big things to matter 💜",
    ],
    negative: [
      "You're allowed to feel. You're not alone 🫂",
      "Even in darkness, you're growing roots 🌑🌿",
      "You’ve survived 100% of your worst days 🌧️→🌤️",
    ],
  };

  const list = quotes[tone] || [];
  return list[Math.floor(Math.random() * list.length)];
};
const GratitudeJournal: React.FC = () => {
    const [selectedMood, setSelectedMood] = useState("default");
    const [prompts, setPrompts] = useState<string[]>([]);
    const [entry, setEntry] = useState("");
    const [tone, setTone] = useState<"positive" | "negative" | "neutral" | null>(null);
    const [quote, setQuote] = useState("");
    const [bgTheme, setBgTheme] = useState<keyof typeof themes>("lavender");
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
    const [listening, setListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
  
    useEffect(() => {
      if (selectedMood !== "default") {
        setPrompts(getGratitudePrompts(selectedMood));
      } else {
        setPrompts([]);
      }
    }, [selectedMood]);
  
    const handleSubmit = () => {
      const result = sentiment.analyze(entry);
      const score = result.score;
      const toneResult = score > 1 ? "positive" : score < -1 ? "negative" : "neutral";
      setTone(toneResult);
      setQuote(getMotivationalQuote(toneResult));
  
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.7 },
      });
    };
  
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
  
      const url = URL.createObjectURL(file);
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
  
      if (isImage) setMediaType("image");
      else if (isVideo) setMediaType("video");
      else return;
  
      setMediaPreview(url);
    };
  
    const toggleListening = () => {
      if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
        alert("Voice input is not supported in this browser.");
        return;
      }
  
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = "en-US";
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
  
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[event.results.length - 1][0].transcript;
          setEntry((prev) => prev + " " + transcript);
        };
      }
  
      if (listening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
      }
      setListening(!listening);
    };
  
    return (
      <div className={`min-h-screen bg-gradient-to-br ${themes[bgTheme]} p-6 sm:p-10 overflow-y-auto`}>
        <div className="max-w-4xl mx-auto space-y-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-purple-800">
            🖋️ Reflect. Release. Reconnect — Your Personal Journal
          </h1>
  
          {/* Controls */}
          <div className="bg-white rounded-2xl shadow p-6 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">💭 Mood</label>
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="w-full p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="default">How are you feeling?</option>
                {moods.map((mood) => (
                  <option key={mood.value} value={mood.value}>
                    {mood.label}
                  </option>
                ))}
              </select>
            </div>
  
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700">🎨 Theme</label>
              <select
                value={bgTheme}
                onChange={(e) => setBgTheme(e.target.value as keyof typeof themes)}
                className="w-full p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                {Object.keys(themes).map((theme) => (
                  <option key={theme} value={theme}>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
  
          {/* Prompt Suggestions */}
          {prompts.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-md space-y-3">
              <h2 className="text-xl font-bold text-purple-700">💡 Suggested Prompts</h2>
              <ul className="list-disc ml-6 text-gray-700 space-y-1">
                {prompts.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
              <p className="text-sm text-gray-500 mt-2">
                These are gentle ideas — you're free to ignore or explore them. 🌿
              </p>
            </div>
          )}
  
          {/* Journal Entry */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-bold text-purple-700 mb-2">📝 Your Thoughts</h2>
            <textarea
              rows={8}
              className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Type or speak your feelings here..."
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
            />
            <button
              onClick={toggleListening}
              className={`mt-3 px-4 py-2 rounded-md font-semibold transition ${
                listening ? "bg-red-500" : "bg-purple-600 hover:bg-purple-700"
              } text-white`}
            >
              {listening ? "🛑 Stop Voice" : "🎤 Start Voice Input"}
            </button>
          </div>
  
          {/* Media Upload */}
          <div className="bg-white p-6 rounded-2xl shadow-md space-y-3">
            <h2 className="text-xl font-bold text-purple-700">📎 Add a Photo or Video (optional)</h2>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-600"
            />
            {mediaPreview && (
              <div className="mt-4">
                {mediaType === "image" && (
                  <img
                    src={mediaPreview}
                    alt="Journal Attachment"
                    className="max-h-64 mx-auto rounded-lg shadow-md"
                  />
                )}
                {mediaType === "video" && (
                  <video
                    src={mediaPreview}
                    controls
                    className="max-h-64 mx-auto rounded-lg shadow-md"
                    muted
                  />
                )}
              </div>
            )}
          </div>
  
          {/* Submit */}
          <div className="flex justify-center mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition"
            >
              Save My Journal
            </motion.button>
          </div>
  
          {/* Tone Response */}
          {tone && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-8 bg-white p-6 rounded-2xl shadow-xl"
            >
              <p className="text-lg font-medium text-gray-700 italic">
                {tone === "positive"
                  ? "🌞 Your tone feels joyful."
                  : tone === "negative"
                  ? "🌧️ Your tone feels heavy."
                  : "🌿 Your tone feels peaceful."}
              </p>
              <p className="text-purple-600 font-semibold text-lg mt-3">💬 {quote}</p>
            </motion.div>
          )}
        </div>
      </div>
    );
  };
  
  export default GratitudeJournal;
  