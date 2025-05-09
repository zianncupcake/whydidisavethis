import { Platform, StyleSheet, TextInput, Button, Alert, View } from 'react-native';
import { useState, useEffect, useRef } from 'react';

// import { Collapsible } from '@/components/Collapsible'; // No longer needed
// import { ExternalLink } from '@/components/ExternalLink'; // No longer needed
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Constants from 'expo-constants';


export default function TabTwoScreen() {
  const [socialMediaLink, setSocialMediaLink] = useState('');
  const [title, setTitle] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [categories, setCategories] = useState(''); // Handled as comma-separated string
  const [tags, setTags] = useState(''); // Handled as comma-separated string
  const [creator, setCreator] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  const BACKEND_API_URL = Constants.expoConfig?.extra?.backendEndpoint;
  const ws = useRef<WebSocket | null>(null);

  const logToConsole = (...args: any[]) => {
    console.log('[ExploreScreen WS]', ...args);
  };

  const connectWebSocket = (taskId: string) => {
    if (!BACKEND_API_URL) {
      Alert.alert('Configuration Error', 'Backend API URL is not configured.');
      setIsLoading(false);
      return;
    }

    // Construct WebSocket URL (ws:// or wss://)
    // Ensure your BACKEND_API_URL is just the base (e.g., http://localhost:8000)
    // WebSocket URLs typically replace http with ws and https with wss.
    const wsScheme = BACKEND_API_URL.startsWith('https:') ? 'wss:' : 'ws:';
    const wsUrlBase = BACKEND_API_URL.replace(/^https?:/, '');
    const webSocketUrl = `${wsScheme}${wsUrlBase}/ws/task_status/${taskId}`;

    logToConsole(`Attempting to connect to WebSocket: ${webSocketUrl}`);

    // Close any existing connection before opening a new one
    if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
      logToConsole('Closing existing WebSocket connection.');
      ws.current.close();
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
            Alert.alert('Processing Complete!', 'Content details have been fetched via WebSocket.');
            const { data, error } = message.result;
            if (data && !error) {
              setTitle(data.title || '');
              setSourceUrl(socialMediaLink);
              setNotes(data.desc || '');
              setCategories(data.diversificationLabels ? data.diversificationLabels.join(', ') : '');
              setTags(data.suggestedWords ? data.suggestedWords.join(', ') : '');
              setCreator(data.creator || '');
            } else if (data && data.error) {
              Alert.alert('Task Error', `The processing task failed: ${data.error}`);
            } else {
              Alert.alert('Task Error', 'Processing completed but result format is unexpected.');
            }
            setIsLoading(false);
            setCurrentTaskId(null);
            ws.current?.close();
          } else if (message.status === 'FAILURE' || message.status === 'FAILED') {
            Alert.alert('Processing Failed', `Task failed: ${JSON.stringify(message.result?.error || message.result)}`);
            setIsLoading(false);
            setCurrentTaskId(null);
            ws.current?.close();
          } else if (message.status === 'ERROR' || message.status === 'UNKNOWN_STATUS') {
            Alert.alert('Processing Issue', `An issue occurred: ${JSON.stringify(message.result?.error || "Unknown error")}`);
            setIsLoading(false);
            setCurrentTaskId(null);
            ws.current?.close();
          }
          // Other statuses like PENDING or STARTED might be sent by the backend
          // if you configured it to do so. Handle them if needed.
        }
      } catch (error) {
        logToConsole('Error processing WebSocket message:', error);
        Alert.alert('WebSocket Error', 'Received an invalid message from the server.');
        setIsLoading(false);
        setCurrentTaskId(null);
        ws.current?.close();
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
  };

  const handleAutofill = async () => {
    if (!socialMediaLink.trim()) {
      Alert.alert('Input Required', 'Please paste an Instagram or TikTok link to autofill.');
      return;
    }
    console.log('Attempting to autofill with link:', socialMediaLink);

    setIsLoading(true);
    setCurrentTaskId(null);

    try {
      console.log("BACKEND API URL", BACKEND_API_URL)
      const response = await fetch(`${BACKEND_API_URL}/submit_url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: socialMediaLink }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `Failed to submit URL (${response.status})`);
      }

      if (data.task_id) {
        Alert.alert('URL Submitted', `Processing started. Task ID: ${data.task_id}. Waiting for updates...`);
        setCurrentTaskId(data.task_id);
        connectWebSocket(data.task_id);
      } else {
        Alert.alert('Submission Error', data.message || 'Failed to get a task ID.');
        setIsLoading(false);
      }
    } catch (error: any) {
      logToConsole('Autofill API submission error:', error);
      Alert.alert('Submission Error', `Could not submit URL: ${error.message}`);
      setIsLoading(false);
    }

    // --- End Backend Call Placeholder ---

    // For demonstration, let's populate some fields (remove this when using actual API)
    // setTitle('Autofilled Title (Demo)');
    // if (!sourceUrl) setSourceUrl(socialMediaLink); // Keep the pasted link if sourceUrl isn't already set by user
    // setNotes('Autofilled notes from the link (Demo)');
    // setCreator('Creator from link (Demo)');
  };

  // Cleanup WebSocket on component unmount
  useEffect(() => {
    return () => {
      if (ws.current) {
        logToConsole('ExploreScreen unmounting. Closing WebSocket.');
        ws.current.close();
      }
    };
  }, []);

  const handleSubmit = () => {
    const postData = {
      title: title || null,
      source_url: sourceUrl || null,
      notes: notes || null,
      categories: categories.split(',').map(cat => cat.trim()).filter(cat => cat) || null,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag) || null,
      creator: creator || null,
    };
    console.log('Form Data:', postData);
    Alert.alert('Post Saved (Dev)', `Data: ${JSON.stringify(postData, null, 2)}`);
    // Here you would typically send postData to your backend to save it
    // After successful submission, you might want to clear the form:
    // setSocialMediaLink('');
    // setTitle('');
    // setSourceUrl('');
    // setNotes('');
    // setCategories('');
    // setTags('');
    // setCreator('');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080" // Consider making this color dynamic with theme
          name="chevron.left.forwardslash.chevron.right" // This seems like a placeholder icon, you might want a more relevant one
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Save New Post</ThemedText>
      </ThemedView>

      {/* Autofill Section */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle" style={styles.subtitle}>Autofill from Social Media</ThemedText>
        <TextInput
          style={[styles.input, styles.textInput]} // Apply base and specific styles
          placeholder="Paste Instagram or TikTok link hereeee"
          placeholderTextColor="#888"
          value={socialMediaLink}
          onChangeText={setSocialMediaLink}
          keyboardType="url"
          autoCapitalize="none"
        />
        {/* Using a View for Button to allow more styling if needed */}
        <View style={styles.buttonContainer}>
          <Button title="Autofill with Link" onPress={handleAutofill} color={Platform.OS === 'ios' ? '#007AFF' : undefined} />
        </View>
      </ThemedView>

      {/* Manual Form Entry Section */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle" style={styles.subtitle}>Or Enter Details Manually</ThemedText>

        <ThemedText style={styles.label}>Title</ThemedText>
        <TextInput
          style={[styles.input, styles.textInput]}
          value={title}
          onChangeText={setTitle}
          placeholder="E.g., Amazing Recipe Idea"
          placeholderTextColor="#888"
        />

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

        <ThemedText style={styles.label}>Categories (Optional, comma-separated)</ThemedText>
        <TextInput
          style={[styles.input, styles.textInput]}
          value={categories}
          onChangeText={setCategories}
          placeholder="E.g., recipes, travel, tech tips"
          placeholderTextColor="#888"
        />

        <ThemedText style={styles.label}>Tags (Optional, comma-separated)</ThemedText>
        <TextInput
          style={[styles.input, styles.textInput]}
          value={tags}
          onChangeText={setTags}
          placeholder="E.g., easy_cook, future_trip, must_read"
          placeholderTextColor="#888"
        />

        <ThemedText style={styles.label}>Creator (Optional)</ThemedText>
        <TextInput
          style={[styles.input, styles.textInput]}
          value={creator}
          onChangeText={setCreator}
          placeholder="E.g., @username or Creator's Name"
          placeholderTextColor="#888"
        />
        <View style={[styles.buttonContainer, styles.saveButtonContainer]}>
          <Button title="Save Post" onPress={handleSubmit} color={Platform.OS === 'ios' ? '#007AFF' : undefined} />
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    // color: '#808080', // This color is now passed directly via props for IconSymbol
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16, // Added padding for better spacing
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
    height: 100,
    textAlignVertical: 'top', // For Android
    paddingTop: 10,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  saveButtonContainer: {
    marginTop: 20,
  }
});