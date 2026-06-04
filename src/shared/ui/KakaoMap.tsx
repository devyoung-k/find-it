import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface KakaoMapProps {
  place: string;
  className?: string;
}

const KakaoMap = ({ place, className }: KakaoMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false);
  // 장소 검색이 실제로 성공해 지도를 표시했을 때만 true (그 전까지는 placeholder)
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if ((window as any).kakao?.maps) {
      setIsKakaoLoaded(true);
      return;
    }

    const script = document.querySelector<HTMLScriptElement>(
      'script[src*="dapi.kakao.com"]'
    );
    if (!script) {
      return;
    }

    const handleLoad = () => {
      setIsKakaoLoaded(true);
    };

    script.addEventListener('load', handleLoad);
    return () => {
      script.removeEventListener('load', handleLoad);
    };
  }, []);

  useEffect(() => {
    if (!isKakaoLoaded || typeof window === 'undefined' || !place) {
      return;
    }

    const container = mapRef.current;
    if (!container) return;

    const kakao = (window as any).kakao;
    if (!kakao || !kakao.maps) {
      return;
    }

    let canceled = false;
    setMapReady(false);

    const renderMap = () => {
      if (canceled) return;
      try {
        const options = {
          center: new kakao.maps.LatLng(33.450701, 126.570667),
          level: 3
        };

        const map = new kakao.maps.Map(container, options);
        const ps = new kakao.maps.services.Places();

        ps.keywordSearch(place, (data: any, status: any) => {
          if (
            canceled ||
            status !== kakao.maps.services.Status.OK ||
            !Array.isArray(data) ||
            data.length === 0
          ) {
            return; // 실패 → placeholder 유지
          }

          const coords = new kakao.maps.LatLng(
            parseFloat(data[0].y),
            parseFloat(data[0].x)
          );

          map.setCenter(coords);
          new kakao.maps.Marker({ map, position: coords });

          const content = document.createElement('div');
          content.className =
            'flex bg-white text-black border border-black px-[12px] py-[4px]';
          const label = document.createElement('span');
          label.className = 'text-xs';
          label.textContent = place;
          content.appendChild(label);

          new kakao.maps.CustomOverlay({
            map,
            position: coords,
            content,
            yAnchor: 2.8
          });

          if (!canceled) setMapReady(true);
        });
      } catch {
        // SDK 키/도메인 문제 등 → placeholder 유지
      }
    };

    kakao.maps.load(renderMap);

    return () => {
      canceled = true;
      container.innerHTML = '';
    };
  }, [place, isKakaoLoaded]);

  return (
    <div className={`relative ${className ?? ''}`}>
      <div ref={mapRef} className="absolute inset-0 h-full w-full" />
      {!mapReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-gray-50 text-gray-400">
          <MapPin size={26} className="text-gray-300" />
          <p className="px-4 text-center text-xs font-medium text-gray-500">
            {place || '위치 정보'}
          </p>
          <p className="text-[11px] text-gray-400">지도를 표시할 수 없어요</p>
        </div>
      )}
    </div>
  );
};

export default KakaoMap;
