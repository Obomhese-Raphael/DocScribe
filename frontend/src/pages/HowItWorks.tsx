import { FaUpload, FaRobot, FaMagic, FaDownload, FaFileContract, FaFileAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const HowItWorks = () => {
    const steps = [
        {
            icon: <FaUpload className="h-8 w-8 text-indigo-600" />,
            title: "Upload Your Document",
            description: "Drag and drop your PDF, DOCX, or TXT file. We support most common document formats.",
            color: "bg-indigo-100"
        },
        {
            icon: <FaRobot className="h-8 w-8 text-blue-600" />,
            title: "AI Analyzes Content",
            description: "Our advanced NLP models extract key concepts, themes, and relationships in your document.",
            color: "bg-blue-100"
        },
        {
            icon: <FaMagic className="h-8 w-8 text-purple-600" />,
            title: "Generate Summary",
            description: "We condense the information into a concise summary while preserving critical details.",
            color: "bg-purple-100"
        },
        {
            icon: <FaDownload className="h-8 w-8 text-green-600" />,
            title: "Get Your Results",
            description: "Download or copy your summary in seconds. No registration required.",
            color: "bg-green-100"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl font-extrabold text-gray-900 sm:text-5xl"
                    >
                        How DocScribe Works
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mt-3 max-w-2xl mx-auto text-xl text-gray-600"
                    >
                        Transform lengthy documents into actionable insights with our AI-powered summarization
                    </motion.p>
                </div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex flex-col items-center"
                        >
                            <div className={`${step.color} p-4 rounded-full mb-4`}>
                                {step.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                            <p className="text-center text-gray-600">{step.description}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Diagram Placeholder */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-16 bg-white p-6 rounded-xl shadow-lg border border-gray-200"
                >
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="w-full p-8">
                            <h3 className="text-lg font-medium text-gray-900 mb-6 text-center">Document Processing Flow</h3>
                            <div className="flex items-center justify-between p-8">
                                {/* Document Input */}
                                <div className="flex flex-col items-center">
                                    <div className="bg-indigo-100 p-4 rounded-lg w-16 h-16 flex items-center justify-center mb-2">
                                        <FaFileAlt className="text-indigo-600 text-2xl" />
                                    </div>
                                    <div className="text-sm font-medium text-gray-700">Document</div>
                                    <div className="text-xs text-gray-500">PDF/DOCX/TXT</div>
                                </div>

                                {/* Arrow */}
                                <div className="mx-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                </div>

                                {/* AI Processing */}
                                <div className="flex flex-col items-center">
                                    <div className="bg-blue-100 p-4 rounded-lg w-16 h-16 flex items-center justify-center mb-2">
                                        <FaRobot className="text-blue-600 text-2xl" />
                                    </div>
                                    <div className="text-sm font-medium text-gray-700">AI Analysis</div>
                                    <div className="text-xs text-gray-500">NLP Processing</div>
                                </div>

                                {/* Arrow */}
                                <div className="mx-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                </div>

                                {/* Summary Output */}
                                <div className="flex flex-col items-center">
                                    <div className="bg-green-100 p-4 rounded-lg w-16 h-16 flex items-center justify-center mb-2">
                                        <FaFileContract className="text-green-600 text-2xl" />
                                    </div>
                                    <div className="text-sm font-medium text-gray-700">Summary</div>
                                    <div className="text-xs text-gray-500">Key Points</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tech Stack */}
                <div className="mt-16 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Powered By</h2>
                    <div className="flex cursor-pointer flex-wrap justify-center gap-8 border border-gray-200 p-6 rounded-lg shadow-lg bg-gray-50">
                        {[
                            { name: "Natural Language Processing", icon: "🧠" },
                            { name: "Transformer Models", icon: "⚡" },
                            { name: "Document Parsing", icon: "📄" },
                            { name: "Cloud Processing", icon: "☁️" }
                        ].map((tech, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                className="bg-white p-4 rounded-lg shadow-md w-100 h-50 text-center flex flex-col items-center transition-transform justify-center duration-300"
                            >
                                <div className="text-3xl mb-2 text-center items-center">{tech.icon}</div>
                                <h3 className="font-medium text-gray-800">{tech.name}</h3>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowItWorks;