import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';

interface SearchQuery {
  from: string;
  to: string;
}

interface SearchBarProps {
  onSearch: (query: SearchQuery) => void;
  style?: any;
}

interface RecentSearch {
  from: string;
  to: string;
  time: string;
}

export function SearchBar({ onSearch, style }: SearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const recentSearches: RecentSearch[] = [
    { from: '강남역', to: '역삼역', time: '오전 10:30' },
    { from: '홍대입구역', to: '신촌역', time: '어제' },
  ];

  const handleSearch = () => {
    if (from && to) {
      onSearch({ from, to });
      setIsExpanded(false);
    }
  };

  const handleRecentSearch = (search: RecentSearch) => {
    setFrom(search.from);
    setTo(search.to);
  };

  if (!isExpanded) {
    return (
      <View style={[styles.container, style]}>
        <TouchableOpacity
          style={styles.collapsedButton}
          onPress={() => setIsExpanded(true)}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.placeholder}>목적지를 검색하세요</Text>
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
            <Text style={styles.locationIcon}>🧭</Text>
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
            <Text style={styles.locationIcon}>📍</Text>
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

        {/* Recent searches */}
        {!from && !to && (
          <View style={styles.recentSection}>
            <View style={styles.recentHeader}>
              <Text style={styles.clockIcon}>🕐</Text>
              <Text style={styles.recentTitle}>최근 검색</Text>
            </View>
            <View style={styles.recentList}>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentItem}
                  onPress={() => handleRecentSearch(search)}
                >
                  <View style={styles.recentRoute}>
                    <Text style={styles.recentText}>{search.from}</Text>
                    <Text style={styles.arrow}>→</Text>
                    <Text style={styles.recentText}>{search.to}</Text>
                  </View>
                  <Text style={styles.recentTime}>{search.time}</Text>
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
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    fontSize: 20,
  },
  placeholder: {
    flex: 1,
    fontSize: 16,
    color: '#9CA3AF',
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
  locationIcon: {
    fontSize: 20,
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
  recentSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  clockIcon: {
    fontSize: 16,
  },
  recentTitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  recentList: {
    gap: 8,
  },
  recentItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
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
