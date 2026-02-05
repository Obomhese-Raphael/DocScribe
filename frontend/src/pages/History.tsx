import { useState, useEffect } from "react";
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
  XCircle,
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
  const [summaryDocumentId, setSummaryDocumentId] = useState<string>("");
  const [documentContent, setDocumentContent] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"summary" | "content">("summary");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [renameLoading, setRenameLoading] = useState<string | null>(null);

  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await axios.get<ApiResponse>(
        `${VITE_API_BASE_URL}/api/summaries/history`
      );

      if (response.data.success) {
        const sortedSummaries = response.data.data.sort(
          (a, b) => new Date(b.summaryDate).getTime() - new Date(a.summaryDate).getTime()
        );
        setSummaries(sortedSummaries);
      } else {
        setError(response.data.message || "Failed to fetch summaries");
      }
    } catch (err: any) {
      console.error("Error fetching summaries:", err);
      if (err.response?.status === 404) {
        setError("No summaries found. Upload some documents to get started!");
      } else {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to fetch summaries"
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchSummaries(true);
  };

  const fetchDocumentContent = async (id: string) => {
    try {
      const response = await axios.get<DocumentContentApiResponse>(
        `${VITE_API_BASE_URL}/api/upload/get-content/${id}`
      );

      if (response.data.success && response.data.data?.content) {
        setDocumentContent(response.data.data.content);

        if (selectedSummary) {
          setSelectedSummary({
            ...selectedSummary,
            document: {
              ...selectedSummary.document,
              content: response.data.data.content,
            },
          });
        }
      } else if (response.data && "content" in response.data) {
        const contentResponse = response.data as any;
        setDocumentContent(contentResponse.content);

        if (selectedSummary) {
          setSelectedSummary({
            ...selectedSummary,
            document: {
              ...selectedSummary.document,
              content: contentResponse.content,
            },
          });
        }
      } else {
        console.log("Unexpected response structure:", response.data);
        setDocumentContent("Content not available - unexpected response format");
      }
    } catch (error: any) {
      console.error("Error fetching document content:", error);
      setError("Failed to fetch document content");
      setDocumentContent("Failed to load content");
    }
  };

  const handleViewSummary = (summary: Summary) => {
    setSelectedSummary(summary);
    setDocumentContent("");
    fetchDocumentContent(summary._id);
    setSummaryDocumentId(summary._id);
    setActiveTab("summary");
  };

  const closeModal = () => {
    setSelectedSummary(null);
  };

  const startEditName = (summary: Summary) => {
    setEditingId(summary._id);
    setEditName(summary.document.originalName);
  };

  const saveName = async (summaryId: string) => {
    if (!editName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    const currentName = summaries.find((s) => s._id === summaryId)?.document.originalName;
    if (editName.trim() === currentName) {
      setEditingId(null);
      return;
    }

    setRenameLoading(summaryId);

    try {
      const response = await axios.patch(
        `${VITE_API_BASE_URL}/api/upload/documents/${summaryId}/rename`,
        { newName: editName.trim() }
      );

      if (response.data.success) {
        setSummaries((prev) =>
          prev.map((s) =>
            s._id === summaryId
              ? {
                  ...s,
                  document: {
                    ...s.document,
                    originalName: editName.trim(),
                  },
                }
              : s
          )
        );
        toast.success("File name updated successfully");
      }
    } catch (err: any) {
      console.error("Rename failed:", err);
      toast.error(err.response?.data?.error || "Failed to rename file");
    } finally {
      setRenameLoading(null);
      setEditingId(null);
      setEditName("");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleDownload = async (summaryId: string, fileName: string) => {
    try {
      const response = await axios.get(
        `${VITE_API_BASE_URL}/api/summaries/${summaryId}/download`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data as BlobPart], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName.split(".")[0]}-summary.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error("Error downloading summary:", err);
      toast.error(err.response?.data?.error || "Failed to download summary");
    }
  };

  const handleShare = async (summaryId: string) => {
    try {
      const response = await axios.post<{
        success: boolean;
        shareableLink: string;
      }>(`${VITE_API_BASE_URL}/api/summaries/${summaryId}/share`);

      if (response.data.success) {
        setSummaries((prev) =>
          prev.map((s) =>
            s._id === summaryId
              ? { ...s, shareableLink: response.data.shareableLink }
              : s
          )
        );

        await navigator.clipboard.writeText(response.data.shareableLink);
        setCopied(summaryId);
        setTimeout(() => setCopied(null), 2000);
        toast.success("Share link copied to clipboard!");
      }
    } catch (err: any) {
      console.error("Error sharing summary:", err);
      toast.error(err.response?.data?.error || "Failed to generate share link");
    }
  };

  const handleDelete = async (summaryId: string) => {
    if (!window.confirm("Are you sure you want to delete this summary? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(`${VITE_API_BASE_URL}/api/summaries/${summaryId}`);

      setSummaries((prev) => prev.filter((s) => s._id !== summaryId));
      toast.success("File deleted successfully");
    } catch (err: any) {
      console.error("Error deleting summary:", err);
      toast.error(err.response?.data?.error || "Failed to delete summary");
    }
  };

  const copyToClipboard = async (text: string, summaryId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(summaryId);
      setTimeout(() => setCopied(null), 2000);
      toast.success("Copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      toast.error("Failed to copy");
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === "application/pdf") return <FileText className="text-red-500" size={24} />;
    if (fileType?.includes("word") || fileType?.includes("document")) return <FileText className="text-blue-500" size={24} />;
    if (fileType === "text/plain" || fileType === "text") return <File className="text-gray-500" size={24} />;
    return <File className="text-gray-500" size={24} />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileTypeLabel = (fileType: string) => {
    if (fileType === "application/pdf") return "PDF";
    if (fileType?.includes("word")) return "Word";
    if (fileType === "text/plain" || fileType === "text") return "Text";
    return "Document";
  };

  const filteredSummaries = summaries.filter(
    (summary) =>
      summary.document.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      summary.summaryText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document History</h1>
          <p className="text-gray-600 mt-2">
            View and manage your analyzed documents and summaries
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {summaries.length} {summaries.length === 1 ? "document" : "documents"}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-6 relative">
        <div className="relative">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search by file name or summary content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
        </div>
      </div>

      {/* Error / Loading / No results */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6 rounded-lg flex items-center">
          <AlertCircle size={20} className="mr-3 flex-shrink-0" />
          <div>
            <p className="font-medium">Error loading summaries</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader size={24} className="animate-spin text-blue-500 mr-3" />
          <span className="text-gray-600">Loading document history...</span>
        </div>
      )}

      {!loading && filteredSummaries.length === 0 && !error && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            {summaries.length === 0 ? "No documents analyzed yet" : "No documents match your search"}
          </h3>
          <p className="text-gray-500 mb-4">
            {summaries.length === 0
              ? "Upload documents or paste text to get started with DocScribe."
              : "Try adjusting your search criteria."}
          </p>
          {summaries.length === 0 && (
            <button
              onClick={() => (window.location.href = "/upload")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Upload First Document
            </button>
          )}
        </div>
      )}

      {/* Summary list */}
      {!loading && filteredSummaries.length > 0 && (
        <div className="space-y-6">
          {filteredSummaries.map((summary) => (
            <div
              key={summary._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-6 bg-gray-50">
                <div className="flex items-center min-w-0 flex-1">
                  {getFileIcon(summary.document.fileType)}
                  <div className="ml-4 min-w-0 flex-1">
                    {editingId === summary._id ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveName(summary._id);
                            if (e.key === "Escape") cancelEdit();
                          }}
                          className="flex-1 min-w-[200px] px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                          autoFocus
                        />
                        <button
                          onClick={() => saveName(summary._id)}
                          disabled={renameLoading === summary._id}
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                          title="Save name"
                        >
                          {renameLoading === summary._id ? (
                            <Loader size={18} className="animate-spin" />
                          ) : (
                            <Save size={18} />
                          )}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Cancel"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="font-semibold text-gray-900 truncate max-w-[300px]">
                          {summary.document.originalName}
                        </h3>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full whitespace-nowrap">
                          {getFileTypeLabel(summary.document.fileType)}
                        </span>
                        <button
                          onClick={() => startEditName(summary)}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Rename file"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock size={14} className="mr-1 flex-shrink-0" />
                      <span>Analyzed {formatDate(summary.summaryDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleViewSummary(summary)}
                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                    title="View details"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => handleDownload(summary._id, summary.document.originalName)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Download summary"
                  >
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => handleShare(summary._id)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title="Share summary"
                  >
                    {copied === summary._id ? <Check size={18} className="text-green-600" /> : <Share2 size={18} />}
                  </button>
                  <button
                    onClick={() => handleDelete(summary._id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete summary"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="p-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700">Summary Preview</h4>
                    <button
                      onClick={() => copyToClipboard(summary.summaryText, `copy-${summary._id}`)}
                      className="p-1 text-gray-500 hover:text-gray-700 rounded"
                      title="Copy summary"
                    >
                      {copied === `copy-${summary._id}` ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                  <p className="text-gray-700 leading-relaxed line-clamp-3">
                    {summary.summaryText}
                  </p>
                  <button
                    onClick={() => handleViewSummary(summary)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 flex items-center"
                  >
                    <BookOpen size={14} className="mr-1" />
                    View Full Details
                  </button>
                </div>

                {summary.shareableLink && (
                  <div className="mt-4 flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex-1 mr-3">
                      <p className="text-xs text-blue-700 font-medium mb-1">Shareable Link:</p>
                      <input
                        type="text"
                        value={summary.shareableLink}
                        readOnly
                        className="w-full bg-transparent border-none outline-none text-blue-700 text-sm"
                      />
                    </div>
                    <button
                      onClick={() => copyToClipboard(summary.shareableLink || "", `link-${summary._id}`)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                      title="Copy link"
                    >
                      {copied === `link-${summary._id}` ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedSummary && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center min-w-0 flex-1">
                {getFileIcon(selectedSummary.document.fileType)}
                <div className="ml-3 min-w-0 flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 truncate">
                    {selectedSummary.document.originalName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Analyzed {formatDate(selectedSummary.summaryDate)}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white">
              <button
                onClick={() => setActiveTab("summary")}
                className={`flex-1 py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "summary"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab("content")}
                className={`flex-1 py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "content"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Original Content
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
              {activeTab === "summary" ? (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 text-lg">AI Generated Summary</h3>
                    <button
                      onClick={() => copyToClipboard(selectedSummary.summaryText, `modal-${selectedSummary._id}`)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Copy summary"
                    >
                      {copied === `modal-${selectedSummary._id}` ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {selectedSummary.summaryText}
                  </p>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 text-lg">Original Document Content</h3>
                    <button
                      onClick={() => copyToClipboard(documentContent || "", `content-${selectedSummary._id}`)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Copy content"
                    >
                      {copied === `content-${selectedSummary._id}` ? (
                        <Check size={18} className="text-green-600" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>
                  <pre className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-200 overflow-x-auto">
                    {documentContent || "Content not available"}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                  {getFileTypeLabel(selectedSummary.document.fileType)}
                </span>
                <span className="text-sm text-gray-600 truncate max-w-[300px]">
                  {selectedSummary.document.originalName}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleDownload(selectedSummary._id, selectedSummary.document.originalName)}
                  className="px-4 py-2 text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-2 border border-gray-300"
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={() => {
                    handleShare(selectedSummary._id);
                    closeModal();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;