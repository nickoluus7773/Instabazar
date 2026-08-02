"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";

export default function EditReviewModal({ review, onClose, onSave }) {
  const [message, setMessage] = useState(review.message);

  const handleSubmit = () => {
    onSave(review.id, message);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl">
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 p-6 flex justify-between items-center">
          <h2 className="text-white text-xl font-bold">Edit Review</h2>

          <button onClick={onClose}>
            <X className="text-white" />
          </button>
        </div>

        <div className="p-6">
          <textarea
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border rounded-xl p-4 resize-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex justify-end gap-3 p-6 bg-gray-50">
          <button onClick={onClose} className="border px-5 py-2 rounded-xl">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white px-6 py-2 rounded-xl flex items-center gap-2"
          >
            <Save size={18} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
