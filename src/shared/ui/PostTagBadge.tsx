interface PostTagBadgeProps {
  tag?: string | null;
  className?: string;
}

const STYLES: Record<string, string> = {
  습득: 'bg-[#E8F0FF] text-primary',
  분실: 'bg-[#FFEDE9] text-secondary',
  후기: 'bg-[#E3F6EC] text-[#22B36B]',
  질문: 'bg-[#F1EAFE] text-[#8B5CF6]'
};

/** 게시글 태그(첫 토큰)를 색상 배지로 표시 */
export const primaryTagOf = (tag?: string | null): string => {
  if (!tag) return '';
  return tag.replace(/#/g, '').split(/\s+/).filter(Boolean)[0] ?? '';
};

const PostTagBadge = ({ tag, className = '' }: PostTagBadgeProps) => {
  const primary = primaryTagOf(tag);
  if (!primary) return null;
  const style = STYLES[primary] ?? 'bg-gray-100 text-gray-500';
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold leading-none ${style} ${className}`}
    >
      {primary}
    </span>
  );
};

export default PostTagBadge;
