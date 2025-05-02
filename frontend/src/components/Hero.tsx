import { Link } from 'react-router-dom';
import { FaFileAlt, FaBrain, FaCheckCircle } from 'react-icons/fa';

const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl lg:text-6xl">
            Unlock the Essence of Your Documents with AI.
          </h1>
          <p className="mt-4 text-lg text-gray-700">
            DocScribe uses the power of artificial intelligence to generate concise and accurate summaries
            of your uploaded documents and files, saving you time and enhancing understanding.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              to="/upload"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Upload & Summarize
            </Link>
            <Link
              to="/how-it-works"
              className="bg-white hover:bg-gray-200 text-indigo-600 font-semibold py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Learn How It Works
            </Link>
          </div>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
              <FaFileAlt className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Effortless File Upload</h3>
            <p className="mt-2 text-sm text-gray-700">
              Easily upload various document formats (PDF, DOCX, TXT, etc.) and let our AI handle the rest.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
              <FaBrain className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Intelligent AI Summarization</h3>
            <p className="mt-2 text-sm text-gray-700">
              Our advanced AI algorithms analyze your documents to generate accurate and insightful summaries in seconds.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 text-white">
              <FaCheckCircle className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Boost Productivity</h3>
            <p className="mt-2 text-sm text-gray-700">
              Quickly grasp the key information from lengthy documents, freeing up your time for more important tasks.
            </p>
          </div>
        </div>
        <div className="mt-16 text-center text-sm text-gray-500">
          Proudly serving users across Nigeria and beyond.
        </div>
      </div>
    </section>
  );
};

export default Hero;