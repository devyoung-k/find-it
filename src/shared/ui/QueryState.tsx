import { ReactNode } from 'react';
import { useProgressIndicator } from '@/shared/hooks/useProgressIndicator';

interface QueryStateProps {
  isLoading: boolean;
  isError: boolean;
  loadingFallback: ReactNode;
  errorFallback?: ReactNode;
  /** 재시도 핸들러(보통 react-query의 refetch). 주어지면 에러 화면에 '다시 시도' 버튼 표시 */
  onRetry?: () => void;
  children: ReactNode;
}

const QueryState = ({
  isLoading,
  isError,
  loadingFallback,
  errorFallback,
  onRetry,
  children
}: QueryStateProps) => {
  useProgressIndicator(isLoading);

  if (isLoading) {
    return <>{loadingFallback}</>;
  }

  if (isError) {
    if (errorFallback) return <>{errorFallback}</>;
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-sm text-gray-500">
          데이터를 불러오는 중 문제가 발생했어요.
        </p>
        <button
          type="button"
          onClick={() => (onRetry ? onRetry() : window.location.reload())}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default QueryState;
