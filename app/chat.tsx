import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Image,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import * as ImagePicker from "expo-image-picker";
import { ApiClient } from "@/api/client";

// Get the API URL for image source URLs
const API_URL = ApiClient.getApiUrl();

export default function ChatScreen() {
  const flatListRef = React.useRef<FlatList<any>>(null);
  const router = useRouter();
  const { challenge_id, challengeId } = useLocalSearchParams<{
    challenge_id?: string;
    challengeId?: string;
  }>();
  const currentChallengeId = challenge_id || challengeId;
  // @ts-ignore - Ignoring type issues for now
  const {
    challenges,
    user,
    updateChallengeStatus,
    updateChallenge,
    markMessagesAsRead,
  } = useAuth();

  const [message, setMessage] = React.useState("");
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [lastTap, setLastTap] = React.useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const textColor = useThemeColor({}, "text");

  const challenge = React.useMemo(() => {
    const found = challenges.find(
      // @ts-ignore - Ignoring type issues for now
      (c) => String(c.id) === String(currentChallengeId),
    );
    if (!found) {
      console.log("No challenge found with ID:", currentChallengeId);
      console.log(
        "Available challenges:",
        // @ts-ignore - Ignoring type issues for now
        challenges.map((c) => c.id),
      );
    }
    return found;
  }, [challenges, currentChallengeId]);

  const isCoach = challenge
    ? String(user?.id) === String(challenge.coach_id)
    : false;
  const messages =
    challenge?.status === "pending" ? [] : (challenge?.messages ?? []);

  React.useEffect(() => {
    const loadMessages = async () => {
      try {
        if (challenge?.status !== "pending") {
          const messages = await ApiClient.getMessages(challenge_id as string);
          const processedMessages = messages.map((msg) => ({
            ...msg,
            is_read: false,
          }));
          // Preserve username and coachUsername when updating
          updateChallenge({
            ...challenge,
            messages: processedMessages || [],
            username: challenge.username,
            coachUsername: challenge.coachUsername,
          });
          // Mark received messages as read when chat is opened
          await markMessagesAsRead(challenge_id as string);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    if (challenge?.id) {
      loadMessages();
    }
  }, [challenge_id, challenge?.id, challenge?.status]);

  React.useEffect(() => {
    const keyboardWillShow = (e: any) => {
      setKeyboardHeight(e.endCoordinates.height);
    };

    const keyboardWillHide = () => {
      setKeyboardHeight(0);
    };

    const showSubscription = Keyboard.addListener(
      "keyboardWillShow",
      keyboardWillShow,
    );
    const hideSubscription = Keyboard.addListener(
      "keyboardWillHide",
      keyboardWillHide,
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Socket handling is now centralized in AuthContext

  const handleSendMessage = async () => {
    if (isSubmitting) return;
    if (!message && !selectedImage) return;

    setIsSubmitting(true);
    try {
      console.log("=== Starting send message process ===");
      
      // Prepare the base message object
      const messageData: {
        user_id: string;
        text?: string;
        imageUrl?: string;
        isProof: boolean;
      } = {
        user_id: user?.id || "",
        isProof: false,
      };

      // Add text if there is any
      if (message.trim()) {
        messageData.text = message.trim();
        console.log("Message text:", messageData.text);
      }

      // Upload image if one is selected
      if (selectedImage) {
        console.log("Selected image path:", selectedImage);
        try {
          console.log("Uploading image...");
          // Show alert to user that upload is in progress
          Alert.alert(
            "Uploading Image", 
            "Please wait while we upload your image...",
            []
          );
          
          const imageUrl = await ApiClient.uploadImage(selectedImage);
          console.log("Image upload successful, URL:", imageUrl);
          messageData.imageUrl = imageUrl;
          
          // No need to close the alert manually, it will close when the async operation completes
        } catch (error) {
          console.error("Error uploading image:", error);
          // Show an alert to the user
          Alert.alert(
            "Upload Failed", 
            "There was a problem uploading your image. Do you want to send the message without the image?",
            [
              { 
                text: "Send without image", 
                onPress: () => {}  // Continue with sending message
              },
              { 
                text: "Cancel", 
                style: "cancel", 
                onPress: () => {
                  setIsSubmitting(false);
                  return; // Early return to prevent message sending
                }
              }
            ]
          );
        }
      }

      // If we have either text or a successfully uploaded image URL, send the message
      if (messageData.text || messageData.imageUrl) {
        console.log("Sending message data:", JSON.stringify(messageData));
        
        // Send the message to the server
        const response = await ApiClient.sendMessage(currentChallengeId as string, messageData);
        console.log("Message sent, response:", response);
        
        // Clear the input fields
        setMessage("");
        setSelectedImage(null);
      } else {
        console.log("No message content to send");
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      Alert.alert(
        "Error", 
        "Failed to send message. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptChallenge = React.useCallback(async () => {
    if (isSubmitting || !challenge_id) return;
    try {
      setIsSubmitting(true);
      await ApiClient.updateChallengeStatus(challenge_id, "active");
      if (challenge) {
        await updateChallenge({
          ...challenge,
          status: "active",
          username: challenge.username,
          coachUsername: challenge.coachUsername,
        });
      }
      setTimeout(() => router.back(), 100);
    } catch (error) {
      console.error("Error accepting challenge:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [challenge_id, isSubmitting, challenge, updateChallenge, router]);

  const pickImage = async () => {
    try {
      console.log("Opening image picker");
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      console.log("Image picker result:", result);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        console.log("Selected image URI:", selectedUri);
        setSelectedImage(selectedUri);
      } else {
        console.log("Image selection canceled or no assets");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        "Error",
        "Could not select image. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleDoubleTap = async (message: any) => {
    const now = Date.now();
    if (lastTap && now - lastTap < 300) {
      try {
        if (isCoach && message.isProof && message.user_id !== user?.id) {
          await ApiClient.validateMessage(message.id, !message.isValidated);
          const updatedMessages = challenge.messages.map((msg) => {
            if (msg.id === message.id) {
              return { ...msg, isValidated: !msg.isValidated };
            }
            return msg;
          });
          await updateChallenge({
            ...challenge,
            messages: updatedMessages,
            username: challenge.username,
            coachUsername: challenge.coachUsername,
          });
        } else if (!isCoach && message.user_id === user?.id) {
          await ApiClient.setMessageAsProof(message.id, !message.isProof);
          const updatedMessages = challenge.messages.map((msg) => {
            if (msg.id === message.id) {
              return { ...msg, isProof: !message.isProof };
            }
            return msg;
          });
          await updateChallenge({
            ...challenge,
            messages: updatedMessages,
            username: challenge.username,
            coachUsername: challenge.coachUsername,
          });
        }
      } catch (error) {
        console.error("Error updating message:", error);
      }
    }
    setLastTap(now);
  };

  if (!challenge) {
    return (
      <ThemedView style={styles.chatContainer}>
        <ThemedText>Challenge not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.chatContainer}>
      <View
        style={[
          styles.chatHeader,
          { backgroundColor: isCoach ? "#2B5876" : "#B71C1C" },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
        <View style={styles.chatHeaderContent}>
          <ThemedText style={styles.chatTitle}>{challenge.title}</ThemedText>
          {challenge.status === "pending" && isCoach && (
            <View style={styles.chatActionButtons}>
              <TouchableOpacity
                style={[styles.chatActionButton, styles.chatAcceptButton]}
                onPress={handleAcceptChallenge}
              >
                <ThemedText style={styles.chatButtonText}>Accept</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chatActionButton, styles.chatRejectButton]}
                onPress={() => updateChallengeStatus(challenge.id, "rejected")}
              >
                <ThemedText style={styles.chatButtonText}>Reject</ThemedText>
              </TouchableOpacity>
            </View>
          )}
          <ThemedText style={styles.chatSubtitle}>
            {isCoach
              ? `Challenger: ${challenge.username || "User " + challenge.user_id}`
              : `Coach: ${challenge.coachUsername || "User " + challenge.coach_id}`}
          </ThemedText>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        style={styles.messageList}
        data={messages}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const suggestionText =
            isCoach && item.isProof && !item.isValidated
              ? "Double tap to approve proof"
              : !isCoach && item.user_id === user?.id
                ? "Double tap to submit as proof"
                : "";
          return (
            <TouchableOpacity onPress={() => handleDoubleTap(item)}>
              <View
                style={[
                  styles.messageBubble,
                  item.user_id === user?.id
                    ? [
                        styles.ownMessage,
                        { backgroundColor: isCoach ? "#2B5876" : "#B71C1C" },
                      ]
                    : styles.otherMessage,
                ]}
              >
                {item.text && (
                  <ThemedText style={styles.messageText}>
                    {item.text}
                  </ThemedText>
                )}
                
                {/* Display image if present (either new uploaded image or existing image) */}
                {(item.imageUrl || item.image) && (() => {
                  // Debug logging
                  console.log("Image in message:", { 
                    hasImageUrl: !!item.imageUrl, 
                    imageUrl: item.imageUrl, 
                    hasImage: !!item.image, 
                    image: item.image
                  });
                  
                  // Construct the full image URL
                  let imageUri = '';
                  
                  if (item.imageUrl) {
                    // Make sure the URL starts with the API URL if it's a relative path
                    if (item.imageUrl.startsWith('http')) {
                      imageUri = item.imageUrl;
                    } else {
                      // Ensure we have a clean path without double slashes
                      const apiUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
                      const imgPath = item.imageUrl.startsWith('/') ? item.imageUrl : `/${item.imageUrl}`;
                      imageUri = `${apiUrl}${imgPath}`;
                    }
                    console.log("Using server image URL:", imageUri);
                  } else if (item.image) {
                    // Handle local images from the image picker
                    imageUri = item.image;
                    console.log("Using local image URL:", imageUri);
                  }
                  
                  return imageUri ? (
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.messageImage}
                        resizeMode="contain"
                        // Add loading indicator and error handling
                        loadingIndicatorSource={{ uri: 'https://via.placeholder.com/150' }}
                        onError={(e) => console.error("Image load error:", e.nativeEvent.error, "URL:", imageUri)}
                      />
                    </View>
                  ) : null;
                })()}
                
                <ThemedText style={styles.messageTime}>
                  {new Date(item.timestamp).toLocaleTimeString()}
                </ThemedText>
                
                {(item.isValidated || item.isProof) && (
                  <View style={styles.checkmarkContainer}>
                    <IconSymbol
                      name={
                        item.isValidated
                          ? "checkmark.circle.fill"
                          : "magnifyingglass.circle.fill"
                      }
                      size={24}
                      color={item.isValidated ? "#2196F3" : "#4CAF50"}
                    />
                  </View>
                )}
              </View>
              {suggestionText && (
                <ThemedText
                  style={[
                    styles.suggestionText,
                    item.user_id === user?.id
                      ? { alignSelf: "flex-end", marginRight: 8 }
                      : { alignSelf: "flex-start", marginLeft: 8 },
                  ]}
                >
                  {suggestionText}
                </ThemedText>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {challenge.status === "active" ? (
        <View style={[styles.inputContainer, { marginBottom: keyboardHeight }]}>
          {/* Image preview */}
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image 
                source={{ uri: selectedImage }} 
                style={styles.imagePreview} 
              />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <ThemedText style={styles.removeImageText}>×</ThemedText>
              </TouchableOpacity>
            </View>
          )}
          
          <TextInput
            style={styles.chatInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor="#666"
            multiline
          />
          <TouchableOpacity style={styles.attachButton} onPress={pickImage}>
            <IconSymbol name="paperclip" size={24} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: isCoach ? "#2B5876" : "#B71C1C" },
              (!message && !selectedImage) || isSubmitting ? styles.disabledButton : null
            ]}
            onPress={handleSendMessage}
            disabled={(!message && !selectedImage) || isSubmitting}
          >
            <ThemedText style={styles.chatSendButtonText}>Send</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.inputContainer, styles.disabledInput]}>
          <TextInput
            style={[styles.chatInput, styles.disabledTextInput]}
            value="Chat available after challenge is accepted"
            editable={false}
          />
          <TouchableOpacity
            style={[styles.sendButton, styles.disabledButton]}
            disabled
          >
            <ThemedText
              style={[styles.chatSendButtonText, styles.disabledButtonText]}
            >
              Send
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

import { GlobalStyles } from "@/constants/Styles";
const styles = {
  ...GlobalStyles,
  imagePreviewContainer: {
    position: 'relative' as const,
    marginRight: 10,
    marginBottom: 8,
    width: 60,
    height: 60,
    borderRadius: 5,
    overflow: 'hidden' as const,
  },
  imagePreview: {
    width: '100%' as const,
    height: '100%' as const,
  },
  removeImageButton: {
    position: 'absolute' as const,
    top: -5,
    right: -5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  removeImageText: {
    color: 'white',
    fontSize: 12,
  },
  imageContainer: {
    marginVertical: 5,
    borderRadius: 10, 
    overflow: 'hidden' as const,
    alignItems: 'center' as const,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
};
