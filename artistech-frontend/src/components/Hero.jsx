import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx'
import { ArrowRight, Palette, Users, Shield } from 'lucide-react'
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Hero = () => {
  const { user } = useContext(AuthContext);

  const renderButtons = () => {
    if (!user) {
      return (
        <>
          <Link to={{ pathname: "/signup", state: { userType: 'artist' } }}>
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
              Start Selling Your Art
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/artworks">
            <Button variant="outline" size="lg" className="px-8 py-3">
              Browse Artworks
            </Button>
          </Link>
        </>
      );
    }

    if (user.userType === 'artist') {
      return (
        <>
          <Link to="/upload">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
              Upload Your Artwork
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/artworks">
            <Button variant="outline" size="lg" className="px-8 py-3">
              Browse Artworks
            </Button>
          </Link>
        </>
      );
    }
    
    // For clients, we can show a different primary action or nothing
    return (
        <Link to="/artworks">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
                Explore The Collection
                <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
        </Link>
    );
  };
  return (
    <section className="bg-gradient-to-br from-purple-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Empowering Visual Artists in
            <span className="text-purple-600"> San Jose Del Monte</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with clients, showcase your portfolio, and grow your artistic business on the premier platform designed specifically for visual artists.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {renderButtons()}
          </div>

          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Palette className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Art Detection</h3>
              <p className="text-gray-600">
                Advanced AI technology ensures authenticity and protects against AI-generated content
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Community</h3>
              <p className="text-gray-600">
                Connect with verified artists and clients through our secure identity verification system
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Anti-Grab Protection</h3>
              <p className="text-gray-600">
                Protect your artwork with advanced watermarking and image protection features
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

