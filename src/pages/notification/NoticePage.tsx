import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight } from 'lucide-react';
import { getFoundItems } from '@/entities/found/api/getFoundItems';
import { AllData } from '@/types/types';
import none_alarm from '@/assets/none_alarm.svg';
import { useAuthStore } from '@/features/auth/model/authStore';

interface KeywordType {
  keywords: string;
}

interface RecommendationType {
  keyword: string;
  selectedItem: string;
}

const Notice = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [userKeyword, setUserKeyword] = useState<KeywordType | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationType[]>(
    () => {
      if (typeof window === 'undefined') return [];
      const saved = window.localStorage.getItem('recommendations');
      return saved ? JSON.parse(saved) : [];
    }
  );

  useEffect(() => {
    if (user) setUserKeyword({ keywords: user.keywords ?? '' });
  }, [user]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!userKeyword) return;
      const keywordsArray = userKeyword.keywords.split(', ').filter((k) => k);
      const data: AllData[] = await getFoundItems(0, 100);
      const recentItemData = data.map(
        (item) => `${item.fdPrdtNm}^${item.atcId}`
      );

      const newRecommendations = keywordsArray
        .map((keyword) => {
          const filteredItems = recentItemData.filter((item) =>
            item.includes(keyword)
          );
          if (filteredItems.length > 0) {
            const randomIndex = Math.floor(Math.random() * filteredItems.length);
            return { keyword, selectedItem: filteredItems[randomIndex] };
          }
          return null;
        })
        .filter((item): item is RecommendationType => item !== null);

      if (newRecommendations.length > 0) {
        setRecommendations((prev) => {
          const updated = [...prev, ...newRecommendations];
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(
              'recommendations',
              JSON.stringify(updated)
            );
          }
          return updated;
        });
      }
    };
    fetchPosts();
    const interval = setInterval(fetchPosts, 30000);
    return () => clearInterval(interval);
  }, [userKeyword]);

  const handleButton = (index: number) => {
    navigate(
      `/getlist/detail/${recommendations[index].selectedItem.split('^')[1]}`
    );
    const updated = recommendations.filter((_, i) => i !== index);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('recommendations', JSON.stringify(updated));
    }
    setRecommendations(updated);
  };

  if (recommendations.length === 0) {
    return (
      <div className="flex flex-col items-center pt-16">
        <img src={none_alarm} alt="" className="w-28 opacity-90" />
        <p className="mt-4 text-sm text-gray-400">새로운 알림이 없습니다.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-50">
      {recommendations.map((recommendation, index) => (
        <li key={index}>
          <button
            type="button"
            onClick={() => handleButton(index)}
            className="flex w-full items-start gap-3 py-4 text-left active:bg-gray-50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF1FF]">
              <Bell size={18} className="text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <span className="inline-flex rounded-md bg-[#E8F0FF] px-2 py-0.5 text-[11px] font-bold text-primary">
                {recommendation.keyword}
              </span>
              <p className="mt-1.5 text-sm text-gray-700">
                등록한 키워드와 일치하는 습득물이 새로 등록되었어요
              </p>
            </div>
            <ChevronRight size={18} className="mt-2 shrink-0 text-gray-300" />
          </button>
        </li>
      ))}
    </ul>
  );
};

export default Notice;
