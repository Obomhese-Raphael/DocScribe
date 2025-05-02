import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">DocScribe</h3>
                    <p className="text-sm mb-2">
                        Your platform for seamless document management and collaboration.
                    </p>
                    <p className="text-xs text-gray-500">
                        &copy; {currentYear} DocScribe. All rights reserved.
                    </p>
                    <p className="text-xs text-gray-500">
                        Crafted with ❤️ in Nigeria.
                    </p>
                </div>
                <div>
                    <h3 className="text-md font-semibold text-gray-400 mb-4">Company</h3>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link to="/about" className="hover:text-white">
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Link to="/contact" className="hover:text-white">
                                Contact Us
                            </Link>
                        </li>
                        <li>
                            <Link to="" className="hover:text-white">
                                Careers
                            </Link>
                        </li>
                        <li>
                            <Link to="/" className="hover:text-white">
                                Blog
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-md font-semibold text-gray-400 mb-4">Legal</h3>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link to="/" className="hover:text-white">
                                Privacy Policy
                            </Link>
                        </li>
                        <li>
                            <Link to="/" className="hover:text-white">
                                Terms of Service
                            </Link>
                        </li>
                        <li>
                            <Link to="/" className="hover:text-white">
                                Security
                            </Link>
                        </li>
                        <li>
                            <Link to="/" className="hover:text-white">
                                Cookie Policy
                            </Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-md font-semibold text-gray-400 mb-4">Connect</h3>
                    <div className="flex space-x-4">
                        <a
                            href="https://github.com/Obomhese-Raphael"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white"
                        >
                            <FaGithub className="h-6 w-6" />
                            <span className="sr-only">GitHub</span>
                        </a>
                        <a
                            href="https://linkedin.com/in/obomheseR"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white"
                        >
                            <FaLinkedin className="h-6 w-6" />
                            <span className="sr-only">LinkedIn</span>
                        </a>
                        <a
                            href="https://twitter.com/_ObomheseR"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-white"
                        >
                            <FaTwitter className="h-6 w-6" />
                            <span className="sr-only">Twitter</span>
                        </a>
                        <a
                            href="https://mail.google.com/mail/u/0/"
                            target='_blank'
                            className="hover:text-white"
                        >
                            <FaEnvelope className="h-6 w-6" />
                            <span className="sr-only">Email</span>
                        </a>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 border-t border-gray-800 py-4 text-center text-xs text-gray-500">
                <p>
                    DocScribe Technologies, Inc. • Plot 123, Silicon Valley Avenue, Lagos, Nigeria
                </p>
            </div>
        </footer>
    );
};

export default Footer;