import { Item } from '@/lib/apiService';
import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text, Image, StyleSheet, Linking, TouchableOpacity } from 'react-native';

// export interface Item {
//     id: number;
//     image_url?: string;
//     notes?: string;
//     creator?: string;
//     source_url?: string;
//     categories?: string[];
//     tags?: string[];
// }

interface ItemCardProps {
    item: Item;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
    const router = useRouter();
    // const handlePressSourceUrl = () => {

    //     if (item.source_url) {
    //         Linking.openURL(item.source_url).catch(err => console.error("Couldn't load page", err));
    //     }
    // };

    const handleCardPress = () => {
        // Navigate to the item detail screen, passing the item ID
        // Assuming your detail screen will be at a path like '/item/[id]'
        // If your HomeScreen is in (tabs), the path would be like '/(tabs)/item/[id]'
        // For simplicity, let's assume a top-level item detail route for now, or adjust path as needed.
        router.push(`/(protected)/item/${item.id}`);

        // More robust way with object syntax, especially if within a layout group:
        // router.push({
        //     pathname: `/(tabs)/item/${item.id}`, // Adjust if your tabs group is named differently or path is elsewhere
        //     // params: { id: item.id } // Params are inferred from the path for dynamic segments
        // });
    };

    return (
        <TouchableOpacity onPress={handleCardPress}>
            <View style={styles.card}>
                {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                    <View style={[styles.cardImage, styles.imagePlaceholder]}>
                        <Text style={styles.imagePlaceholderText}>No Image</Text>
                    </View>
                )}
                <View style={styles.cardContent}>
                    {item.notes && (
                        <Text style={styles.cardDescription} numberOfLines={3}>
                            {item.notes}
                        </Text>
                    )}
                    {/* {item.creator && (
                    <Text style={styles.cardCreator}>
                        By: {item.creator}
                    </Text>
                )} */}
                    {/* {item.source_url && (
                    <TouchableOpacity onPress={handlePressSourceUrl}>
                        <Text style={styles.cardSourceUrlLabel}>Source: <Text style={styles.cardSourceUrl}>{item.source_url}</Text></Text>
                    </TouchableOpacity>
                )}
                {item.categories && item.categories.length > 0 && (
                    <View style={styles.tagsContainer}>
                        <Text style={styles.tagsLabel}>Categories: </Text>
                        {item.categories.map((category, index) => (
                            <View key={`cat-${index}`} style={styles.tag}>
                                <Text style={styles.tagText}>{category}</Text>
                            </View>
                        ))}
                    </View>
                )}
                {item.tags && item.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        <Text style={styles.tagsLabel}>Tags: </Text>
                        {item.tags.map((tag, index) => (
                            <View key={`tag-${index}`} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                )} */}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        flex: 1,
    },
    cardImage: {
        width: '100%',
        height: 200, // Or make this dynamic/aspect ratio based if needed
    },
    imagePlaceholder: {
        backgroundColor: '#e1e4e8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        color: '#586069',
        fontSize: 12,
    },
    cardContent: {
        padding: 12, // Reduced padding slightly for smaller cards
        flex: 1,
        height: 80
    },
    cardDescription: {
        fontSize: 12,
        color: '#586069',
        marginBottom: 6,
        lineHeight: 16,
    },
});

export default ItemCard;