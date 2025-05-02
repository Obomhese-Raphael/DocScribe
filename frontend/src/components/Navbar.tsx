import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { FaFileAlt } from 'react-icons/fa';
import { SignInButton, UserButton, useUser } from '@clerk/clerk-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isSignedIn } = useUser();

    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="bg-gray-800 text-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center font-semibold text-xl">
                            <FaFileAlt className="mr-2" />
                            DocScribe
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-center space-x-4">
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`
                                }
                            >
                                Home
                            </NavLink>
                            <NavLink
                                to="/history"
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`
                                }
                            >
                                History
                            </NavLink>
                            <NavLink
                                to={"/about"}
                                onClick={toggleNavbar}
                                className={({ isActive }) =>
                                    `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`
                                }
                            >
                                About
                            </NavLink>
                            <NavLink
                                to="/contact"
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`
                                }
                            >
                                Contact
                            </NavLink>
                            <div className="ml-2">
                                {isSignedIn ? (
                                    <div className="flex items-center h-full">
                                        <UserButton afterSignOutUrl="/" />
                                    </div>
                                ) : (
                                    <div className="flex items-center h-full">
                                        <SignInButton mode="modal">
                                            <button className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
                                                Sign In
                                            </button>
                                        </SignInButton>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={toggleNavbar}
                            type="button"
                            className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                            aria-controls="mobile-menu"
                            aria-expanded={isOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <AiOutlineClose className="h-6 w-6" />
                            ) : (
                                <AiOutlineMenu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={isOpen ? 'md:hidden block' : 'md:hidden hidden'} id="mobile-menu">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <NavLink
                        to="/"
                        onClick={toggleNavbar}
                        className={({ isActive }) =>
                            `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                    >
                        Home
                    </NavLink>
                    <NavLink
                        to="/history"
                        onClick={toggleNavbar}
                        className={({ isActive }) =>
                            `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                    >
                        History
                    </NavLink>
                    <NavLink
                        to={"/about"}
                        onClick={toggleNavbar}
                        className={({ isActive }) =>
                            `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                    >
                        About
                    </NavLink>
                    <NavLink
                        to="/contact"
                        onClick={toggleNavbar}
                        className={({ isActive }) =>
                            `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                    >
                        Contact
                    </NavLink>
                    <div className="pt-2">
                        {isSignedIn ? (
                            <div className="flex justify-start pl-3 py-2">
                                <UserButton afterSignOutUrl="/" />
                            </div>
                        ) : (
                            <div className="flex justify-start pl-3 py-2">
                                <SignInButton mode="modal">
                                    <button className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base font-medium">
                                        Sign In
                                    </button>
                                </SignInButton>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;