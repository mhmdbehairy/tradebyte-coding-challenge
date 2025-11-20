import type { ReactNode, SVGProps } from 'react';

export type StatusVariant = 'info' | 'warning' | 'error';

const VARIANT_STYLES: Record<
  StatusVariant,
  {
    border: string;
    background: string;
    title: string;
    body: string;
    iconWrapper: string;
    icon: ReactNode;
  }
> = {
  info: {
    border: 'border-sky-200',
    background: 'bg-sky-50',
    title: 'text-slate-900',
    body: 'text-slate-600',
    iconWrapper: 'bg-sky-100 text-sky-600',
    icon: 'ℹ︎',
  },
  warning: {
    border: 'border-amber-200',
    background: 'bg-amber-50',
    title: 'text-amber-900',
    body: 'text-amber-800',
    iconWrapper: 'bg-amber-100 text-amber-600',
    icon: '!',
  },
  error: {
    border: 'border-rose-200',
    background: 'bg-rose-50',
    title: 'text-rose-900',
    body: 'text-rose-800',
    iconWrapper: 'bg-rose-100 text-rose-600',
    icon: '!',
  },
};

const classNames = (
  ...values: Array<string | false | undefined | null>
): string => values.filter(Boolean).join(' ');

export interface StatusMessageProps {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  variant?: StatusVariant;
  actions?: ReactNode;
  className?: string;
  iconLabel?: string;
}

export const StatusMessage = ({
  title,
  description,
  icon,
  variant = 'info',
  actions,
  className,
  iconLabel,
}: StatusMessageProps) => {
  const styles = VARIANT_STYLES[variant];
  const iconContent = icon ?? styles.icon;
  const descriptionNode =
    typeof description === 'string' ? <p>{description}</p> : description;

  return (
    <div
      className={classNames(
        'rounded-2xl border p-4 text-sm shadow-sm',
        styles.border,
        styles.background,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={classNames(
            'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold',
            styles.iconWrapper
          )}
          aria-hidden={iconLabel ? undefined : true}
          aria-label={iconLabel}
        >
          {typeof iconContent === 'string' ? (
            <span className="leading-none">{iconContent}</span>
          ) : (
            iconContent
          )}
        </div>
        <div className="space-y-1">
          <p className={classNames('font-semibold', styles.title)}>{title}</p>
          {description && (
            <div className={classNames('text-sm', styles.body)}>
              {descriptionNode}
            </div>
          )}
          {actions && <div className="pt-2 text-sm">{actions}</div>}
        </div>
      </div>
    </div>
  );
};

export const StatusIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <circle cx={12} cy={12} r={10} />
    <line x1={12} y1={8} x2={12} y2={12} />
    <circle cx={12} cy={16} r={0.5} />
  </svg>
);

export default StatusMessage;
