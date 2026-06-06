import {
  Headphones,
  Smartphone,
  Wallet,
  ShoppingBag,
  CreditCard,
  Shirt,
  Gem,
  Banknote,
  FileText,
  Umbrella,
  Car,
  Music,
  type LucideIcon
} from 'lucide-react';

export interface CategoryMeta {
  /** 아이콘 컴포넌트 */
  Icon: LucideIcon;
  /** 아이콘 색 */
  fg: string;
  /** 파스텔 배경색 */
  bg: string;
}

interface CategoryRule {
  /** prdtClNm 안에 포함되면 매칭되는 키워드 */
  keywords: string[];
  meta: CategoryMeta;
}

const RULES: CategoryRule[] = [
  {
    keywords: ['휴대폰', '통신', '스마트', '아이폰', '폰'],
    meta: { Icon: Smartphone, fg: '#6366F1', bg: '#ECECFE' }
  },
  {
    keywords: ['전자', '컴퓨터', '노트북', '카메라', '이어폰', '전자기기'],
    meta: { Icon: Headphones, fg: '#4785FF', bg: '#EAF1FF' }
  },
  {
    keywords: ['지갑'],
    meta: { Icon: Wallet, fg: '#E0922A', bg: '#FBEFD9' }
  },
  {
    keywords: ['가방', '쇼핑백', '백팩'],
    meta: { Icon: ShoppingBag, fg: '#22B36B', bg: '#E2F6EC' }
  },
  {
    keywords: ['카드', '증명', '신분', '면허', '여권', '서류'],
    meta: { Icon: CreditCard, fg: '#8B5CF6', bg: '#F1EAFE' }
  },
  {
    keywords: ['의류', '옷', '신발'],
    meta: { Icon: Shirt, fg: '#EC4899', bg: '#FCEAF2' }
  },
  {
    keywords: ['귀금속', '반지', '목걸이', '시계', '악세', '액세'],
    meta: { Icon: Gem, fg: '#E0772A', bg: '#FBEBDC' }
  },
  {
    keywords: ['현금', '수표', '유가증권', '상품권'],
    meta: { Icon: Banknote, fg: '#10B981', bg: '#E2F7F0' }
  },
  {
    keywords: ['도서', '책'],
    meta: { Icon: FileText, fg: '#64748B', bg: '#EEF1F5' }
  },
  {
    keywords: ['자동차', '차량'],
    meta: { Icon: Car, fg: '#0EA5E9', bg: '#E3F4FD' }
  },
  {
    keywords: ['악기'],
    meta: { Icon: Music, fg: '#F43F5E', bg: '#FDE8EC' }
  }
];

const DEFAULT_META: CategoryMeta = {
  Icon: Umbrella,
  fg: '#8A94A6',
  bg: '#F1F2F4'
};

/** prdtClNm(품목 분류명)으로 아이콘/색상 메타를 얻는다. */
export const getCategoryMeta = (prdtClNm?: string): CategoryMeta => {
  if (!prdtClNm) return DEFAULT_META;
  const name = prdtClNm.replace(/\s/g, '');
  for (const rule of RULES) {
    if (rule.keywords.some((k) => name.includes(k))) {
      return rule.meta;
    }
  }
  return DEFAULT_META;
};

/** prdtClNm("대분류 > 소분류")을 칩/배지에 쓰기 좋은 짧은 대분류 라벨로 정리한다. */
export const formatCategoryLabel = (prdtClNm?: string): string => {
  if (!prdtClNm) return '기타';
  // "지갑 > 여성용 지갑" → "지갑"
  let base = prdtClNm.split('>')[0].trim();
  if (!base) return '기타';
  // "기타물품" → "기타"
  if (base.endsWith('물품')) {
    base = base.replace(/물품$/, '');
  }
  return base || '기타';
};

/** 홈 화면 카테고리 바로가기 칩 */
export const HOME_CATEGORY_CHIPS: string[] = [
  '전자기기',
  '휴대폰',
  '지갑',
  '가방',
  '카드',
  '의류',
  '귀금속',
  '기타'
];
