import { FaLightbulb, FaUsers, FaChartLine, FaCode } from 'react-icons/fa';

type TeamMember = {
    id: number;
    name: string;
    role: string;
    bio: string;
    image: string;
};
const AboutPage = () => {
    const teamMembers: TeamMember[] = [
        {
            id: 1,
            name: 'Obomhese Raphael',
            role: 'Founder',
            bio: 'Visionary leader passionate about leveraging AI for document understanding. Based in Lagos, Nigeria.',
            image: 'https://media.licdn.com/dms/image/v2/D4E03AQHTJapgxyTKOA/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1679320367723?e=1754524800&v=beta&t=EjByH0Bq8qsiLbok6rnummQLHY7Q6apcxzcNY9Ud0cg',
        },
        {
            id: 2,
            name: 'Kayla Smith',
            role: 'Lead AI Engineer',
            bio: 'Expert in machine learning and natural language processing, driving our AI summarization technology.',
            image: 'https://media.istockphoto.com/id/1889534285/photo/smiling-young-female-college-student-standing-with-a-laptop-in-a-cafeteria.jpg?s=612x612&w=0&k=20&c=jQNdJW6wlf9d1ibOd4Muh8hALrK_gOwTRcttxuC2Y90=',
        },
        {
            id: 3,
            name: 'William Garcia',
            role: 'Head of User Experience',
            bio: 'Dedicated to creating intuitive and efficient interfaces for seamless document interaction.',
            image: 'https://randomuser.me/api/portraits/men/44.jpg',
        },
        // Add more team members as needed
    ];

    const features = [
        {
            icon: <FaLightbulb className="h-8 w-8 text-indigo-600" />,
            title: 'Intelligent Summarization',
            description: 'Leveraging cutting-edge AI to extract the most critical information from your documents.',
        },
        {
            icon: <FaUsers className="h-8 w-8 text-indigo-600" />,
            title: 'Intuitive User Interface',
            description: 'Designed with simplicity and ease of use in mind, for professionals of all technical levels.',
        },
        {
            icon: <FaChartLine className="h-8 w-8 text-indigo-600" />,
            title: 'Continuous Learning',
            description: 'Our AI models are constantly refined and improved based on user feedback and data.',
        },
        {
            icon: <FaCode className="h-8 w-8 text-indigo-600" />,
            title: 'API Integration (Coming Soon)',
            description: 'Future API access to seamlessly integrate DocScribe into your existing workflows and applications.',
        },
    ];

    return (
        <div className="bg-gray-50">
            {/* Hero Section */}
            <div className="bg-white py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl font-extrabold text-indigo-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Our Story: Simplifying Document Understanding with AI
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-base text-gray-600">
                        Founded in Nigeria, DocScribe was born from the need to overcome information overload. We believe that
                        everyone should be able to quickly grasp the core insights from any document, regardless of its length or
                        complexity. Our AI-powered platform is designed to make document comprehension effortless and efficient.
                    </p>
                </div>
            </div>
            {/* Features Section */}
            <div className="py-16 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
                        Key Features That Empower You
                    </h2>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {features.map((feature, index) => (
                            <div key={index} className="rounded-lg shadow-md p-6 flex flex-col items-center text-center">
                                <div className="h-12 w-12 rounded-md flex items-center justify-center bg-indigo-50 mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-500">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Our Team Section */}
            <div className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center mb-12">
                        <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
                            Meet Our Dedicated Team
                        </h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            The Passionate Individuals Behind DocScribe
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                            Our diverse team brings together expertise in AI, engineering, and user experience, all driven by a
                            shared vision.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                        {teamMembers.map((member) => (
                            <div key={member.id} className="bg-white rounded-lg shadow-md p-6 text-center">
                                <img
                                    className="h-32 w-32 rounded-full object-cover mx-auto shadow-md"
                                    src={member.image}
                                    alt={member.name}
                                />
                                <h3 className="mt-4 text-lg font-medium text-gray-900">{member.name}</h3>
                                <p className="mt-1 text-sm text-indigo-600">{member.role}</p>
                                <p className="mt-2 text-sm text-gray-500">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;