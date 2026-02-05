/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Download,
  Share2,
  Copy,
  Check,
  FileText,
  File,
  Clock,
  Search,
  AlertCircle,
  Loader,
  RefreshCw,
  Trash2,
  Eye,
  BookOpen,
  X,
  Edit2,
  Save,
} from "lucide-react";
import { toast } from "react-toastify";

interface Document {
  _id: string;
  content: string;
  originalName: string;
  fileType: string;
  uploadDate: string;
  filePath?: string;
}

interface Summary {
  _id: string;
  documentId: string;
  summaryText: string;
  summaryDate: string;
  document: Document;
  shareableLink?: string;
}

interface ApiResponse {
  success: boolean;
  data: Summary[];
  message?: string;
}

interface DocumentContentApiResponse {
  success: boolean;
  data: {
    content: string;
    originalName: string;
    fileType: string;
    uploadDate: string;
    _id: string;
  };
  message?: string;
}

const History = () => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [copied, setCopied] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [documentContent, setDocumentContent] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"summary" | "content">("summary");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [renameLoading, setRenameLoading] = useState<string | null>(null);

  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

   const fetchSummaries = useCallback(
    async (showRefreshLoader = false) => {
      try {
        if (showRefreshLoader) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const response = await axios.get<ApiResponse>(
          `${VITE_API_BASE_URL}/api/summaries/history`,
        );

        if (response.data.success) {
          const sortedSummaries = response.data.data.sort(
            (a, b) =>
              new Date(b.summaryDate).getTime() -
              new Date(a.summaryDate).getTime(),
          );
          setSummaries(sortedSummaries);
        } else {
          setError(response.data.message || "Failed to fetch summaries");
        }
      } catch (err: any) {
        console.error("Error fetching summaries:", err);
        if (err.response?.status === 404) {
          setError("No summaries found.");
        } else {
          setError("Failed to fetch summaries");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [VITE_API_BASE_URL],
  ); 

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]); 

  // Refresh button calls the same stable function
  const handleRefresh = () => {
    fetchSummaries(true);
  };

  const fetchDocumentContent = async (id: string) => {
    try {
      const response = await axios.get<DocumentContentApiResponse>(
        `${VITE_API_BASE_URL}/api/upload/get-content/${id}`,
      );
      if (response.data.success && response.data.data?.content) {
        setDocumentContent(response.data.data.content);
      }
    } catch (error) {
      setDocumentContent("Failed to load content");
    }
  };

  const handleViewSummary = (summary: Summary) => {
    setSelectedSummary(summary);
    setDocumentContent("");
    fetchDocumentContent(summary._id);
    setActiveTab("summary");
  };

  const closeModal = () => setSelectedSummary(null);

  const startEditName = (summary: Summary) => {
    setEditingId(summary._id);
    setEditName(summary.document.originalName);
  };

  const saveName = async (summaryId: string) => {
    if (!editName.trim()) return toast.error("Name cannot be empty");

    const currentName = summaries.find((s) => s._id === summaryId)?.document
      .originalName;
    if (editName.trim() === currentName) {
      setEditingId(null);
      return;
    }

    setRenameLoading(summaryId); // Start loading for this specific ID
    try {
      const response = await axios.patch(
        `${VITE_API_BASE_URL}/api/upload/documents/${summaryId}/rename`,
        { newName: editName.trim() },
      );
      if (response.data.success) {
        setSummaries((prev) =>
          prev.map((s) =>
            s._id === summaryId
              ? {
                  ...s,
                  document: { ...s.document, originalName: editName.trim() },
                }
              : s,
          ),
        );
        toast.success("File name updated");
      }
    } catch (err) {
      toast.error("Failed to rename");
    } finally {
      setRenameLoading(null); // End loading
      setEditingId(null);
      setEditName("");
    }
  };

  const handleDownload = async (summaryId: string, fileName: string) => {
    try {
      const response = await axios.get(
        `${VITE_API_BASE_URL}/api/summaries/${summaryId}/download`,
        { responseType: "blob" },
      );
      const url = window.URL.createObjectURL(
        new Blob([response.data as BlobPart]),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName.split(".")[0]}-summary.txt`;
      a.click();
    } catch (err) {
      toast.error("Download failed");
    }
  };

  const handleShare = async (summaryId: string) => {
    try {
      const response = await axios.post<{
        success: boolean;
        shareableLink: string;
      }>(`${VITE_API_BASE_URL}/api/summaries/${summaryId}/share`);
      if (response.data.success) {
        await navigator.clipboard.writeText(response.data.shareableLink);
        setCopied(summaryId);
        setTimeout(() => setCopied(null), 2000);
        toast.success("Link copied!");
      }
    } catch (err) {
      toast.error("Share failed");
    }
  };

  const handleDelete = async (summaryId: string) => {
    if (!window.confirm("Delete this summary?")) return;
    try {
      await axios.delete(`${VITE_API_BASE_URL}/api/summaries/${summaryId}`);
      setSummaries((prev) => prev.filter((s) => s._id !== summaryId));
      toast.success("Deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Copied!");
  };

  const getFileIcon = (type: string) => {
    if (type === "application/pdf")
      return <FileText className="text-red-500" size={24} />;
    return <File className="text-blue-500" size={24} />;
  };

  const formatDate = (ds: string) =>
    new Date(ds).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const filteredSummaries = summaries.filter(
    (s) =>
      s.document.originalName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      s.summaryText.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Document History
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage your analyzed documents
          </p>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-none pt-4 sm:pt-0">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {summaries.length} {summaries.length === 1 ? "File" : "Files"}
          </span>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-blue-50 rounded-full transition-colors"
          >
            <RefreshCw
              size={20}
              className={
                refreshing ? "animate-spin text-blue-600" : "text-gray-600"
              }
            />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search documents..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Error View */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-3 flex-shrink-0" />
          <div>
            <p className="font-medium">Error loading summaries</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Main List */}
      {loading ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <Loader className="animate-spin text-blue-500" size={32} />
          <p className="text-gray-500 font-medium">Loading your history...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSummaries.map((summary) => (
            <div
              key={summary._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-1">
                    {getFileIcon(summary.document.fileType)}
                  </div>
                  <div className="min-w-0 flex-1">
                    {editingId === summary._id ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          disabled={renameLoading === summary._id}
                          className="border-b-2 border-blue-500 outline-none text-gray-900 font-semibold w-full bg-transparent"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                        <button
                          onClick={() => saveName(summary._id)}
                          disabled={renameLoading === summary._id}
                          className="text-green-600 disabled:opacity-50"
                        >
                          {renameLoading === summary._id ? (
                            <Loader size={18} className="animate-spin" />
                          ) : (
                            <Save size={18} />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 truncate text-base sm:text-lg">
                          {summary.document.originalName}
                        </h3>
                        <button
                          onClick={() => startEditName(summary)}
                          className="text-gray-400 hover:text-blue-500"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Clock size={12} />
                      <span>{formatDate(summary.summaryDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Action Grid */}
                <div className="grid grid-cols-4 sm:flex gap-2 border-t sm:border-none pt-3 sm:pt-0">
                  <button
                    onClick={() => handleViewSummary(summary)}
                    className="flex items-center justify-center p-2.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(summary._id, summary.document.originalName)
                    }
                    className="flex items-center justify-center p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => handleShare(summary._id)}
                    className="flex items-center justify-center p-2.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                  >
                    {copied === summary._id ? (
                      <Check size={18} />
                    ) : (
                      <Share2 size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(summary._id)}
                    className="flex items-center justify-center p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-100">
                  <p className="text-sm text-gray-700 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                    {summary.summaryText}
                  </p>
                  <button
                    onClick={() => handleViewSummary(summary)}
                    className="mt-3 text-xs font-bold text-blue-600 flex items-center gap-1 uppercase tracking-wider"
                  >
                    <BookOpen size={14} /> Read Full Analysis
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Responsive Modal */}
      {selectedSummary && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white w-full max-w-4xl h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b flex items-center justify-between sticky top-0 bg-white z-20">
              <div className="min-w-0">
                <h2 className="font-bold text-lg sm:text-xl truncate">
                  {selectedSummary.document.originalName}
                </h2>
                <p className="text-xs text-gray-500 uppercase tracking-tighter">
                  AI Summary Analysis
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 bg-gray-100 rounded-full text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-50 p-1 mx-4 mt-4 rounded-lg border">
              <button
                onClick={() => setActiveTab("summary")}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === "summary" ? "bg-white shadow text-blue-600" : "text-gray-500"}`}
              >
                SUMMARY
              </button>
              <button
                onClick={() => setActiveTab("content")}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === "content" ? "bg-white shadow text-blue-600" : "text-gray-500"}`}
              >
                ORIGINAL
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {activeTab === "summary" ? (
                <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">
                      Analysis Result
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          selectedSummary.summaryText,
                          "modal-copy",
                        )
                      }
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      {copied === "modal-copy" ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                  <p className="whitespace-pre-line text-sm sm:text-base">
                    {selectedSummary.summaryText}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-green-400 text-xs sm:text-sm font-mono whitespace-pre-wrap">
                    {documentContent || "Loading content..."}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() =>
                  handleDownload(
                    selectedSummary._id,
                    selectedSummary.document.originalName,
                  )
                }
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-100"
              >
                <Download size={18} /> Save
              </button>
              <button
                onClick={() => handleShare(selectedSummary._id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 rounded-xl font-bold text-sm text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
              >
                <Share2 size={18} /> Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
