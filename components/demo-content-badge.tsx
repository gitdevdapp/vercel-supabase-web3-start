interface DemoContentBadgeProps {
  message?: string;
  variant?: 'default' | 'info' | 'warning';
}

export function DemoContentBadge({ 
  message = "Demo Content - Customize This Section",
  variant = 'default' 
}: DemoContentBadgeProps) {
  const variantStyles = {
    default: "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300",
    info: "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300",
    warning: "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300"
  };

  return (
    <div className={`inline-block px-3 py-1.5 border rounded-full ${variantStyles[variant]}`}>
      <span className="text-xs font-semibold">
        📝 {message}
      </span>
    </div>
  );
}

