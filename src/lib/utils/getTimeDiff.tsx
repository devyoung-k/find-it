interface timeProps {
  createdAt: string;
}

/**
 * 백엔드는 타임존 표기 없는(naive) ISO 시각을 UTC로 내려준다.
 * 타임존 지시자(Z, ±hh:mm)가 없으면 UTC로 간주하도록 'Z'를 붙인다.
 */
const normalizeToUtc = (value: string): string => {
  if (!value) return value;
  // 공백 구분("YYYY-MM-DD HH:mm")은 T 구분으로 통일
  let v = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(value)
    ? value.replace(' ', 'T')
    : value;
  const hasTimeZone = /[zZ]$|[+-]\d{2}:?\d{2}$/.test(v);
  if (/T\d{2}:\d{2}/.test(v) && !hasTimeZone) {
    v = `${v}Z`;
  }
  return v;
};

export const getTimeDiff = ({ createdAt }: timeProps) => {
  const milliSeconds =
    new Date().getTime() - new Date(normalizeToUtc(createdAt)).getTime();
  const seconds = milliSeconds / 1000;

  if (seconds < 60) {
    return <span className="text-[10px] text-gray-450">방금 전</span>;
  }

  const minutes = seconds / 60;
  if (minutes < 60) {
    return (
      <span className="text-[10px] text-gray-450">
        {Math.floor(minutes)}분 전
      </span>
    );
  }

  const hours = minutes / 60;
  if (hours < 24) {
    return (
      <span className="text-[10px] text-gray-450">
        {Math.floor(hours)}시간 전
      </span>
    );
  }

  const days = hours / 24;
  if (days < 7) {
    return (
      <span className="text-[10px] text-gray-450">{Math.floor(days)}일 전</span>
    );
  }

  const weeks = days / 7;
  if (weeks < 5) {
    return (
      <span className="text-[10px] text-gray-450">{Math.floor(weeks)}주 전</span>
    );
  }

  const months = days / 30;
  if (months < 12) {
    return (
      <span className="text-[10px] text-gray-450">
        {Math.floor(months)}개월 전
      </span>
    );
  }

  const years = days / 365;
  return (
    <span className="text-[10px] text-gray-450">{Math.floor(years)}년 전</span>
  );
};
