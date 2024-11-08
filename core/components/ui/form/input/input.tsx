import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { ComponentPropsWithRef, ElementRef, forwardRef, ReactNode, useState } from 'react';

import { cn } from '~/lib/utils';

interface Props extends ComponentPropsWithRef<'input'> {
  error?: boolean;
  icon?: ReactNode;
}

const Input = forwardRef<ElementRef<'input'>, Props>(
  ({ className, children, error = false, icon, type = 'text', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const effectiveType = isPassword ? (showPassword ? 'password' : 'text') : type;

    return (
      <div className={cn('relative', className)}>
        <input
          className={cn(
            'peer w-full border-2 border-gray-200 px-4 py-2.5 text-base placeholder:text-gray-500 hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:bg-gray-100 disabled:hover:border-gray-200',
            (error || isPassword) && 'pe-12',
            error &&
              'border-error-secondary hover:border-error focus-visible:border-error-secondary focus-visible:ring-error-secondary/20 disabled:border-gray-200',
          )}
          ref={ref}
          type={effectiveType}
          {...props}
        />
        {Boolean(error || icon || isPassword) && (
          <span
            className={cn(
              'absolute end-4 top-0 flex h-full items-center',
              error && 'text-error-secondary peer-disabled:text-gray-200',
              isPassword && !error && 'text-black hover:text-gray-800', // Updated to black with dark gray hover
              isPassword && 'pointer-events-auto cursor-pointer',
              !isPassword && 'pointer-events-none',
            )}
            onClick={isPassword ? () => setShowPassword(!showPassword) : undefined}
            role={isPassword ? 'button' : undefined}
            tabIndex={isPassword ? 0 : undefined}
            aria-label={isPassword ? (showPassword ? 'Hide password' : 'Show password') : undefined}
          >
            {icon ??
              (error ? (
                <AlertCircle />
              ) : isPassword ? (
                showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )
              ) : null)}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };