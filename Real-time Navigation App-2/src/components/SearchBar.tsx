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
          className="w-full bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5 flex items-center gap-3 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 border border-white/50"
        >
          <Search className="w-5 h-5 text-gray-400" />
          <span className="text-gray-500 flex-1 text-left">목적지를 검색하세요</span>
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-hidden border border-white/50">
        {/* Search inputs */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center">
              <Navigation className="w-4 h-4 text-cyan-600" />
            </div>
            <input
              type="text"
              placeholder="출발지 (현재 위치)"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="flex-1 outline-none text-gray-800 placeholder:text-gray-400 bg-transparent"
              autoFocus
            />
          </div>
          
          <div className="h-px bg-gray-100" />
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <input
              type="text"
              placeholder="도착지"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 outline-none text-gray-800 placeholder:text-gray-400 bg-transparent"
            />
          </div>
        </div>

        {/* Recent searches */}
        {(!from && !to) && (
          <div className="border-t border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">최근 검색</span>
            </div>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setFrom(search.from);
                    setTo(search.to);
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-800">{search.from}</span>
                    <span className="text-gray-300">→</span>
                    <span className="text-gray-800">{search.to}</span>
                  </div>
                  <span className="text-gray-400">{search.time}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="p-5 pt-2 flex gap-3">
          <button
            onClick={() => {
              setIsExpanded(false);
              setFrom('');
              setTo('');
            }}
            className="flex-1 py-3.5 px-4 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            취소
          </button>
          <button
            onClick={handleSearch}
            disabled={!from || !to}
            className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
          >
            검색
          </button>
        </div>
      </div>
    </div>
  );
}