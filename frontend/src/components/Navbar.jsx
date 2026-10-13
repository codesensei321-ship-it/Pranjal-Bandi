import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-white/[0.06]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-accent-green/10 group-hover:bg-accent-green/20 transition-colors">
              <Leaf className="w-5 h-5 text-accent-green" />
            </div>
            <span className="text-lg font-bold gradient-text">PlantAI</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30 hidden sm:block">AI-Powered Plant Care</span>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;
