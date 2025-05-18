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
        // margin will be handled by the FlatList item wrapper for grid layout
        // width will be determined by the FlatList item wrapper
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        flex: 1, // Make card take up space given by its wrapper
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
    },
    cardTitle: {
        fontSize: 15, // Slightly smaller for grid view
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#0366d6',
    },
    cardDescription: {
        fontSize: 12,
        color: '#586069',
        marginBottom: 6,
        lineHeight: 16,
    },
    cardCreator: {
        fontSize: 11,
        fontStyle: 'italic',
        color: '#6a737d',
        marginBottom: 6,
    },
    cardSourceUrlLabel: {
        fontSize: 12,
        color: '#24292e',
        marginBottom: 6,
    },
    cardSourceUrl: {
        color: '#007bff',
        textDecorationLine: 'underline',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: 4,
    },
    tagsLabel: {
        fontSize: 12,
        color: '#24292e',
        marginRight: 4,
        fontWeight: '500',
    },
    tag: {
        backgroundColor: '#eef4ff',
        borderRadius: 4,
        paddingVertical: 2,
        paddingHorizontal: 6,
        marginRight: 4,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 11,
        color: '#0052cc',
    },
});

export default ItemCard;