import { useState } from 'react';
import { Search, MapPin, Navigation, Clock } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: { from: string; to: string }) => void;
  className?: string;
}

export function SearchBar({ onSearch, className = '' }: SearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const handleSearch = () => {
    if (from && to) {
      onSearch({ from, to });
      setIsExpanded(false);
    }
  };

  const recentSearches = [
    { from: '강남역', to: '역삼역', time: '오전 10:30' },
    { from: '홍대입구역', to: '신촌역', time: '어제' },
  ];

  if (!isExpanded) {
    return (
      <div className={className}>
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 hover:shadow-xl transition-shadow"
        >
          <Search className="w-5 h-5 text-gray-400" />
          <span className="text-gray-500 flex-1 text-left">목적지를 검색하세요</span>
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Search inputs */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Navigation className="w-5 h-5 text-blue-600" />
            <input
              type="text"
              placeholder="출발지 (현재 위치)"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="flex-1 outline-none text-gray-800 placeholder:text-gray-400"
              autoFocus
            />
          </div>
          
          <div className="h-px bg-gray-200" />
          
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-red-600" />
            <input
              type="text"
              placeholder="도착지"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 outline-none text-gray-800 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Recent searches */}
        {(!from && !to) && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">최근 검색</span>
            </div>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setFrom(search.from);
                    setTo(search.to);
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-800">{search.from}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-800">{search.to}</span>
                  </div>
                  <span className="text-gray-500">{search.time}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="p-4 pt-0 flex gap-2">
          <button
            onClick={() => {
              setIsExpanded(false);
              setFrom('');
              setTo('');
            }}
            className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSearch}
            disabled={!from || !to}
            className="flex-1 py-3 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            검색
          </button>
        </div>
      </div>
    </div>
  );
}
