import { Palette, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <Palette className="h-8 w-8 text-purple-400 mr-2" />
              <span className="text-2xl font-bold">ArtisTech</span>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering visual artists in San Jose Del Monte with a secure, AI-protected platform for showcasing and selling their artwork.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-purple-400 cursor-pointer" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-purple-400 cursor-pointer" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-purple-400 cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Home</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Browse Artists</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Artworks</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Auctions</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Commissions</a></li>
            </ul>
          </div>

          {/* For Artists */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Artists</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Sell Your Art</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Artist Dashboard</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Portfolio Management</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Pricing Guide</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Artist Resources</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-purple-400 mr-3" />
                <span className="text-gray-400">San Jose Del Monte, Bulacan</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-purple-400 mr-3" />
                <span className="text-gray-400">support@artistech.ph</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-purple-400 mr-3" />
                <span className="text-gray-400">+63 (2) 8123-4567</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-gray-400 text-sm">
              © 2025 ArtisTech. All rights reserved. | 
              <a href="#" className="hover:text-white ml-1">Privacy Policy</a> | 
              <a href="#" className="hover:text-white ml-1">Terms of Service</a> |
              <a href="#" className="hover:text-white ml-1">DMCA Policy</a>
            </div>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-400 text-sm">
                Protected by AI Art Detection & Anti-Grab Technology
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

