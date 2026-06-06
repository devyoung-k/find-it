import { useState } from 'react';
import { Bell, X } from 'lucide-react';
import ModalComp from '@/shared/ui/modal/ModalComp';
import { useAuthStore } from '@/features/auth/model/authStore';
import { updateProfile } from '@/lib/api/profile';
import { logger } from '@/lib/utils/logger';

const Keyword = ({
  keyword,
  onDelete
}: {
  keyword: string;
  onDelete: (keyword: string) => void;
}) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF1FF] py-1.5 pr-2 pl-3.5 text-sm font-medium text-primary">
    {keyword}
    <button
      type="button"
      onClick={() => onDelete(keyword)}
      aria-label={`${keyword} 삭제`}
      className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/15"
    >
      <X size={11} />
    </button>
  </span>
);

const Setting = () => {
  const user = useAuthStore((s) => s.user);
  const patchUser = useAuthStore((s) => s.patchUser);
  const [inputValue, setInputValue] = useState('');
  const [isCountModal, setIsCountModal] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const keywordsArray = (user?.keywords ?? '')
    .split(/[,]\s*/)
    .filter(Boolean);

  const onClickConfirm = () => {
    setIsCountModal(false);
    setIsDuplicate(false);
  };

  const persist = async (next: string[]) => {
    if (!user) return;
    const joined = next.join(', ');
    patchUser({ keywords: joined });
    try {
      await updateProfile(user.id, { keywords: joined });
    } catch (error) {
      logger.error('키워드 저장 실패', error);
    }
  };

  const handleAddButton = () => {
    const newKeyword = inputValue.trim();
    if (!newKeyword) return;
    if (!user) {
      alert('로그인 후 이용해주세요.');
      return;
    }
    if (keywordsArray.length >= 10) {
      setIsCountModal(true);
      setInputValue('');
      return;
    }
    if (keywordsArray.includes(newKeyword)) {
      setIsDuplicate(true);
      setInputValue('');
      return;
    }
    void persist([...keywordsArray, newKeyword]);
    setInputValue('');
  };

  const handleClearButton = (keywordToDelete: string) => {
    void persist(keywordsArray.filter((k) => k !== keywordToDelete));
  };

  return (
    <div>
      {/* 안내 배너 */}
      <div className="flex gap-3 rounded-2xl bg-[#EAF1FF] p-4">
        <Bell size={20} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-gray-600">
          찾는 물건의 키워드를 등록하면, 새 습득물이 올라올 때마다 바로 알림을
          보내드려요. <span className="font-bold text-primary">최대 10개</span>
          까지 등록할 수 있어요.
        </p>
      </div>

      {/* 입력 */}
      <div className="mt-4 flex gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddButton();
          }}
          placeholder="예: 에어팟, 검정지갑"
          className="min-w-0 flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm outline-none placeholder:text-gray-400 focus:bg-gray-50"
        />
        <button
          type="button"
          onClick={handleAddButton}
          className="shrink-0 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          등록
        </button>
      </div>

      {/* 등록한 키워드 */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-800">등록한 키워드</h2>
        <span className="text-sm font-semibold text-primary">
          {keywordsArray.length}/10
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2.5">
        {keywordsArray.length === 0 ? (
          <p className="w-full py-6 text-center text-sm text-gray-400">
            등록된 키워드가 없습니다.
          </p>
        ) : (
          keywordsArray.map((keyword, index) => (
            <Keyword key={index} keyword={keyword} onDelete={handleClearButton} />
          ))
        )}
      </div>

      {isCountModal && (
        <ModalComp
          children="키워드는 최대 10개 등록 가능합니다."
          confirmText="확인"
          onClickConfirm={onClickConfirm}
        />
      )}
      {isDuplicate && (
        <ModalComp
          children="이미 등록된 키워드입니다."
          confirmText="확인"
          onClickConfirm={onClickConfirm}
        />
      )}
    </div>
  );
};

export default Setting;
