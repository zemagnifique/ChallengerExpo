import React from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import * as ImagePicker from "expo-image-picker";
import { ApiClient } from "@/api/client";

export default function ChatScreen() {
  const flatListRef = React.useRef<FlatList<any>>(null);
  const router = useRouter();
  const { challenge_id, challengeId } = useLocalSearchParams<{
    challenge_id?: string;
    challengeId?: string;
  }>();
  const currentChallengeId = challenge_id || challengeId;
  const {
    challenges,
    user,
    updateChallengeStatus,
    updateChallenge,
    markMessagesAsRead,
  } = useAuth();

  const [message, setMessage] = React.useState("");
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [lastTap, setLastTap] = React.useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const textColor = useThemeColor({}, "text");

  const challenge = React.useMemo(() => {
    const found = challenges.find(
      (c) => String(c.id) === String(currentChallengeId),
    );
    if (!found) {
      console.log("No challenge found with ID:", currentChallengeId);
      console.log(
        "Available challenges:",
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
          updateChallenge({ ...challenge, messages: processedMessages || [] });
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
    if (!message.trim() && !selectedImage) return;
    try {
      const newMessage = await ApiClient.sendMessage(challenge_id as string, {
        user_id: user?.id || "",
        text: message.trim(),
        imageUrl: selectedImage,
        isProof: false,
      });
      const messages = await ApiClient.getMessages(challenge_id as string);
      if (challenge) {
        updateChallenge({ ...challenge, messages });
      }
      setMessage("");
      setSelectedImage(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleAcceptChallenge = React.useCallback(async () => {
    if (isSubmitting || !challenge_id) return;
    try {
      setIsSubmitting(true);
      await ApiClient.updateChallengeStatus(challenge_id, "active");
      if (challenge) {
        await updateChallenge({ ...challenge, status: "active" });
      }
      setTimeout(() => router.back(), 100);
    } catch (error) {
      console.error("Error accepting challenge:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [challenge_id, isSubmitting, challenge, updateChallenge, router]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.cancelled && !result.canceled) {
      const newMessage = {
        text: "",
        user_id: user?.id || "",
        timestamp: new Date(),
        image: result.assets[0].uri,
        isValidated: false,
        isProof: false,
      };
      if (challenge) {
        const updatedChallenge = {
          ...challenge,
          messages: [...(challenge.messages || []), newMessage],
        };
        await updateChallenge(updatedChallenge);
      }
    }
  };

  const handleDoubleTap = async (message: any) => {
    const now = Date.now();
    if (lastTap && now - lastTap < 300) {
      if (isCoach && message.isProof && message.user_id !== user?.id) {
        const updatedMessages = challenge.messages.map((msg) => {
          if (
            msg.timestamp === message.timestamp &&
            msg.user_id === message.user_id
          ) {
            return { ...msg, isValidated: !msg.isValidated };
          }
          return msg;
        });
        await updateChallenge({ ...challenge, messages: updatedMessages });
      } else if (!isCoach && message.user_id === user?.id) {
        const updatedMessages = challenge.messages.map((msg) => {
          if (
            msg.timestamp === message.timestamp &&
            msg.user_id === message.user_id
          ) {
            return { ...msg, isProof: !msg.isProof };
          }
          return msg;
        });
        await updateChallenge({ ...challenge, messages: updatedMessages });
      }
    }
    setLastTap(now);
  };

  if (!challenge) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Challenge not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          { backgroundColor: isCoach ? "#2B5876" : "#B71C1C" },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <ThemedText style={styles.title}>{challenge.title}</ThemedText>
          {challenge.status === "pending" && isCoach && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={handleAcceptChallenge}
              >
                <ThemedText style={styles.buttonText}>Accept</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => updateChallengeStatus(challenge.id, "rejected")}
              >
                <ThemedText style={styles.buttonText}>Reject</ThemedText>
              </TouchableOpacity>
            </View>
          )}
          <ThemedText style={styles.subtitle}>
            {isCoach
              ? `Challenger: User ${challenge.user_id}`
              : `Coach: User ${challenge.coach_id}`}
          </ThemedText>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        style={styles.messageList}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
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
                {item.image && (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.messageImage}
                    resizeMode="contain"
                  />
                )}
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
          <TextInput
            style={styles.input}
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
            ]}
            onPress={handleSendMessage}
          >
            <ThemedText style={styles.sendButtonText}>Send</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.inputContainer, styles.disabledInput]}>
          <TextInput
            style={[styles.input, styles.disabledTextInput]}
            value="Chat available after challenge is accepted"
            editable={false}
          />
          <TouchableOpacity
            style={[styles.sendButton, styles.disabledButton]}
            disabled
          >
            <ThemedText
              style={[styles.sendButtonText, styles.disabledButtonText]}
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
const styles = GlobalStyles;
