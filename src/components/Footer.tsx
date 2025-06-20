
import { Link } from "react-router-dom";
import { Home, BookOpen, FolderOpen, User, Mail, Twitter, Github, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TF</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                TechInsight Forge
              </span>
            </div>
            <p className="text-slate-300 mb-4">
              Your ultimate destination for cutting-edge tech insights, programming tutorials, and engineering excellence.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </li>
              <li>
                <Link to="/articles" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Articles
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                  <User className="h-4 w-4" />
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex flex-col space-y-2">
              <a href="#" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                <Twitter className="h-4 w-4" />
                Twitter
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-8 pt-8 text-center">
          <p className="text-slate-400">
            © 2025 TechInsight Forge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
