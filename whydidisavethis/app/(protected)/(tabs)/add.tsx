import { Platform, StyleSheet, TextInput, Button, Alert, View, ScrollView, ActivityIndicator, Text, Image } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PillInput from '@/components/PillInput';
import { useAuth } from '@/utils/authContext';
import { apiService, ApiServiceError, ItemCreatePayload, ItemResponse } from '@/lib/apiService';

export default function TabTwoScreen() {
  const { user } = useAuth();

  const [socialMediaLink, setSocialMediaLink] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [creator, setCreator] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const BACKEND_API_URL = Constants.expoConfig?.extra?.backendEndpoint;
  const ws = useRef<WebSocket | null>(null);
  const router = useRouter();

  const { url: deepLinkUrlParam } = useLocalSearchParams<{ url?: string | string[] }>();
  const deepLinkUrl = Array.isArray(deepLinkUrlParam) ? deepLinkUrlParam[0] : deepLinkUrlParam;
  const [lastProcessedDeepLink, setLastProcessedDeepLink] = useState<string | null>(null);

  const logToConsole = (...args: any[]) => {
    console.log('[ExploreScreen WS]', ...args);
  };

  const connectWebSocket = useCallback((taskId: string, submittedLink: string) => {
    if (!BACKEND_API_URL) {
      logToConsole('Configuration Error', 'Backend API URL is not configured.');
      setCurrentTaskId(null);
      setIsLoading(false);
      return;
    }

    const wsScheme = BACKEND_API_URL.startsWith('https:') ? 'wss:' : 'ws:';
    const wsUrlBase = BACKEND_API_URL.replace(/^https?:/, '');
    const webSocketUrl = `${wsScheme}${wsUrlBase}/ws/task_status/${taskId}`;

    logToConsole(`Attempting to connect to WebSocket: ${webSocketUrl}`);

    if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
      logToConsole('CONNECT_WEBSOCKET: Closing existing WebSocket connection.');
      ws.current.close(1000, "New connection requested");
    }

    ws.current = new WebSocket(webSocketUrl);

    ws.current.onopen = () => {
      logToConsole(`WebSocket connected for task ID: ${taskId}`);
      // You could send a message here if your backend expects one,
      // but for this setup, the task_id is in the URL.
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string);
        logToConsole('WebSocket message received:', message);

        if (message.task_id === taskId) {
          if (message.status === 'SUCCESS' || message.status === 'SUCCESSFUL') {
            logToConsole('Processing Complete!', 'Content details have been fetched via WebSocket.');
            const { data, error } = message.result;
            if (data && !error) {
              setSourceUrl(submittedLink);
              setNotes(data.desc || '');
              // setCategories(data.diversificationLabels ? data.diversificationLabels.join(', ') : '');
              // setTags(data.suggestedWords ? data.suggestedWords.join(', ') : '');
              setSuggestedTags(Array.isArray(data.suggestedWords) ? data.suggestedWords.filter((tag: string) => tag.trim() !== '') : []);
              setSuggestedCategories(Array.isArray(data.diversificationLabels) ? data.diversificationLabels.filter((cat: string) => cat.trim() !== '') : []);
              setCreator(data.creator || '');
              setImageUrl(data.r2ImageUrl || '');
              logToConsole(`ONMESSAGE: SUCCESS processed for ${taskId}. Setting isLoading=false, currentTaskId=null.`);
            } else if (data && data.error) {
              Alert.alert('Task Error', `The processing task failed: ${data.error}`);
              logToConsole(`ONMESSAGE: Task data error for ${taskId}. Setting isLoading=false, currentTaskId=null.`);
            } else {
              Alert.alert('Task Error', 'Processing completed but result format is unexpected.');
              logToConsole(`ONMESSAGE: Unexpected result format for ${taskId}. Setting isLoading=false, currentTaskId=null.`);
            }
            setIsLoading(false);
            setCurrentTaskId(null);
            setSocialMediaLink('')
            ws.current?.close(1000, "Task successful");
          } else if (message.status === 'FAILURE' || message.status === 'FAILED') {
            Alert.alert('Processing Failed', `Task failed: ${JSON.stringify(message.result?.error || message.result)}`);
            setIsLoading(false);
            setCurrentTaskId(null);
            ws.current?.close(1000, "Task failed");
          } else if (message.status === 'ERROR' || message.status === 'UNKNOWN_STATUS') {
            Alert.alert('Processing Issue', `An issue occurred: ${JSON.stringify(message.result?.error || "Unknown error")}`);
            setIsLoading(false);
            setCurrentTaskId(null);
            ws.current?.close(1000, "Task error/unknown");
          }
          // Other statuses like PENDING or STARTED might be sent by the backend
          // if you configured it to do so. Handle them if needed.
        }
      } catch (error) {
        logToConsole('Error processing WebSocket message:', error);
        Alert.alert('WebSocket Error', 'Received an invalid message from the server.');
        if (currentTaskId === taskId) { // Check against current state if this error is for the active task
          setIsLoading(false);
          setCurrentTaskId(null);
        }
        ws.current?.close(1006, "Message parsing error");
      }
    };

    ws.current.onerror = (error) => {
      logToConsole('WebSocket error:', error);
      Alert.alert('WebSocket Connection Error', 'Could not connect to the update service. Please try again.');
      setIsLoading(false);
      setCurrentTaskId(null);
    };

    ws.current.onclose = (event) => {
      logToConsole('WebSocket disconnected.', `Code: ${event.code}, Reason: ${event.reason}`);
      // You might want to differentiate between clean and unclean closes.
      // For this simple case, we assume if it's loading and closes unexpectedly, it's an issue.
      if (isLoading && currentTaskId) { // If it closed while we were still expecting a result
        // Alert.alert('WebSocket Disconnected', 'Connection to update service was lost.');
        // setIsLoading(false); // Already handled by onerror or onmessage for final states
      }
    };
  }, [isLoading, currentTaskId, BACKEND_API_URL]);

  const processAutofill = useCallback(async (urlToSubmit: string) => {
    // Prevent new submissions if one is already in progress
    if (isLoading) {
      logToConsole(`Autofill for "${urlToSubmit}" attempted while task "${currentTaskId || 'N/A'}" is already processing. Ignoring new request.`);
      Alert.alert("Processing Busy", "Another link is currently being processed. Please wait.");
      return;
    }

    if (!urlToSubmit.trim()) {
      Alert.alert('Input Required', 'A valid link is needed to autofill.');
      // No need to setIsLoading(false) here as it wasn't set true yet for this path
      return;
    }
    if (!BACKEND_API_URL) {
      Alert.alert('Configuration Error', 'Backend API endpoint is not configured.');
      // No need to setIsLoading(false) here
      return;
    }

    setTags([]);
    setSuggestedTags([]);
    setCategories([]);
    setSuggestedCategories([]);
    setIsLoading(true); // Set loading state for the current operation
    setCurrentTaskId(null); // Reset task ID for the new submission

    const submitUrlPath = `${BACKEND_API_URL}/submit_url`;
    logToConsole('Submitting URL:', urlToSubmit, 'to:', submitUrlPath);

    try {
      logToConsole('PROCESS_AUTOFILL: Attempting response.json()...');
      const response = await fetch(submitUrlPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToSubmit }),
      });
      // const data = await response.json();
      logToConsole('PROCESS_AUTOFILL: Fetch response received. Status:', response?.status, 'Ok:', response?.ok);
      let data;
      try {
        logToConsole('PROCESS_AUTOFILL: Attempting response.json()...');
        data = await response.json(); // This might fail if response is not JSON
        logToConsole('PROCESS_AUTOFILL: response.json() successful. Data:', data);
      } catch (jsonParseError: any) {
        logToConsole('PROCESS_AUTOFILL: JSON Parse Error:', jsonParseError.message);
        // Attempt to get the response as text to see what was actually returned
        if (response) { // Check if response object exists
          try {
            const textResponse = await response.text();
            logToConsole('PROCESS_AUTOFILL: Non-JSON Response from server:', textResponse);
            Alert.alert('Server Error', `Received an unexpected response. Status: ${response.status}. Check console for details.`);
          } catch (textReadError) {
            logToConsole('PROCESS_AUTOFILL: Failed to read response as text:', textReadError);
            Alert.alert('Server Error', `Unparseable response. Status: ${response.status}`);
          }
        } else {
          Alert.alert('Network Error', 'No response received from server for JSON parse step.');
        }
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        logToConsole('PROCESS_AUTOFILL: Response not OK. Status:', response.status, 'Parsed Data:', data);
        const errorMessage = data?.detail || data?.message || `Failed to submit URL (HTTP ${response.status})`;
        throw new Error(errorMessage);
      }

      if (data.task_id) {
        Alert.alert('URL Submitted', `Processing started. Task ID: ${data.task_id}. Waiting for updates...`);
        setCurrentTaskId(data.task_id); // Set the new task ID
        connectWebSocket(data.task_id, urlToSubmit);
      } else {
        Alert.alert('Submission Error', data.message || 'Failed to get a task ID.');
        setIsLoading(false); // Reset loading if submission itself failed to return a task_id
      }
    } catch (error: any) {
      logToConsole('Autofill API submission error:', error);
      Alert.alert('Submission Error', `Could not submit URL: ${error.message}`);
      setIsLoading(false); // Reset loading on error
    }
    // `connectWebSocket` is stable due to its own useCallback([], ...)
    // `isLoading` and `currentTaskId` are included to ensure the initial check uses their current values.
  }, [isLoading, currentTaskId, connectWebSocket, BACKEND_API_URL]);

  const handleAutofillButtonPressed = () => {
    processAutofill(socialMediaLink);
  };

  useEffect(() => {
    // Process deep link URL if it's new and different from the last processed one
    if (deepLinkUrl && deepLinkUrl !== lastProcessedDeepLink) {
      try {
        const decodedUrl = decodeURIComponent(deepLinkUrl);
        logToConsole(`Received new deep link URL: ${decodedUrl}`);
        setSocialMediaLink(decodedUrl); // Update input field for user visibility
        processAutofill(decodedUrl);    // Process the new URL
        setLastProcessedDeepLink(deepLinkUrl); // Mark this specific (encoded) deepLinkUrl as processed
      } catch (e) {
        logToConsole('Failed to decode deep link URL:', e);
        Alert.alert('Error', 'Received an invalid URL via deep link.');
        setLastProcessedDeepLink(deepLinkUrl); // Mark as processed to avoid error loops with the same invalid URL
      }
    }
    // `processAutofill` is now a dependency. `router` is stable.
  }, [deepLinkUrl, lastProcessedDeepLink, processAutofill, router]);

  useEffect(() => {
    return () => {
      if (ws.current) {
        logToConsole('ExploreScreen unmounting. Closing WebSocket.');
        ws.current.close(1000, "Component unmounting");
      }
    };
  }, []);

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert(
        "User Not Authenticated",
        "You need to be logged in to add an item. Please try logging in again."
      );
      return;
    }

    const postData: ItemCreatePayload = {
      source_url: sourceUrl.trim() || undefined,
      notes: notes.trim() || undefined,
      categories: categories.filter(cat => cat.trim() !== ''),
      tags: tags.filter(tag => tag.trim() !== ''),
      creator: creator.trim() || undefined,
      image_url: imageUrl.trim() || undefined,
      user_id: user.id,
    };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const createdItem: ItemResponse = await apiService.addItem(postData);
      console.log('Item created successfully:', createdItem);
      Alert.alert('Success!', 'Item added successfully.');

      // Optionally navigate away or refresh a list
      // router.back(); or router.push('/items/' + createdItem.id);

    } catch (error) {
      console.error('Failed to add item:', error);
      if (error instanceof ApiServiceError) {
        setSubmitError(error.message);
        Alert.alert('Error Adding Item', error.message);
      } else if (error instanceof Error) {
        setSubmitError(error.message);
        Alert.alert('Error', 'An unexpected error occurred: ' + error.message);
      } else {
        setSubmitError('An unexpected error occurred.');
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
      setSourceUrl('');
      setNotes('');
      setCategories([]);
      setTags([]);
      setSuggestedCategories([]);
      setSuggestedTags([]);
      setCreator('');
      setImageUrl('');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Autofill Section */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle" style={styles.subtitle}>Autofill from Social Media</ThemedText>
        <TextInput
          style={[styles.input, styles.textInput]}
          placeholder="Paste Instagram or TikTok link hereeee"
          placeholderTextColor="#888"
          value={socialMediaLink}
          onChangeText={setSocialMediaLink}
          keyboardType="url"
          autoCapitalize="none"
        />
        {/* Using a View for Button to allow more styling if needed */}
        <View style={styles.buttonContainer}>
          <Button title="Autofill with Link" onPress={handleAutofillButtonPressed} color={Platform.OS === 'ios' ? '#007AFF' : undefined} />
        </View>
      </ThemedView>

      {/* Manual Form Entry Section */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle" style={styles.subtitle}>Or Enter Details Manually</ThemedText>

        {imageUrl && <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }} // The `source` prop takes an object with a `uri` key
            style={styles.image}
            resizeMode="contain" // Or "cover", "stretch", "center", "repeat"
            // Optional: Add a loading indicator while the image loads
            onLoadStart={() => console.log('[Image] Loading started...')}
            onLoadEnd={() => console.log('[Image] Loading finished.')}
            onError={(error) => console.error('[Image] Error loading image:', error.nativeEvent.error)}
          />
        </View>}

        <ThemedText style={styles.label}>Source URL (Optional)</ThemedText>
        <TextInput
          style={[styles.input, styles.textInput]}
          value={sourceUrl}
          onChangeText={setSourceUrl}
          placeholder="https://example.com/your-saved-post"
          placeholderTextColor="#888"
          keyboardType="url"
          autoCapitalize="none"
        />

        <ThemedText style={styles.label}>Notes (Optional)</ThemedText>
        <TextInput
          style={[styles.input, styles.textInput, styles.multilineInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any thoughts, why you saved this, key takeaways..."
          placeholderTextColor="#888"
          multiline
          numberOfLines={4}
        />

        <PillInput
          label="Categories (Optional)"
          placeholder="Type a category and press enter"
          selectedItems={categories}
          onSetSelectedItems={setCategories}
          suggestedItems={suggestedCategories}
          onSetSuggestedItems={setSuggestedCategories}
          editable={!isLoading}
        />

        <PillInput
          label="Tags (Optional)"
          placeholder="Type a tag and press enter"
          selectedItems={tags}
          onSetSelectedItems={setTags}
          suggestedItems={suggestedTags}
          onSetSuggestedItems={setSuggestedTags}
          editable={!isLoading}
        />

        <ThemedText style={styles.label}>Creator (Optional)</ThemedText>
        <TextInput
          style={[styles.input, styles.textInput]}
          value={creator}
          onChangeText={setCreator}
          placeholder="E.g., @username or Creator's Name"
          placeholderTextColor="#888"
        />

        {submitError && <View><Text style={styles.submitError}>{submitError}</Text></View>}

        <View style={[styles.buttonContainer, styles.saveButtonContainer]}>
          {isSubmitting ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Button title="Save Post" onPress={handleSubmit} />
          )}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 60,
    paddingTop: Platform.OS === 'ios' ? 60 : 10,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    // backgroundColor: '#f0f0f0', // Example background, adjust with ThemedView props or theme
    borderRadius: 8,
  },
  subtitle: {
    marginBottom: 12,
    fontSize: 18,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    // color: '#333', // ThemedText should handle this based on theme
    marginTop: 10,
  },
  input: { // Base input style
    height: 45,
    borderColor: '#ccc', // Consider using theme colors
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    marginBottom: 12,
    // color: '#000', // Text color should ideally come from theme or be adaptable
  },
  textInput: { // Specific style for TextInput to allow ThemedText for labels
    // if you use ThemedTextInput, this might not be needed
    // For now, assuming standard TextInput, so color needs to be managed
    // This will be tricky with light/dark themes without a ThemedTextInput
    // For a quick fix, you might set a general color or use Platform.select
    color: Platform.OS === 'ios' ? '#000000' : '#000000', // Placeholder, ideally theme-aware
    backgroundColor: Platform.OS === 'ios' ? '#FFFFFF' : '#FFFFFF', // Placeholder
  },
  multilineInput: {
    height: 200,
    textAlignVertical: 'top', // For Android
    paddingTop: 10,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  saveButtonContainer: {
    marginTop: 20,
  },
  submitError: {
    color: 'red',
    marginVertical: 10
  },
  imageContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 200,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
});