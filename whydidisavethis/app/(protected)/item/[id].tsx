import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Linking,
    TouchableOpacity,
    Button,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Item, apiService, ApiServiceError } from '@/lib/apiService';

export default function ItemDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [item, setItem] = useState<Item | null>(null); // Item can be null if not found or error
    const [isLoadingDetail, setIsLoadingDetail] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const renderCount = React.useRef(0);
    renderCount.current += 1;

    useEffect(() => {
        const fetchItemDetails = async () => {
            setIsLoadingDetail(true);
            setFetchError(null);
            setItem(null);

            try {
                const fetchedItem = await apiService.fetchItem(parseInt(id));
                setItem(fetchedItem);
            } catch (error) {
                console.error("[ItemDetailScreen] Failed to fetch item details:", error);
                const errorMessage = error instanceof ApiServiceError ? error.message : (error instanceof Error ? error.message : "An unknown error occurred.");
                setFetchError(errorMessage);
                setItem(null);
            } finally {
                setIsLoadingDetail(false);
            }
        };

        fetchItemDetails();

    }, [id]);


    if (isLoadingDetail) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
                <Text>Loading item details...</Text>
            </View>
        );
    }

    if (fetchError) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Error: {fetchError}</Text>
                <Button title="Go Back" onPress={() => router.back()} />
                {/* You could add a retry button here if appropriate */}
            </View>
        );
    }

    if (!item) {
        return (
            <View style={styles.centered}>
                <Text>Item not found.</Text>
                <Button title="Go Back" onPress={() => router.back()} />
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
        padding: 20,
    },
    image: {
        width: '100%',
        height: 300, // Adjusted height for detail view
        backgroundColor: '#e0e0e0',
    },
    contentContainer: {
        padding: 20,
    },
    titleInBody: { // If you want to display the title in the body as well
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
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
        borderRadius: 16,
        paddingVertical: 5,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 13,
        color: '#0052cc',
    },
    errorText: { // Added for displaying fetchError
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
    }
});