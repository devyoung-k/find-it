import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';
import useSearchStore from '@/features/search/model/searchStore';

const POPULAR = ['에어팟', '지갑', '아이폰', '우산', '카드지갑', '백팩', '안경', '키링'];

const SearchFindDetail = () => {
  const navigate = useNavigate();
  const { keyword, setKeyword } = useSearchStore();
  const [input, setInput] = useState(keyword);

  useHeaderConfig(
    () => ({ isShowPrev: true, empty: true, children: '습득물 검색' }),
    []
  );

  const submit = (term?: string) => {
    const q = (term ?? input).trim();
    if (!q) return;
    setKeyword(q);
    setInput(q);
    navigate('/searchfindresult');
  };

  return (
    <div className="min-h-nav-safe bg-white">
      <div className="mx-auto w-full max-w-[720px] px-4 pt-4 pb-10 md:px-6 md:pt-8">
        {/* 검색 입력 */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex items-center gap-2"
        >
          <div className="flex flex-1 items-center gap-2.5 rounded-full bg-gray-100 px-4 py-3">
            <Search size={20} className="shrink-0 text-gray-400" />
            <input
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="습득물 검색"
              className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            type="submit"
            className="hidden shrink-0 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 md:block"
          >
            검색
          </button>
        </form>

        {/* 탭 */}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
          >
            습득물
          </button>
          <button
            type="button"
            onClick={() => navigate('/searchlost')}
            className="rounded-full bg-gray-100 px-5 py-2 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-200"
          >
            분실물
          </button>
        </div>

        {/* 인기 검색어 */}
        <h2 className="mt-8 text-sm font-bold text-gray-800">인기 검색어</h2>
        <ol className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1 md:grid-cols-2">
          {POPULAR.map((word, i) => (
            <li key={word}>
              <button
                type="button"
                onClick={() => submit(word)}
                className="flex w-full items-center gap-3 rounded-lg py-2.5 text-left transition-colors hover:bg-gray-50"
              >
                <span
                  className={`w-4 text-sm font-bold ${
                    i < 3 ? 'text-primary' : 'text-gray-300'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="text-[15px] text-gray-800">{word}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default SearchFindDetail;
