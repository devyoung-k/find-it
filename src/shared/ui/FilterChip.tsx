import { ReactNode } from 'react';

interface FilterChipProps {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

/** 토스/당근 스타일 필터 칩 (선택 시 파란색 채움) */
const FilterChip = ({
  active = false,
  onClick,
  children,
  className = '',
  size = 'md'
}: FilterChipProps) => {
  const sizeStyle =
    size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';
  const stateStyle = active
    ? 'bg-primary text-white shadow-sm'
    : 'bg-gray-100 text-gray-500 hover:bg-gray-200';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full font-medium whitespace-nowrap transition-colors ${sizeStyle} ${stateStyle} ${className}`}
    >
      {children}
    </button>
  );
};

export default FilterChip;
