import * as React from "react"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
}

export function Badge({ className = '', variant = 'default', children, ...props }: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  
  const variantClasses = {
    default: "border-transparent bg-blue-600 text-white hover:bg-blue-700",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
    outline: "border-gray-300 text-gray-700 hover:bg-gray-50",
    secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200"
  }

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}