interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <div className={`${sizeClasses[size]} border-2 border-blue-400 border-t-transparent rounded-full animate-spin`}></div>
      {text && <span className="text-blue-400 font-medium">{text}</span>}
    </div>
  );
} 