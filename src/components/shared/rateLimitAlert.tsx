export interface RateLimitAlertProps {
  message?: string;
}

export const RateLimitAlert = ({ message }: RateLimitAlertProps) => (
  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
    <div className="flex items-start gap-3">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-600"
        aria-hidden="true"
      >
        !
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-amber-900">
          GitHub rate limit reached
        </p>
        <p>
          {message ?? 'We have hit the hourly limit for anonymous requests.'}
        </p>
      </div>
    </div>
  </div>
);

export default RateLimitAlert;
