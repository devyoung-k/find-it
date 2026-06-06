import { useState, useEffect, SetStateAction } from 'react';
import Notice from '@/pages/notification/NoticePage';
import Setting from '@/pages/notification/SettingPage';
import { useHeaderConfig } from '@/widgets/header/model/HeaderConfigContext';
import { logger } from '@/lib/utils/logger';

interface CategoriesProps {
  active: string;
  onChangeCategory: React.Dispatch<SetStateAction<string>>;
}

const Categories = ({ active, onChangeCategory }: CategoriesProps) => {
  const [hasAlarm, setHasAlarm] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem('recommendations');
      setHasAlarm(!!saved && saved !== '[]');
    } catch (error) {
      logger.warn('Failed to read recommendations', error);
      setHasAlarm(false);
    }
  }, []);

  const tab = (key: string, label: string, dot = false) => (
    <button
      type="button"
      onClick={() => onChangeCategory(key)}
      className={`relative flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
        active === key ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
      }`}
    >
      {label}
      {dot && (
        <span className="absolute top-2 right-6 h-1.5 w-1.5 rounded-full bg-secondary" />
      )}
    </button>
  );

  return (
    <div className="flex gap-1 rounded-full bg-gray-100 p-1">
      {tab('notice', '알림', hasAlarm)}
      {tab('setting', '키워드 관리')}
    </div>
  );
};

const Notification = () => {
  const [activeCategory, setActiveCategory] = useState('notice');
  useHeaderConfig(
    () => ({ isShowPrev: true, children: '키워드 알림', empty: true }),
    []
  );

  return (
    <div className="min-h-nav-safe bg-white">
      <div className="mx-auto w-full max-w-[640px] px-4 pt-4 pb-20 md:px-6 md:pt-6">
        <Categories active={activeCategory} onChangeCategory={setActiveCategory} />
        <div className="mt-5">
          {activeCategory === 'notice' && <Notice />}
          {activeCategory === 'setting' && <Setting />}
        </div>
      </div>
    </div>
  );
};

export default Notification;
