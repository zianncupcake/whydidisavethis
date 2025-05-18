import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { useAuth } from '@/utils/authContext';
import ItemCard from '@/components/ItemCard'; // Import ItemCard and ItemType
import { Item } from '@/lib/apiService';

export default function HomeScreen() {
  const { user } = useAuth();

  if (!user?.items || user.items.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>You haven&apos;t added any items yet!</Text>
      </View>
    );
  }

  // Calculate card width for numColumns layout here, in the screen component
  const numColumns = 2;
  const screenPadding = 16;
  const cardMargin = 8; // This should match the margin in ItemCard styles
  const cardWidth = (Dimensions.get('window').width - (screenPadding * 2) - (cardMargin * numColumns * 2) + (cardMargin * numColumns)) / numColumns;
  // A simpler calculation if margin is applied outside by columnWrapperStyle or FlatList's contentContainerStyle
  // const cardWidth = (Dimensions.get('window').width / numColumns) - (screenPadding); // Adjust based on how you space items


  return (
    <View style={styles.screenContainer}>
      <FlatList
        data={user.items as Item[]} // Assert type if user.items might not match ItemType exactly
        renderItem={({ item }) => (
          <View style={{ width: cardWidth, marginHorizontal: cardMargin / 2 }}>
            {/* This wrapper View helps manage width and spacing for numColumns */}
            <ItemCard item={item} />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        contentContainerStyle={styles.listContentContainer}
      // columnWrapperStyle={styles.row} // Use if you need specific styles for the row wrapper
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    paddingTop: Platform.OS === 'ios' ? 80 : 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#1A202C',
  },
  listContentContainer: {
    paddingHorizontal: 8, // Adjust based on card margin and desired screen padding
  },
  // row: { // If using columnWrapperStyle
  //   justifyContent: 'space-around',
  // },
});