import { getCategoryMeta } from '@/shared/config/categoryMeta';

const NO_IMAGE = 'https://www.lost112.go.kr/lostnfs/images/sub/img02_no_img.gif';

interface CategoryThumbProps {
  prdtClNm?: string;
  image?: string;
  /** 박스 크기/모양 클래스 (예: 'h-20 w-20 rounded-2xl') */
  className?: string;
  /** 아이콘 픽셀 크기 */
  iconSize?: number;
  alt?: string;
}

/**
 * 파스텔 배경 + 카테고리 아이콘 썸네일.
 * 실제 이미지가 있으면 이미지를, 없으면(또는 기본 placeholder) 아이콘을 보여준다.
 */
const CategoryThumb = ({
  prdtClNm,
  image,
  className = 'h-20 w-20 rounded-2xl',
  iconSize = 32,
  alt = '물품 사진'
}: CategoryThumbProps) => {
  const hasImage = !!image && image !== NO_IMAGE && image.trim() !== '';
  const { Icon, fg, bg } = getCategoryMeta(prdtClNm);

  if (hasImage) {
    return (
      <div className={`shrink-0 overflow-hidden ${className}`}>
        <img
          src={image}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center ${className}`}
      style={{ backgroundColor: bg }}
      aria-hidden
    >
      <Icon size={iconSize} color={fg} strokeWidth={1.8} />
    </div>
  );
};

export default CategoryThumb;
