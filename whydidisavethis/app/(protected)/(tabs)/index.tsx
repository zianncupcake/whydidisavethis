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
} from 'react-native';

import { useAuth } from '@/utils/authContext';
import ItemCard from '@/components/ItemCard';
import { Item, apiService } from '@/lib/apiService';
import { useFocusEffect } from 'expo-router';

const NUM_COLUMNS = 2;
const CARD_MARGIN = 8;

export default function HomeScreen() {
  const { user } = useAuth(); // User object from context

  const [items, setItems] = useState<Item[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true); // For item fetching

  const screenWidth = Dimensions.get('window').width;
  // Ensure styles.listContentContainer.paddingHorizontal is defined if used here
  const listHorizontalPadding = ((styles.listContentContainer && styles.listContentContainer.paddingHorizontal) || 0) * 2;
  const cardWidth = (screenWidth - listHorizontalPadding) / NUM_COLUMNS - CARD_MARGIN;

  const loadItems = useCallback(async () => {
    // Check if user and user.id are available.
    // Your API call apiService.fetchUserItems(user.id) requires user.id.
    if (!user?.id) {
      console.log("[HomeScreen] User ID not available, cannot load items.");
      setIsLoadingItems(false); // Stop loading if no user/token
      setItems([]);
      return;
    }

    console.log("[HomeScreen] Loading items...");
    setIsLoadingItems(true); // Set loading true for any fetch attempt

    try {
      const fetchedItems = await apiService.fetchUserItems(user.id);
      setItems(fetchedItems);
    } catch (error) {
      console.error("[HomeScreen] Failed to fetch items:", error);
      setItems([]); // Clear items on error
    } finally {
      setIsLoadingItems(false); // Always set loading to false after attempt
    }
  }, [user]); // Dependency is user (specifically user.id for the API call)

  // Use useFocusEffect to load items when the screen comes into focus
  // This also handles the initial load when the screen first mounts and focuses.
  useFocusEffect(
    useCallback(() => {
      console.log("[HomeScreen] Screen focused, user:", user ? user.id : 'no user');
      if (user?.id) { // Check if user and user.id exist before loading
        loadItems();
      } else {
        // If no user.id (e.g., user logged out, or auth still loading), clear items.
        // This case should ideally be handled by RootLayout redirecting if !isAuthenticated.
        setItems([]);
        setIsLoadingItems(false); // Ensure loading state is false if no user/token
      }
    }, [user, loadItems]) // Dependencies for the focus effect
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
          <Button title="Refresh Items" onPress={loadItems} disabled={isLoadingItems} />
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
      // refreshControl prop is now removed
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
});