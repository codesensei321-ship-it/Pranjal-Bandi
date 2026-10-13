import { motion } from 'framer-motion';
import { Stethoscope } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';

function TreatmentPanel({ analysis }) {
  if (!analysis) return <SkeletonLoader lines={5} />;

  // Simple markdown-like rendering
  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={i} />;

      // Bold text
      const boldProcessed = trimmed.replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="text-white font-semibold">$1</strong>'
      );

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
        const content = trimmed.slice(2);
        const processed = content.replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="text-white font-semibold">$1</strong>'
        );
        return (
          <li
            key={i}
            className="text-white/70 text-sm ml-4 list-disc"
            dangerouslySetInnerHTML={{ __html: processed }}
          />
        );
      }

      return (
        <p
          key={i}
          className="text-white/70 text-sm"
          dangerouslySetInnerHTML={{ __html: boldProcessed }}
        />
      );
    });
  };

  return (
    <motion.div
      className="glass p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Stethoscope className="w-5 h-5 text-accent-purple" />
        <h3 className="text-lg font-semibold text-white">AI Analysis</h3>
      </div>
      <div className="space-y-1.5 max-h-64 overflow-y-auto pr-2">
        {renderContent(analysis)}
      </div>
    </motion.div>
  );
}

export default TreatmentPanel;
