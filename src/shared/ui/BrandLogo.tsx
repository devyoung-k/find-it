import { Search } from 'lucide-react';

interface BrandLogoProps {
  /** 워드마크('찾아줘') 노출 여부 */
  showWordmark?: boolean;
  /** 심볼 한 변 크기(px) */
  size?: number;
  className?: string;
}

/** 찾아줘 브랜드 로고 — 파란 라운드 스퀘어 + 돋보기 심볼 + 워드마크 */
const BrandLogo = ({
  showWordmark = true,
  size = 30,
  className = ''
}: BrandLogoProps) => {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="flex items-center justify-center rounded-[10px] bg-primary text-white shadow-sm"
        style={{ width: size, height: size }}
        aria-hidden
      >
        <Search size={Math.round(size * 0.58)} strokeWidth={2.6} />
      </span>
      {showWordmark && (
        <span
          className="font-extrabold tracking-tight text-gray-900"
          style={{ fontSize: Math.round(size * 0.66) }}
        >
          찾아줘
        </span>
      )}
    </span>
  );
};

export default BrandLogo;
