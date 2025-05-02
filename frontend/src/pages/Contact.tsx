import { useState } from 'react';
import { FaPaperPlane, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';

type FormData = {
    name: string;
    email: string;
    message: string;
};

const Contact = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Form submitted:', formData);
            setSubmitSuccess(true);
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error('Submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Contact Us
                    </h1>
                    <p className="mt-3 text-xl text-gray-500">
                        Have questions? We'd love to hear from you.
                    </p>
                </div>

                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Contact Form */}
                        <div className="p-8 lg:p-12">
                            {submitSuccess ? (
                                <div className="text-center py-8">
                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                        <FaPaperPlane className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h2 className="mt-3 text-lg font-medium text-gray-900">
                                        Message Sent!
                                    </h2>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Thank you for contacting us. We'll get back to you soon.
                                    </p>
                                    <button
                                        onClick={() => setSubmitSuccess(false)}
                                        className="mt-5 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Send another message
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Full Name
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                id="name"
                                                name="name"
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email Address
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                            Your Message
                                        </label>
                                        <div className="mt-1">
                                            <textarea
                                                id="message"
                                                name="message"
                                                rows={4}
                                                required
                                                value={formData.message}
                                                onChange={handleChange}
                                                className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                                        >
                                            {isSubmitting ? (
                                                'Sending...'
                                            ) : (
                                                <>
                                                    <FaPaperPlane className="mr-2 h-4 w-4" />
                                                    Send Message
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Contact Information */}
                        <div className="bg-gray-50 p-8 lg:p-12">
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500 text-white">
                                            <FaMapMarkerAlt className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-sm font-medium text-gray-900">Address</h3>
                                        <p className="text-sm text-gray-500">
                                            123 Document Lane<br />
                                            San Francisco, CA 94103
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500 text-white">
                                            <FaPhone className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-sm font-medium text-gray-900">Phone</h3>
                                        <p className="text-sm text-gray-500">
                                            +1 (555) 123-4567
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500 text-white">
                                            <FaEnvelope className="h-5 w-5" />
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-sm font-medium text-gray-900">Email</h3>
                                        <p className="text-sm text-gray-500">
                                            support@docscribe.com
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-sm font-medium text-gray-900">Business Hours</h3>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Monday - Friday: 9:00 AM - 5:00 PM<br />
                                        Saturday - Sunday: Closed
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;