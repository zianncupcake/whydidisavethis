import { Platform, StyleSheet, TextInput, Button, Alert, View, ScrollView, ActivityIndicator, Text, Image, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PillInput from '@/components/PillInput';
import { useAuth } from '@/utils/authContext';
import { apiService, ApiServiceError, Item, ItemCreatePayload } from '@/lib/apiService';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function EditItemScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { id, itemData } = useLocalSearchParams<{ id: string; itemData: string }>();
  
  // Parse the item data passed from the detail screen
  const existingItem: Item = itemData ? JSON.parse(itemData) : null;

  const [sourceUrl, setSourceUrl] = useState(existingItem?.source_url || '');
  const [notes, setNotes] = useState(existingItem?.notes || '');
  const [categories, setCategories] = useState<string[]>(existingItem?.categories || []);
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>(existingItem?.tags || []);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [creator, setCreator] = useState(existingItem?.creator || '');
  const [imageUrl, setImageUrl] = useState(existingItem?.image_url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert(
        "User Not Authenticated",
        "You need to be logged in to edit an item. Please try logging in again."
      );
      return;
    }

    const updateData: Partial<ItemCreatePayload> = {
      source_url: sourceUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      categories: categories.filter(cat => cat.trim() !== ''),
      tags: tags.filter(tag => tag.trim() !== ''),
      creator: creator.trim() || undefined,
      image_url: imageUrl.trim() || undefined,
    };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const updatedItem: Item = await apiService.updateItem(parseInt(id), updateData);
      console.log('Item updated successfully:', updatedItem);
      Alert.alert('Success!', 'Item updated successfully.');

      // Navigate back to the item detail screen
      router.back();

    } catch (error) {
      console.error('Failed to update item:', error);
      if (error instanceof ApiServiceError) {
        setSubmitError(error.message);
        Alert.alert('Error Updating Item', error.message);
      } else if (error instanceof Error) {
        setSubmitError(error.message);
        Alert.alert('Error', 'An unexpected error occurred: ' + error.message);
      } else {
        setSubmitError('An unexpected error occurred.');
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.formSection}>
        <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>✏️ Edit Post Details</Text>

        {imageUrl && <View style={[styles.imageContainer, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground, borderColor: Colors[colorScheme ?? 'light'].border }]}>
          <Image
            source={{ uri: imageUrl }}
            style={[styles.image, { backgroundColor: Colors[colorScheme ?? 'light'].placeholderBackground }]}
            resizeMode="contain"
            onLoadStart={() => console.log('[Image] Loading started...')}
            onLoadEnd={() => console.log('[Image] Loading finished.')}
            onError={(error) => console.error('[Image] Error loading image:', error.nativeEvent.error)}
          />
        </View>}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>Source URL</Text>
          <TextInput
            style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground, color: Colors[colorScheme ?? 'light'].text, borderColor: Colors[colorScheme ?? 'light'].border }]}
            value={sourceUrl}
            onChangeText={setSourceUrl}
            placeholder="https://example.com/your-saved-post"
            placeholderTextColor={Colors[colorScheme ?? 'light'].textMuted}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground, color: Colors[colorScheme ?? 'light'].text, borderColor: Colors[colorScheme ?? 'light'].border }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Why did you save this? Any key takeaways..."
            placeholderTextColor={Colors[colorScheme ?? 'light'].textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <PillInput
            label="Categories"
            placeholder="Add categories..."
            selectedItems={categories}
            onSetSelectedItems={setCategories}
            suggestedItems={suggestedCategories}
            onSetSuggestedItems={setSuggestedCategories}
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.inputGroup}>
          <PillInput
            label="Tags"
            placeholder="Add tags..."
            selectedItems={tags}
            onSetSelectedItems={setTags}
            suggestedItems={suggestedTags}
            onSetSuggestedItems={setSuggestedTags}
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>Creator</Text>
          <TextInput
            style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground, color: Colors[colorScheme ?? 'light'].text, borderColor: Colors[colorScheme ?? 'light'].border }]}
            value={creator}
            onChangeText={setCreator}
            placeholder="@username or Creator's Name"
            placeholderTextColor={Colors[colorScheme ?? 'light'].textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>Image URL</Text>
          <TextInput
            style={[styles.input, { backgroundColor: Colors[colorScheme ?? 'light'].inputBackground, color: Colors[colorScheme ?? 'light'].text, borderColor: Colors[colorScheme ?? 'light'].border }]}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor={Colors[colorScheme ?? 'light'].textMuted}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        {submitError && (
          <View style={[styles.errorContainer, { backgroundColor: Colors[colorScheme ?? 'light'].errorBackground, borderColor: Colors[colorScheme ?? 'light'].errorBorder }]}>
            <Text style={[styles.submitError, { color: Colors[colorScheme ?? 'light'].error }]}>{submitError}</Text>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.updateButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }, isSubmitting && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.updateButtonText, { color: '#fff' }]}>Update Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
  },
  
  // Form Section
  formSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  
  // Input Styles
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  textArea: {
    height: 120,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  
  // Update Button
  updateButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  updateButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  
  // Error Styles
  errorContainer: {
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
  },
  submitError: {
    fontSize: 14,
    textAlign: 'center',
  },
  
  // Image Preview
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
});