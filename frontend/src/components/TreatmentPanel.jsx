import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

function TreatmentPanel({ analysis }) {
  if (!analysis) return <SkeletonLoader lines={5} />;

  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={i} />;

      const boldProcessed = trimmed.replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="text-white font-semibold">$1</strong>'
      );

      if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
        const content = trimmed.slice(2);
        const processed = content.replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="text-white font-semibold">$1</strong>'
        );
        return (
          <li key={i} className="text-white/60 text-sm ml-4 list-disc" dangerouslySetInnerHTML={{ __html: processed }} />
        );
      }

      return (
        <p key={i} className="text-white/60 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: boldProcessed }} />
      );
    });
  };

  return (
    <motion.div className="card-green p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center gap-2 mb-3">
        <Leaf className="w-4 h-4 text-accent-green" />
        <h3 className="text-base font-bold text-white">AI Analysis</h3>
      </div>
      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
        {renderContent(analysis)}
      </div>
    </motion.div>
  );
}

export default TreatmentPanel;
