/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FileText, Clock, Loader, AlertCircle, ArrowLeft } from "lucide-react";

interface SharedSummaryData {
  _id: string;
  summaryText: string;
  summaryDate: string;
  document: {
    _id: string;
    originalName: string;
    fileType: string;
    uploadDate: string;
    fileSize?: number;
  };
}

const SharedSummary = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<SharedSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchSharedSummary = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${VITE_API_BASE_URL}/api/summaries/shared/${id}`
        );

        if (response.data.success) {
          setSummary(response.data.data);
        } else {
          setError(response.data.error || "Failed to load summary");
        }
      } catch (err: any) {
        console.error("Error fetching shared summary:", err);
        setError(
          err.response?.data?.error || "This summary is not available"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSharedSummary();
    }
  }, [id, VITE_API_BASE_URL]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
          <p className="text-gray-700 font-medium">Loading shared summary...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Summary Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "This summary may have been deleted or is no longer available."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Home
            </button>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <FileText size={32} />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">
                  {summary.document.originalName}
                </h1>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <Clock size={16} />
                  <span>Summarized on {formatDate(summary.summaryDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-600 rounded"></span>
              Document Summary
            </h2>
            <p className="text-sm text-gray-500">
              AI-generated analysis and key insights
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {summary.summaryText}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            Powered by <span className="font-bold text-blue-600">DocScribe</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedSummary;