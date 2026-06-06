interface TypeBadgeProps {
  /** 'get' = 습득, 'lost' = 분실 */
  type: 'get' | 'lost';
  label?: string;
  className?: string;
}

/** 습득(파랑) / 분실(살구) 구분 배지 */
const TypeBadge = ({ type, label, className = '' }: TypeBadgeProps) => {
  const isGet = type === 'get';
  const text = label ?? (isGet ? '습득' : '분실');
  const style = isGet
    ? 'bg-[#E8F0FF] text-primary'
    : 'bg-[#FFEDE9] text-secondary';

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold leading-none ${style} ${className}`}
    >
      {text}
    </span>
  );
};

export default TypeBadge;
