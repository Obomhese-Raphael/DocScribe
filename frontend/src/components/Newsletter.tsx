import axios from 'axios';
import { useState } from 'react';
import { toast } from 'react-toastify';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const backendUrl = import.meta.env.VITE_API_BASE_URL;
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (!email.includes('@')) {
            setMessage('Please enter a valid email');
            return;
        }
        if (email.length < 5) {
            setMessage('Email must be at least 5 characters long');
            return;
        }
        if (email.length > 50) {
            setMessage('Email must be less than 50 characters long');
            return;
        }
        
        setIsSubmitting(true);
        // Simulate API call to subscribe to the newsletter
        try {
            const response = await axios.post(`${backendUrl}/api/newsletter/subscribe`, { email });
            setMessage("Successfully subscribed to weekly newsletter");
            toast("Successfully subscribed to weekly newsletter ✅");
            // Clear the email input after successful subscription
            setEmail('');
            // Clear the message after a few seconds
            setTimeout(() => {
                setMessage('');
            }, 5000);
            // Do something with the response if needed
            console.log('Subscription response:', response.data);
        } catch (error: any) {
            console.error('Subscription error:', error.message);
            setMessage('Oops! Something went wrong. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gray-100 py-12">
            <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    Stay Updated with DocScribe
                </h2>
                <p className="text-gray-600 mb-6">
                    Get the latest news, AI updates, and tips on how to streamline your document workflow
                    delivered straight to your inbox.
                </p>
                <form onSubmit={handleSubmit} className="mt-4">
                    <div className="flex rounded-md shadow-sm">
                        <input
                            type="email"
                            className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            aria-label="Email address for newsletter subscription"
                        />
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-r-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                        </button>
                    </div>
                    {message && (
                        <p className={`mt-2 text-sm 'text-green-500' : 'text-red-500'} ${message.startsWith("Oops") ? 'text-red-500' : 'text-green-500'}`}>
                            {message}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Newsletter;