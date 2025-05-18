import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl,
  Button,
} from 'react-native';

import { useAuth } from '@/utils/authContext';
import ItemCard from '@/components/ItemCard';
import { Item, apiService } from '@/lib/apiService';
import { useFocusEffect } from 'expo-router';

const NUM_COLUMNS = 2; // For 2 cards per row
const CARD_MARGIN = 8;

export default function HomeScreen() {
  const { user } = useAuth();

  const [items, setItems] = useState<Item[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);

  // Calculate card width (keeping your 2-column grid logic)
  const screenWidth = Dimensions.get('window').width;
  const listHorizontalPadding = (styles.listContentContainer.paddingHorizontal || 0) * 2;
  const cardWidth = (screenWidth - listHorizontalPadding) / NUM_COLUMNS - CARD_MARGIN;

  const loadItems = useCallback(async (isPullToRefresh = false) => {
    if (!user?.id) {
      console.log("[HomeScreen] User ID not available, cannot load items.");
      if (!isPullToRefresh) setIsLoadingItems(false);
      setItems([]);
      return;
    }

    console.log("[HomeScreen] Loading items...");
    if (!isPullToRefresh) {
      setIsLoadingItems(true);
    }

    try {
      // Assuming fetchUserItems uses the token (backend infers user from token)
      const fetchedItems = await apiService.fetchUserItems(user.id);
      // If your apiService.fetchUserItems needed user.id:
      // const fetchedItems = await apiService.fetchUserItems(user.id, token);
      setItems(fetchedItems);
    } catch (error) {
      console.error("[HomeScreen] Failed to fetch items:", error);
      setItems([]); // Clear items on error
    } finally {
      // Only set main loading to false if it wasn't a pull-to-refresh
      // The RefreshControl has its own spinner.
      if (!isPullToRefresh) {
        setIsLoadingItems(false);
      }
    }
  }, [user]); // Add user if user.id is needed by loadItems

  // useEffect to load items when the component mounts or token/user changes
  useEffect(() => {
    if (user) { // Only load if user is present
      loadItems();
    } else {
      // If no token, ensure items are cleared (e.g., after logout and screen is still somehow visible before redirect)
      setItems([]);
      setIsLoadingItems(false); // Ensure loading stops if there was no token to begin with
    }
  }, [user, loadItems]); // `loadItems` is memoized and depends on `token` (and `user` if needed)

  useFocusEffect(
    useCallback(() => {
      console.log("[HomeScreen] Screen focused, fetching items.");
      if (user) {
        loadItems();
      }
      // Optional: Return a cleanup function if needed
      // return () => console.log("[HomeScreen] Screen unfocused");
    }, [loadItems, user]) // Dependencies of the effect
  );

  // Initial loading state for the items for this screen
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
          {/* Pull-to-refresh will also work, but a button is good for explicit action */}
          <Button title="Refresh Items" onPress={() => loadItems(true)} disabled={isLoadingItems} />
        </View>
      </View>
    );
  }

  const renderItemCard = ({ item }: { item: Item }) => (
    <View style={{ width: cardWidth, margin: CARD_MARGIN / 2 }}>
      <ItemCard item={item} />
    </View>
  );

  return (
    <View style={styles.screenContainer}>
      <FlatList
        data={items}
        renderItem={renderItemCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.listContentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingItems} // Show spinner when loadItems(true) is running
            onRefresh={() => loadItems(true)} // Pass true to indicate it's a refresh action
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    // Add paddingTop here if this screen doesn't get a header from a navigator
    paddingTop: Platform.OS === 'ios' ? 60 : 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // headerTitle: { // If you want an in-page title
  //   fontSize: 24,
  //   fontWeight: 'bold',
  //   textAlign: 'center',
  //   marginVertical: 10, // Adjust as needed if using paddingTop on screenContainer
  //   paddingTop: Platform.OS === 'ios' ? 20 : 0, // Adjust if this Text is the very first element
  //   color: '#1A202C',
  // },
  listContentContainer: {
    paddingHorizontal: CARD_MARGIN / 2 + 8, // e.g., 4 for item margin + 8 for overall list padding
    paddingTop: CARD_MARGIN, // Add some padding at the top of the list
    paddingBottom: 80, // For space above tab bar
  },
  // errorText: { // Removed as per "no need fetch error" for UI
  //   color: 'red',
  //   marginBottom: 10,
  //   textAlign: 'center',
  // }
});