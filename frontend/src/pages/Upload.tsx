import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  File,
  X,
  Clipboard,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface FileWithPreview extends File {
  preview?: string;
}

const UploadPage = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [pastedText, setPastedText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
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

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejectionReasons = rejectedFiles[0].errors.map((error: any) => error.message).join(', ');
      setError(`File rejected: ${rejectionReasons}`);
      return;
    }

    // Clear any previous errors
    setError(null);

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

  const handleTextSubmit = () => {
    if (!pastedText.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    // Here you would normally send the text to your backend
    console.log('Text submitted for analysis:', pastedText);
    setError(null);
  };

  const handleFileSubmit = () => {
    if (files.length === 0) {
      setError('Please upload at least one file');
      return;
    }

    // Here you would normally send the files to your backend
    console.log('Files submitted for analysis:', files);
    setError(null);
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">DocScribe</h1>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'upload' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'
              }`}
            onClick={() => setActiveTab('upload')}
          >
            <Upload className="inline mr-2" size={18} />
            Upload Files
          </button>
          <button
            className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'paste' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'
              }`}
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
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ml-auto"
                  disabled={files.length === 0}
                >
                  Analyze Documents
                  <ArrowRight size={18} className="ml-2" />
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
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ml-auto"
                  disabled={!pastedText.trim()}
                >
                  Analyze Text
                  <ArrowRight size={18} className="ml-2" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;