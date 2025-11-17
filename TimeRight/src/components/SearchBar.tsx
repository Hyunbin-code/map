import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import HistoryService, { SearchHistory } from '../services/HistoryService';
import FavoritesService, { Favorite } from '../services/FavoritesService';

interface SearchQuery {
  from: string;
  to: string;
}

interface SearchBarProps {
  onSearch: (query: SearchQuery) => void;
  style?: any;
}

export function SearchBar({ onSearch, style }: SearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [recentSearches, setRecentSearches] = useState<SearchHistory[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  // 히스토리 및 즐겨찾기 로드
  useEffect(() => {
    if (isExpanded) {
      loadHistory();
      loadFavorites();
    }
  }, [isExpanded]);

  const loadHistory = async () => {
    const history = await HistoryService.getHistory();
    setRecentSearches(history);
  };

  const loadFavorites = async () => {
    const favs = await FavoritesService.getFavorites();
    setFavorites(favs);
  };

  const handleSearch = async () => {
    if (from && to) {
      // 히스토리 저장
      await HistoryService.addHistory(from, to);

      onSearch({ from, to });
      setIsExpanded(false);
    }
  };

  const handleRecentSearch = (search: SearchHistory) => {
    setFrom(search.from);
    setTo(search.to);
  };

  const handleRemoveHistory = async (search: SearchHistory, e: any) => {
    e.stopPropagation();
    await HistoryService.removeHistory(search.from, search.to);
    await loadHistory();
  };

  if (!isExpanded) {
    return (
      <View style={[styles.container, style]}>
        <TouchableOpacity
          style={styles.collapsedButton}
          onPress={() => setIsExpanded(true)}
        >
          <View style={styles.searchIconCircle}>
            <View style={styles.searchIconLine} />
          </View>
          <Text style={styles.placeholder}>목적지 검색</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.expandedCard}>
        {/* Search inputs */}
        <View style={styles.inputSection}>
          <View style={styles.inputRow}>
            <View style={styles.locationDotFrom} />
            <TextInput
              style={styles.input}
              placeholder="출발지 (현재 위치)"
              placeholderTextColor="#9CA3AF"
              value={from}
              onChangeText={setFrom}
              autoFocus
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.inputRow}>
            <View style={styles.locationDotTo} />
            <TextInput
              style={styles.input}
              placeholder="도착지"
              placeholderTextColor="#9CA3AF"
              value={to}
              onChangeText={setTo}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Favorites */}
        {!from && !to && favorites.length > 0 && (
          <View style={styles.favoritesSection}>
            <Text style={styles.sectionTitle}>즐겨찾기</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.favoritesScroll}
            >
              {favorites.map((favorite) => (
                <TouchableOpacity
                  key={favorite.id}
                  style={styles.favoriteChip}
                  onPress={() => setTo(favorite.name)}
                >
                  <Text style={styles.favoriteIcon}>{favorite.icon}</Text>
                  <Text style={styles.favoriteName}>{favorite.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent searches */}
        {!from && !to && recentSearches.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>최근 검색</Text>
            <View style={styles.recentList}>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentItem}
                  onPress={() => handleRecentSearch(search)}
                >
                  <View style={styles.recentContent}>
                    <View style={styles.recentRoute}>
                      <Text style={styles.recentText}>{search.from}</Text>
                      <Text style={styles.arrow}>→</Text>
                      <Text style={styles.recentText}>{search.to}</Text>
                    </View>
                    <Text style={styles.recentTime}>{search.timeFormatted}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => handleRemoveHistory(search, e)}
                  >
                    <Text style={styles.deleteIcon}>✕</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setIsExpanded(false);
              setFrom('');
              setTo('');
            }}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.searchButton,
              (!from || !to) && styles.searchButtonDisabled,
            ]}
            onPress={handleSearch}
            disabled={!from || !to}
          >
            <Text
              style={[
                styles.searchButtonText,
                (!from || !to) && styles.searchButtonTextDisabled,
              ]}
            >
              검색
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
  },
  collapsedButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    position: 'relative',
  },
  searchIconLine: {
    position: 'absolute',
    width: 6,
    height: 2,
    backgroundColor: '#9CA3AF',
    bottom: -4,
    right: -4,
    transform: [{ rotate: '45deg' }],
  },
  placeholder: {
    flex: 1,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  expandedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  inputSection: {
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationDotFrom: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#9CA3AF',
  },
  locationDotTo: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  favoritesSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    paddingHorizontal: 16,
    marginBottom: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  favoritesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  favoriteChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  favoriteIcon: {
    fontSize: 18,
  },
  favoriteName: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  recentSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  recentList: {
    gap: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  recentContent: {
    flex: 1,
  },
  recentRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  recentText: {
    fontSize: 16,
    color: '#1F2937',
  },
  arrow: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  recentTime: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteIcon: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  buttonRow: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  searchButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  searchButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  searchButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
