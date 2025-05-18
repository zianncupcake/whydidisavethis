// app/(tabs)/item/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, Linking, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from "@/utils/authContext";
import { Item } from '@/lib/apiService';

export default function ItemDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>(); // Get the 'id' param from the URL
    const { user } = useAuth(); // Get the full user object which might contain all items
    const router = useRouter();

    const [item, setItem] = useState<Item | null | undefined>(undefined); // undefined: loading, null: not found

    useEffect(() => {
        if (user && user.items && id) {
            const foundItem = user.items.find(i => i.id.toString() === id);
            setItem(foundItem); // Set to null if not found
        } else if (user && !user.items && id) {
            // If user object doesn't contain items, you might need to fetch the specific item by ID
            // console.log(`Item with ID ${id} not found in local user.items. Consider fetching from API.`);
            // Example: apiService.getItemById(id).then(setItem).catch(() => setItem(null));
            setItem(null); // Placeholder for not found if not fetching individually
        }
    }, [user, id]);

    //   // Dynamically set the header title for this screen
    //   // This is one way; another is configuring it in the _layout.tsx if simpler
    //   useEffect(() => {
    //     if (item?.title) {
    //       // Note: For Expo Router v3+, direct navigation.setOptions might be different.
    //       // This usually works if this screen is directly managed by a Stack navigator
    //       // from a parent _layout. For a simple title, using options in _layout is often cleaner.
    //       // For dynamic routes, you can also export 'options' from this file.
    //       // For now, let's assume the title can be set in the parent layout or you handle it manually.
    //     }
    //   }, [item, router]);


    if (item === undefined) { // Still loading/determining item
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (item === null) {
        return (
            <View style={styles.centered}>
                <Text>Item not found.</Text>
            </View>
        );
    }

    const handlePressSourceUrl = () => {
        if (item.source_url) {
            Linking.openURL(item.source_url).catch(err => console.error("Couldn't load page", err));
        }
    };

    return (
        <ScrollView style={styles.screenContainer}>
            {/* Optional: Add a custom header or use Stack.Screen options in layout */}
            {/* <Stack.Screen options={{ title: item.title || 'Item Details' }} /> */}

            {item.image_url && (
                <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="cover" />
            )}
            <View style={styles.contentContainer}>

                {item.creator && (
                    <Text style={styles.creator}>By: {item.creator}</Text>
                )}

                {item.notes && (
                    <Text style={styles.description}>{item.notes}</Text>
                )}

                {item.source_url && (
                    <TouchableOpacity onPress={handlePressSourceUrl} style={styles.linkButton}>
                        <Ionicons name="link-outline" size={18} color="#007bff" />
                        <Text style={styles.sourceUrl}>Go to post</Text>
                    </TouchableOpacity>
                )}

                {item.categories && item.categories.length > 0 && (
                    <View style={styles.metaSection}>
                        <Text style={styles.metaTitle}>Categories:</Text>
                        <View style={styles.tagsContainer}>
                            {item.categories.map((category, index) => (
                                <View key={`cat-${index}`} style={styles.tag}>
                                    <Text style={styles.tagText}>{category}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {item.tags && item.tags.length > 0 && (
                    <View style={styles.metaSection}>
                        <Text style={styles.metaTitle}>Tags:</Text>
                        <View style={styles.tagsContainer}>
                            {item.tags.map((tag, index) => (
                                <View key={`tag-${index}`} style={styles.tag}>
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: 350, // Larger image for detail view
        backgroundColor: '#e0e0e0',
    },
    contentContainer: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1A202C',
    },
    creator: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#6a737d',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#2D3748',
        marginBottom: 16,
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        marginBottom: 16,
    },
    sourceUrl: {
        fontSize: 16,
        color: '#007bff',
        marginLeft: 8,
        // textDecorationLine: 'underline', // Handled by link appearance
    },
    metaSection: {
        marginBottom: 16,
    },
    metaTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4A5568',
        marginBottom: 8,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    tag: {
        backgroundColor: '#eef4ff',
        borderRadius: 16, // More pill-like
        paddingVertical: 5,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 13,
        color: '#0052cc',
    },
});