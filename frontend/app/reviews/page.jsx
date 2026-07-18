"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import { FiInfo } from "react-icons/fi";

export default function CommunityPage() {
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [reviews]);
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("accessToken");

      const res = await fetch("http://127.0.0.1:8001/api/users/me/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setCurrentUser(data.username);
    };

    fetchCurrentUser();
  }, []);
  const fetchReviews = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8001/api/reviews/");
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchReviews();
  }, []);

  const sendMessage = async () => {
    if (!message.trim() || cooldown) return;

    try {
      setCooldown(true);
      setSecondsLeft(10);
      const timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCooldown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      const token = localStorage.getItem("accessToken");

      const response = await fetch("http://127.0.0.1:8001/api/reviews/", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          message,
        }),
      });

      if (response.ok) {
        setMessage("");
        fetchReviews();
      }
    } catch (err) {
      console.log(err);
    }
  };
  const [cooldown, setCooldown] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [showGuidelines, setShowGuidelines] = useState(false);
  return (
    <>
      <div className="bg-[#ece5dd] min-h-screen flex flex-col">
        <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-700 via-pink-600 to-orange-500 shadow-lg">
          <div className="max-w-6xl mx-auto h-16 flex items-center justify-between px-4">
            <div className="flex items-center">
              <button
                onClick={() => window.history.back()}
                className="text-white text-2xl"
              >
                ←
              </button>

              <div className="ml-4">
                <h2 className="text-white font-bold text-lg">
                  InstaBazaar Community
                </h2>

                <p className="text-purple-100 text-xs">
                  Every purchase has a story.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuidelines(true)}
              className="
        w-8
        h-8
        rounded-full
        bg-white/20
        text-white
        font-bold
        hover:bg-white/30
      "
            >
              <FiInfo size={18} />
            </button>
          </div>
        </div>
        {showGuidelines && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-3xl p-8 w-[500px] shadow-xl">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-2xl font-bold">Community Guidelines</h2>

                <button
                  onClick={() => setShowGuidelines(false)}
                  className="text-2xl font-bold text-gray-500"
                >
                  ×
                </button>
              </div>

              <ul className="space-y-3 text-gray-700">
                <li>✅ Share genuine shopping experiences.</li>

                <li>✅ Help others discover good products.</li>

                <li>✅ Respect every member of the community.</li>

                <li>❌ No spam or repeated messages.</li>

                <li>❌ No abusive, hateful or offensive language.</li>

                <li>❌ No promotions or unrelated advertisements.</li>
              </ul>

              <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm">
                <strong>Notice</strong>

                <p className="mt-2">
                  Reviews violating these guidelines may be removed by the
                  InstaBazaar administrators without prior notice.
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 pb-28">
          <div className="flex justify-center py-6">
            <div className="bg-yellow-100 border border-yellow-300 rounded-xl px-5 py-4 max-w-md text-center">
              <div className="text-2xl mb-2">🛍</div>

              <h3 className="font-bold">Welcome to InstaBazaar Community</h3>

              <p className="text-sm mt-2 text-gray-600">
                Discover products. Support creators. Share your shopping
                stories.
              </p>
            </div>
          </div>

          {reviews.map((review, index) => {
            const isCurrentUser = review.username === currentUser;

            return (
              <div
                key={review.id}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                } mb-5 gap-3`}
              >
                {!isCurrentUser && (
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                    {review.username.charAt(0).toUpperCase()}
                  </div>
                )}

                <div
                  className={`rounded-2xl shadow-sm px-5 py-3 max-w-[420px]
min-w-[220px] ${isCurrentUser ? "bg-[#dcf8c6]" : "bg-white"}`}
                >
                  {!isCurrentUser && (
                    <div
                      className="
      absolute
      -left-2
      top-4
      w-4
      h-4
      bg-white
      rotate-45
    "
                    />
                  )}
                  {isCurrentUser && (
                    <div
                      className="
      absolute
      -right-2
      top-4
      w-4
      h-4
      bg-[#dcf8c6]
      rotate-45
    "
                    />
                  )}
                  <p
                    className={`font-semibold ${
                      isCurrentUser ? "text-green-700" : "text-purple-600"
                    }`}
                  >
                    {review.username}
                  </p>

                  <p className="mt-2 text-gray-700">{review.message}</p>

                  <p className="text-xs text-right text-gray-400 mt-2">
                    {new Date(review.created_at).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {isCurrentUser && (
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                    {review.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div ref={bottomRef}></div>

        <div className="fixed bottom-0 left-0 right-0  ">
          <div className="max-w-5xl mx-auto flex items-center gap-3 p-3">
            <input
              type="text"
              placeholder="Type something nice..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="
                  flex-1
                  bg-white
                  rounded-full
                  px-6
                  py-3
                  outline-none
                  shadow-sm
                "
            />

            <button
              onClick={sendMessage}
              disabled={cooldown}
              className={`
    w-12
    h-12
    rounded-full
    text-white
    text-xl
    flex
    items-center
    justify-center
    transition
    ${
      cooldown
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-[#00a884] hover:scale-105"
    }
  `}
            >
              {cooldown ? secondsLeft : "➤"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
