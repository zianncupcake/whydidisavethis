import React, { useEffect, useState, useLayoutEffect } from 'react';
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
    Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Item, apiService, ApiServiceError } from '@/lib/apiService';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ItemDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const navigation = useNavigation();
    const colorScheme = useColorScheme();

    const [item, setItem] = useState<Item | null>(null); // Item can be null if not found or error
    const [isLoadingDetail, setIsLoadingDetail] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const renderCount = React.useRef(0);
    renderCount.current += 1;

    const handleDelete = async () => {
        Alert.alert(
            "Delete Post",
            "Are you sure you want to delete this post?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            await apiService.deleteItem(parseInt(id));
                            Alert.alert("Success", "Post deleted successfully");
                            router.back();
                        } catch (error) {
                            console.error("[ItemDetailScreen] Failed to delete item:", error);
                            const errorMessage = error instanceof ApiServiceError ? error.message : "Failed to delete post";
                            Alert.alert("Error", errorMessage);
                            setIsDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = () => {
        if (item) {
            router.push({
                pathname: '/item/edit',
                params: { 
                    id: id,
                    itemData: JSON.stringify(item)
                }
            });
        }
    };

    const showOptionsMenu = () => {
        Alert.alert(
            "Actions",
            "",
            [
                {
                    text: "Edit post",
                    onPress: handleEdit
                },
                {
                    text: "Delete post",
                    style: "destructive",
                    onPress: handleDelete
                },
                {
                    text: "Cancel",
                    style: "cancel"
                }
            ]
        );
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={showOptionsMenu} style={{ marginRight: 15 }}>
                    <Ionicons name="ellipsis-vertical" size={24} color={Colors[colorScheme ?? 'light'].text} />
                </TouchableOpacity>
            ),
        });
    }, [navigation, item]);

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

    useEffect(() => {
        fetchItemDetails();
    }, [id]);

    // Refresh data when screen comes into focus (after returning from edit)
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchItemDetails();
        });

        return unsubscribe;
    }, [navigation, id]);


    if (isLoadingDetail) {
        return (
            <View style={[styles.centered, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>Loading item details...</Text>
            </View>
        );
    }

    if (fetchError) {
        return (
            <View style={[styles.centered, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].error }]}>Error: {fetchError}</Text>
                <Button title="Go Back" onPress={() => router.back()} />
                {/* You could add a retry button here if appropriate */}
            </View>
        );
    }

    if (!item) {
        return (
            <View style={[styles.centered, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
                <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>Item not found.</Text>
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
        <ScrollView style={[styles.screenContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
            {isDeleting && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={[styles.loadingText, { color: '#fff' }]}>Deleting...</Text>
                </View>
            )}

            {item.image_url && (
                <Image source={{ uri: item.image_url }} style={[styles.image, { backgroundColor: Colors[colorScheme ?? 'light'].placeholderBackground }]} resizeMode="cover" />
            )}
            <View style={styles.contentContainer}>

                {item.creator && (
                    <Text style={[styles.creator, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>By: {item.creator}</Text>
                )}

                {item.notes && (
                    <Text style={[styles.description, { color: Colors[colorScheme ?? 'light'].text }]}>{item.notes}</Text>
                )}

                {item.source_url && (
                    <TouchableOpacity onPress={handlePressSourceUrl} style={styles.linkButton}>
                        <Ionicons name="link-outline" size={18} color={Colors[colorScheme ?? 'light'].primary} />
                        <Text style={[styles.sourceUrl, { color: Colors[colorScheme ?? 'light'].primary }]}>Go to post</Text>
                    </TouchableOpacity>
                )}

                {item.categories && item.categories.length > 0 && (
                    <View style={styles.metaSection}>
                        <Text style={[styles.metaTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Categories:</Text>
                        <View style={styles.tagsContainer}>
                            {item.categories.map((category, index) => (
                                <View key={`cat-${index}`} style={[styles.tag, { backgroundColor: Colors[colorScheme ?? 'light'].tagBackground }]}>
                                    <Text style={[styles.tagText, { color: Colors[colorScheme ?? 'light'].primary }]}>{category}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {item.tags && item.tags.length > 0 && (
                    <View style={styles.metaSection}>
                        <Text style={[styles.metaTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Tags:</Text>
                        <View style={styles.tagsContainer}>
                            {item.tags.map((tag, index) => (
                                <View key={`tag-${index}`} style={[styles.tag, { backgroundColor: Colors[colorScheme ?? 'light'].tagBackground }]}>
                                    <Text style={[styles.tagText, { color: Colors[colorScheme ?? 'light'].primary }]}>{tag}</Text>
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
    },
    contentContainer: {
        padding: 20,
    },
    titleInBody: { // If you want to display the title in the body as well
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    creator: {
        fontSize: 14,
        fontStyle: 'italic',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
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
        marginLeft: 8,
    },
    metaSection: {
        marginBottom: 16,
    },
    metaTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    tag: {
        borderRadius: 16,
        paddingVertical: 5,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 13,
    },
    errorText: { // Added for displaying fetchError
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    }
});