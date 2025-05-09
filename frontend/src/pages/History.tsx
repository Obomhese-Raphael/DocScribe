import { useState, useEffect } from 'react';
import axios from 'axios';
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
    Loader
} from 'lucide-react';

interface Summary {
    _id: string;
    summaryText: string;
    summaryDate: string;
    document: {
        _id: string;
        originalFileName: string;
        fileType: string;
        uploadDate: string;
    };
    shareableLink?: string;
}

const History = () => {
    const [summaries, setSummaries] = useState<Summary[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [copied, setCopied] = useState<string | null>(null);

    useEffect(() => {
        fetchSummaries();
    }, []);

    const fetchSummaries = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get<{ success: boolean; data: Summary[] }>('http://localhost:5000/api/summaries');
            setSummaries(response.data.data);
        } catch (err: any) {
            console.error('Error fetching summaries:', err);
            setError(err.response?.data?.error || 'Failed to fetch summaries');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (summaryId: string, fileName: string) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/summaries/${summaryId}/download`, {
                responseType: 'blob'
            });

            // Create a blob URL
            const blob = new Blob([response.data as BlobPart], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);

            // Create a temporary link and trigger download
            const a = document.createElement('a');
            a.href = url;
            a.download = `${fileName.split('.')[0]}-summary.txt`;
            document.body.appendChild(a);
            a.click();

            // Clean up
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error downloading summary:', err);
            alert('Failed to download summary');
        }
    };

    const handleShare = async (summaryId: string) => {
        try {
            const response = await axios.post<{ success: boolean; shareableLink: string }>(
                `http://localhost:5000/api/summaries/${summaryId}/share`
            );

            // Update the summary with the shareable link
            setSummaries(prevSummaries =>
                prevSummaries.map(summary =>
                    summary._id === summaryId
                        ? { ...summary, shareableLink: response.data.shareableLink }
                        : summary
                )
            );

            // Copy link to clipboard
            navigator.clipboard.writeText(response.data.shareableLink);
            setCopied(summaryId);

            // Reset copied state after 2 seconds
            setTimeout(() => {
                setCopied(null);
            }, 2000);
        } catch (err) {
            console.error('Error sharing summary:', err);
            alert('Failed to generate share link');
        }
    };

    const getFileIcon = (fileType: string) => {
        if (fileType === 'application/pdf') {
            return <FileText className="text-red-500" size={24} />;
        } else if (fileType.includes('word')) {
            return <FileText className="text-blue-500" size={24} />;
        } else if (fileType === 'text/plain') {
            return <File className="text-gray-500" size={24} />;
        } else {
            return <File className="text-gray-500" size={24} />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    // Filter summaries based on search term
    const filteredSummaries = summaries.filter(
        summary =>
            summary.document.originalFileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            summary.summaryText.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-8">Document History</h1>

            {/* Search bar */}
            <div className="mb-6 relative">
                <div className="relative">
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search by file name or content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 mb-6 rounded-md flex items-center">
                    <AlertCircle size={20} className="mr-2" />
                    {error}
                </div>
            )}

            {/* Loading state */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <Loader size={24} className="animate-spin text-blue-500 mr-2" />
                    <span>Loading summaries...</span>
                </div>
            )}

            {/* No results */}
            {!loading && filteredSummaries.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-md">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-600 mb-2">No documents found</h3>
                    <p className="text-gray-500">
                        {summaries.length === 0
                            ? "You haven't analyzed any documents yet."
                            : "No documents match your search criteria."}
                    </p>
                </div>
            )}

            {/* Summary list */}
            {!loading && filteredSummaries.length > 0 && (
                <div className="space-y-6">
                    {filteredSummaries.map((summary) => (
                        <div key={summary._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Summary header */}
                            <div className="flex items-center justify-between border-b border-gray-200 p-4 bg-gray-50">
                                <div className="flex items-center">
                                    {getFileIcon(summary.document.fileType)}
                                    <div className="ml-3">
                                        <h3 className="font-medium text-gray-800">{summary.document.originalFileName}</h3>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <Clock size={14} className="mr-1" />
                                            {formatDate(summary.summaryDate)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleDownload(summary._id, summary.document.originalFileName)}
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                                        title="Download summary"
                                    >
                                        <Download size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleShare(summary._id)}
                                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md"
                                        title="Share summary"
                                    >
                                        {copied === summary._id ? <Check size={18} className="text-green-600" /> : <Share2 size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Summary content */}
                            <div className="p-4">
                                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                    <h4 className="font-medium text-gray-700 mb-2">Summary</h4>
                                    <p className="text-gray-600 whitespace-pre-line">{summary.summaryText}</p>
                                </div>

                                {/* Share link (if available) */}
                                {summary.shareableLink && (
                                    <div className="mt-4 flex items-center p-3 bg-blue-50 rounded-md text-sm">
                                        <input
                                            type="text"
                                            value={summary.shareableLink}
                                            readOnly
                                            className="flex-1 bg-transparent border-none outline-none text-blue-700"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(summary.shareableLink || '');
                                                setCopied(summary._id);
                                                setTimeout(() => setCopied(null), 2000);
                                            }}
                                            className="ml-2 p-1 text-blue-600 hover:text-blue-800"
                                            title="Copy link"
                                        >
                                            {copied === summary._id ? (
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
        </div>
    );
};

export default History;