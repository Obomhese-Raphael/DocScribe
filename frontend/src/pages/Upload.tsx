import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  File,
  X,
  Clipboard,
  ArrowRight,
  AlertCircle,
  Loader
} from 'lucide-react';
import { uploadFile, uploadText } from '../services/api';

interface FileWithPreview extends File {
  preview?: string;
}

interface DocumentResponse {
  id: string;
  originalName: string;
  fileType: string;
  uploadDate: string;
}

interface UploadResponse {
  success: boolean;
  document: DocumentResponse;
  path: string;
}

const UploadPage = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [pastedText, setPastedText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadedDocument, setUploadedDocument] = useState<DocumentResponse | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Maximum file size: 10MB
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  // Accepted file types
  const ACCEPTED_FILE_TYPES = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/msword': ['.doc'],
    'text/plain': ['.txt'],
  };

  // Clean up object URLs on component unmount
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, [files]);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejectionReasons = rejectedFiles[0].errors.map((error: any) => error.message).join(', ');
      setError(`File rejected: ${rejectionReasons}`);
      return;
    }

    // Clear any previous errors and results
    setError(null);
    setUploadSuccess(false);
    setUploadedDocument(null);

    // Process accepted files
    const newFiles = acceptedFiles.map(file =>
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    );

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true
  });

  const removeFile = (fileToRemove: FileWithPreview) => {
    setFiles(files.filter(file => file !== fileToRemove));

    // Clean up object URL to avoid memory leaks
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
  };

  const handleTextSubmit = async () => {
    if (!pastedText.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setUploadSuccess(false);
      setUploadedDocument(null);

      // Upload text using our API service
      const response = await uploadText(pastedText) as UploadResponse;

      setUploadSuccess(true);
      setUploadedDocument(response.document);

      // Clear text area after successful upload
      setPastedText('');
      // Clear the success message after a few seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 5000);

    } catch (err: any) {
      console.error('Error uploading text:', err);
      setError(err.response?.data?.error || 'Failed to upload text');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSubmit = async () => {
    if (files.length === 0) {
      setError('Please upload at least one file');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setUploadSuccess(false);
      setUploadedDocument(null);

      // For now, we'll just upload the first file
      // You could extend this to handle multiple files if needed
      const fileToUpload = files[0];

      // Upload file using our API service
      const response = await uploadFile(fileToUpload) as UploadResponse;

      setUploadSuccess(true);
      setUploadedDocument(response.document);

      // Clear files after successful upload
      setFiles([]);

    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (file: FileWithPreview) => {
    if (file.type === 'application/pdf') {
      return <FileText className="text-red-500" size={24} />;
    } else if (file.type.includes('word')) {
      return <FileText className="text-blue-500" size={24} />;
    } else if (file.type === 'text/plain') {
      return <File className="text-gray-500" size={24} />;
    } else {
      return <File className="text-gray-500" size={24} />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  };
  

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">DocScribe</h1>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'upload' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}`}
            onClick={() => setActiveTab('upload')}
          >
            <Upload className="inline mr-2" size={18} />
            Upload Files
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'paste' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}`}
            onClick={() => setActiveTab('paste')}
          >
            <Clipboard className="inline mr-2" size={18} />
            Paste Text
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}

        {/* Success message */}
        {uploadSuccess && (
          <div className="bg-green-50 text-green-600 p-4 flex items-center">
            <AlertCircle size={20} className="mr-2" />
            Document uploaded successfully!
          </div>
        )}

        {/* Content based on active tab */}
        <div className="p-6">
          {activeTab === 'upload' ? (
            <div>
              {/* Drag & Drop Area */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center cursor-pointer transition-colors ${isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center py-4">
                  <Upload
                    className={isDragActive ? 'text-blue-500' : 'text-gray-400'}
                    size={48}
                  />
                  <p className="mt-4 text-lg font-medium">
                    {isDragActive
                      ? 'Drop files here...'
                      : 'Drag & drop files here, or click to select files'
                    }
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Supported formats: PDF, DOCX, DOC, TXT (Max 10MB)
                  </p>
                </div>
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-3">Selected Files</h3>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border border-gray-200 rounded-md p-3"
                      >
                        <div className="flex items-center">
                          {getFileIcon(file)}
                          <div className="ml-3">
                            <p className="font-medium text-gray-800">{file.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(file)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit button */}
              <div className="text-right">
                <button
                  onClick={handleFileSubmit}
                  disabled={files.length === 0 || loading}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ml-auto ${(files.length === 0 || loading) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      Upload Document
                      <ArrowRight size={18} className="ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Text area */}
              <div className="mb-6">
                <label htmlFor="pasteText" className="block mb-2 font-medium text-gray-700">
                  Paste or type your text below
                </label>
                <textarea
                  id="pasteText"
                  ref={textAreaRef}
                  className="w-full border border-gray-300 rounded-md p-4 h-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your document text here..."
                />
              </div>

              {/* Submit button */}
              <div className="text-right">
                <button
                  onClick={handleTextSubmit}
                  disabled={!pastedText.trim() || loading}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ml-auto ${(!pastedText.trim() || loading) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      Upload Text
                      <ArrowRight size={18} className="ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Uploaded Document Information */}
        {uploadedDocument && (
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">Document Uploaded</h2>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-500 mb-2">
                File: {uploadedDocument.originalName}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Uploaded on: {new Date(uploadedDocument.uploadDate).toLocaleString()}
              </p>
              <div className="bg-white p-4 rounded-md border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-2">Status</h3>
                <p className="text-gray-700">
                  Your document has been uploaded successfully and stored in the database.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;