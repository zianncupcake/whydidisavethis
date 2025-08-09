import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
  Button,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/utils/authContext';
import ItemCard from '@/components/ItemCard';
import { Item, apiService } from '@/lib/apiService';
import { useFocusEffect } from 'expo-router';

const NUM_COLUMNS = 2;
const CARD_MARGIN = 8;

const PAGE_SIZE = 20;

export default function HomeScreen() {
  const { user } = useAuth();

  const [items, setItems] = useState<Item[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const screenWidth = Dimensions.get('window').width;
  const listHorizontalPadding = ((styles.listContentContainer && styles.listContentContainer.paddingHorizontal) || 0) * 2;
  const cardWidth = (screenWidth - listHorizontalPadding) / NUM_COLUMNS - CARD_MARGIN;

  const loadItems = useCallback(async (query?: string, reset: boolean = true, customOffset?: number) => {
    if (!user?.id) {
      console.log("[HomeScreen] User ID not available, cannot load items.");
      setIsLoadingItems(false);
      setItems([]);
      return;
    }

    const currentOffset = customOffset !== undefined ? customOffset : (reset ? 0 : offset);
    
    console.log("[HomeScreen] Loading items...", {
      query: query || 'all items',
      mode: reset ? 'RESET' : 'APPEND',
      offset: currentOffset,
      limit: PAGE_SIZE,
      currentItemCount: items.length
    });
    
    if (reset) {
      setIsLoadingItems(true);
      setOffset(0);
    } else {
      setIsLoadingMore(true);
      console.log(`[HomeScreen] Loading more items: batch starting at offset ${currentOffset}`);
    }

    try {
      const fetchedItems = await apiService.fetchUserItems(user.id, query, currentOffset, PAGE_SIZE);
      
      console.log(`[HomeScreen] Fetched ${fetchedItems.length} items from offset ${currentOffset}`);
      
      if (reset) {
        setItems(fetchedItems);
        console.log(`[HomeScreen] Reset items list with ${fetchedItems.length} items`);
      } else {
        setItems(prev => {
          const newTotal = prev.length + fetchedItems.length;
          console.log(`[HomeScreen] Appending ${fetchedItems.length} items to existing ${prev.length}. New total: ${newTotal}`);
          return [...prev, ...fetchedItems];
        });
      }
      
      // Check if we have more items to load
      const hasMoreItems = fetchedItems.length === PAGE_SIZE;
      setHasMore(hasMoreItems);
      console.log(`[HomeScreen] Has more items to load: ${hasMoreItems}`);
      
      // Update offset for next load
      if (!reset) {
        setOffset(currentOffset + fetchedItems.length);
        console.log(`[HomeScreen] Updated offset for next batch: ${currentOffset + fetchedItems.length}`);
      } else {
        setOffset(fetchedItems.length);
      }
    } catch (error) {
      console.error("[HomeScreen] Failed to fetch items:", error);
      if (reset) {
        setItems([]); // Clear items on error only if resetting
      }
    } finally {
      setIsLoadingItems(false);
      setIsLoadingMore(false);
      console.log("[HomeScreen] Loading complete");
    }
  }, [user?.id]); // Only depend on user.id

  // Use useFocusEffect to load items when the screen comes into focus
  // This also handles the initial load when the screen first mounts and focuses.
  useFocusEffect(
    useCallback(() => {
      console.log("[HomeScreen] Screen focused, user:", user ? user.id : 'no user');
      if (user?.id) { // Check if user and user.id exist before loading
        loadItems(undefined, true, 0);
      } else {
        // If no user.id (e.g., user logged out, or auth still loading), clear items.
        // This case should ideally be handled by RootLayout redirecting if !isAuthenticated.
        setItems([]);
        setIsLoadingItems(false); // Ensure loading state is false if no user/token
      }
    }, [user?.id, loadItems]) // Dependencies for the focus effect
  );

  // If isLoadingItems is true AND there are no items yet (initial load)
  if (isLoadingItems && items.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading your items...</Text>
      </View>
    );
  }

  // If loading is done and no items (could be genuinely no items, or a fetch error)
  if (items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>You haven&apos;t added any items yet!</Text>
        <View style={{ marginTop: 20 }}>
          <Button title="Refresh Items" onPress={() => loadItems()} disabled={isLoadingItems} />
        </View>
      </View>
    );
  }

  const renderItemCard = ({ item }: { item: Item }) => (
    <View style={{ width: cardWidth, margin: CARD_MARGIN / 2 }}>
      <ItemCard item={item} />
    </View>
  );

  const handleSearch = () => {
    if (searchQuery.trim()) {
      loadItems(searchQuery.trim(), true);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    loadItems(undefined, true);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && !searchQuery) {
      console.log(`[HomeScreen] onEndReached triggered - loading next batch from offset ${offset}`);
      loadItems(undefined, false, offset);
    } else {
      if (isLoadingMore) console.log("[HomeScreen] Already loading more items, skipping...");
      if (!hasMore) console.log("[HomeScreen] No more items to load");
      if (searchQuery) console.log("[HomeScreen] Search query active, pagination disabled");
    }
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Smart search with AI"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={isLoadingItems || !searchQuery.trim()}
        >
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            disabled={isLoadingItems}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={items}
        renderItem={renderItemCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.listContentContainer}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    paddingTop: Platform.OS === 'ios' ? 60 : 10, // Keep if needed for status bar
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContentContainer: {
    paddingHorizontal: CARD_MARGIN / 2 + 8,
    paddingTop: CARD_MARGIN,
    paddingBottom: 100, // For space above tab bar
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  searchButton: {
    marginLeft: 10,
    paddingHorizontal: 15,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  clearButtonText: {
    fontSize: 20,
    color: '#666',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});