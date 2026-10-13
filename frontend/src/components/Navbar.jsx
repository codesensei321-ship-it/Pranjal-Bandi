import { motion } from 'framer-motion';
import { Github, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 glass border-t-0 border-x-0 rounded-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-accent-purple/20 group-hover:bg-accent-purple/30 transition-colors">
              <Leaf className="w-5 h-5 text-accent-purple" />
            </div>
            <span className="text-lg font-semibold gradient-text">PlantAI</span>
          </Link>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/50 hover:text-white/80"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;
