function SkeletonLoader({ lines = 3 }) {
  return (
    <div className="glass p-6 space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded-full bg-white/10"
          style={{ width: `${75 - i * 10}%` }}
        />
      ))}
    </div>
  );
}

export default SkeletonLoader;
