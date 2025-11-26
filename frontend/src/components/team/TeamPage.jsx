import { Twitter, Linkedin } from 'lucide-react';

const TeamPage = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Asma',
      role: 'Frontend Developer',
      image: '/images/team/WhatsApp Image 2025-11-24 at 18.22.42.jpeg',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com'
    },
    {
      id: 2,
      name: 'Marwan Farook',
      role: 'Backend Developer',
      image: '/images/team/WhatsApp Image 2025-11-24 at 18.22.58.jpeg',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com'
    },
    {
      id: 3,
      name: 'Manar Osama',
      role: 'Frontend Developer',
      image: '/images/team/WhatsApp Image 2025-11-24 at 18.22.42 (2).jpeg',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com'
    },
    {
      id: 4,
      name: 'Mariam Ali',
      role: 'Backend Developer',
      image: '/images/team/WhatsApp Image 2025-11-24 at 18.22.42 (3).jpeg',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com'
    },
    {
      id: 5,
      name: 'Jana Osman',
      role: 'Backend Developer',
      image: '/images/team/WhatsApp Image 2025-11-24 at 18.22.42 (1).jpeg',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com'
    },
    {
      id: 6,
      name: 'Bassmala',
      role: 'Frontend Developer',
      image: '/images/team/Basmala.jpeg',
      twitter: 'https://twitter.com',
      linkedin: 'https://linkedin.com'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Meet our team
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            We're a dynamic group of individuals who are passionate about what we do and dedicated to delivering the best results for our clients.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={member.id}
              className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 
                         transition-all duration-500 ease-out
                         hover:scale-105 hover:-translate-y-2
                         hover:shadow-2xl hover:shadow-purple-500/30
                         border border-gray-700 hover:border-purple-500/50
                         relative overflow-hidden"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 100}ms both`
              }}
            >
              {/* Animated background glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-blue-600/0 to-purple-600/0 
                            group-hover:from-purple-600/10 group-hover:via-blue-600/10 group-hover:to-purple-600/10
                            transition-all duration-500 rounded-2xl"></div>
              
              {/* Profile Picture */}
              <div className="flex justify-center mb-4 relative z-10">
                <div className="relative">
                  {/* Glowing ring effect on hover */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 
                                 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 
                                 animate-pulse scale-110"></div>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="relative w-32 h-32 rounded-full object-cover 
                             border-4 border-purple-500/30 group-hover:border-purple-500
                             shadow-lg group-hover:shadow-purple-500/50
                             transition-all duration-500
                             group-hover:scale-110 group-hover:rotate-3"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=128&background=7c3aed&color=fff&bold=true`;
                    }}
                  />
                </div>
              </div>

              {/* Name and Role */}
              <div className="text-center mb-4 relative z-10">
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                  {member.role}
                </p>
              </div>

              {/* Social Links */}
              <div className="flex justify-center items-center space-x-4 pt-2 relative z-10">
                <a
                  href={member.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-white 
                             transition-all duration-300 
                             hover:scale-125 transform
                             hover:bg-gray-700 p-2 rounded-full
                             hover:shadow-lg hover:shadow-gray-500/50"
                  aria-label={`${member.name}'s Twitter`}
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-400
                             transition-all duration-300 
                             hover:scale-125 transform
                             hover:bg-gray-700 p-2 rounded-full
                             hover:shadow-lg hover:shadow-blue-500/50"
                  aria-label={`${member.name}'s LinkedIn`}
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default TeamPage;

