function SkeletonLoader({ lines = 3 }) {
  return (
    <div className="card-green p-5 space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded-full bg-white/[0.06]"
          style={{ width: `${80 - i * 12}%` }}
        />
      ))}
    </div>
  );
}

export default SkeletonLoader;
