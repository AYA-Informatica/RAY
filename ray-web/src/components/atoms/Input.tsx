import { forwardRef, InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

/**
 * RAY text input atom with label, error, and icon support.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, hint, error, leftIcon, rightIcon, fullWidth = true, className, ...props },
    ref
  ) => {
    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label className="text-sm font-semibold text-text-primary font-sans">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-text-secondary pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={clsx(
              'w-full bg-surface-modal border rounded-2xl px-4 py-3 text-text-primary',
              'font-sans text-sm placeholder:text-text-muted',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-danger focus:ring-danger'
                : 'border-border focus:ring-primary',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-text-secondary pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
        {hint && !error && (
          <p className="text-xs text-text-secondary font-sans">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-danger font-sans">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
