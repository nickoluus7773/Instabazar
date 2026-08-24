"use client";
import { useEffect, useState } from "react";
import { MessageCircle, Calendar, Pencil, Trash2 } from "lucide-react";
import EditReviewModal from "./EditReviewModal";

export default function Settings() {
  // Dummy Data (Replace with API)

  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch("http://127.0.0.1:8000/api/profile/reviews/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setReviews(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);
  const handleEdit = async (id, message) => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(`http://127.0.0.1:8000/api/reviews/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
        }),
      });

      console.log("Status:", res.status);

      const data = await res.json();
      console.log(data);

      if (res.ok) {
        fetchReviews();
        setSelectedReview(null);
      }
    } catch (err) {
      console.error(err);
    }
  };
  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-20 text-center">
        <MessageCircle size={70} className="mx-auto text-gray-300 mb-5" />

        <h2 className="text-2xl font-bold">No Reviews Yet</h2>

        <p className="text-gray-500 mt-3">
          Your reviews will appear here after you review a seller.
        </p>
      </div>
    );
  }
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;

    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(`http://127.0.0.1:8000/api/reviews/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Status:", res.status);

      if (res.ok) {
        console.log("Deleted successfully");
        fetchReviews();
      } else {
        console.log(await res.text());
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Reviews</h1>

      <div className="space-y-6">
        {reviews.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition"
          >
            {/* Header */}

            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{item.username}</h2>

                <div className="flex items-center gap-2 text-gray-500 mt-2">
                  <Calendar size={16} />
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-3 rounded-xl transition"
                  onClick={() => setSelectedReview(item)}
                >
                  <Pencil size={18} />
                </button>

                <button
                  className="bg-red-100 hover:bg-red-200 text-red-600 p-3 rounded-xl transition"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Review */}

            <p className="text-gray-600 leading-8 mt-6">{item.message}</p>
          </div>
        ))}
      </div>
      {selectedReview && (
        <EditReviewModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onSave={handleEdit}
        />
      )}
    </div>
  );
}
