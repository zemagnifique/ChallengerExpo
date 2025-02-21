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
import { io } from "socket.io-client";

export default function ChatScreen() {
  const flatListRef = React.useRef<FlatList<any>>(null);
  const router = useRouter();
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const { challenges, user, updateChallengeStatus, updateChallenge } =
    useAuth();

  const [message, setMessage] = React.useState("");
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [lastTap, setLastTap] = React.useState(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [socketConnected, setSocketConnected] = React.useState(false);

  const challenge = React.useMemo(
    () => challenges.find((c) => c.id === challengeId),
    [challenges, challengeId],
  );
  const isCoach = challenge ? parseInt(user?.id) === challenge.coach_id : false;
  const messages =
    challenge?.status === "pending" ? [] : (challenge?.messages ?? []);

  const { markMessagesAsRead } = useAuth();

  React.useEffect(() => {
    const loadMessages = async () => {
      try {
        if (challenge?.status !== "pending") {
          const messages = await ApiClient.getMessages(challengeId as string);
          const processedMessages = messages.map((msg) => ({
            ...msg,
            read: msg.user_id === user?.id, // Only mark own messages as read initially
          }));
          updateChallenge({
            ...challenge,
            messages: processedMessages || [],
          });
          // Mark received messages as read when chat is opened
          await markMessagesAsRead(challengeId as string);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    if (challenge?.id) {
      loadMessages();
    }
  }, [challengeId, challenge?.id, challenge?.status]);

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

  React.useEffect(() => {
    if (!challengeId || !challenge) return;

    const socket = io(ApiClient.getApiUrl(), {
      transports: ['websocket'],
      reconnection: true
    });

    socket.on('connect', () => {
      console.log('Connected to chat socket');
      socket.emit("joinRoom", challengeId);
    });
    
    socket.on("newMessage", (message) => {
      console.log('Received message:', message);
      if (message && message.challenge_id === challengeId) {
        const newMessage = {
          id: message.id,
          text: message.text,
          user_id: message.user_id,
          imageUrl: message.image_url,
          isProof: message.is_proof,
          isValidated: message.is_validated,
          read: message.user_id === user?.id,
          timestamp: new Date(message.created_at)
        };
        
        if (challenge) {
          updateChallenge({
            ...challenge,
            messages: [...(challenge.messages || []), newMessage]
          });
        }
      }
    });

    return () => {
      socket.emit("leaveRoom", challengeId);
      socket.disconnect();
    };
  }, [challengeId, challenge?.id]);

  const handleSendMessage = async () => {
    if (!message.trim() && !selectedImage) return;

    try {
      const newMessage = await ApiClient.sendMessage(challengeId as string, {
        user_id: user?.id || "",
        text: message.trim(),
        imageUrl: selectedImage,
        isProof: false,
      });

      const messages = await ApiClient.getMessages(challengeId as string);
      if (challenge) {
        updateChallenge({
          ...challenge,
          messages,
        });
      }

      setMessage("");
      setSelectedImage(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleAcceptChallenge = React.useCallback(async () => {
    if (isSubmitting || !challengeId) return;
    try {
      setIsSubmitting(true);
      await ApiClient.updateChallengeStatus(challengeId, "active");
      if (challenge) {
        await updateChallenge({ ...challenge, status: "active" });
      }
      setTimeout(() => {
        router.back();
      }, 100);
    } catch (error) {
      console.error("Error accepting challenge:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [challengeId, isSubmitting, challenge, updateChallenge, router]);

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
        const updatedChallenge = { ...challenge, messages: updatedMessages };
        await updateChallenge(updatedChallenge);
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
        const updatedChallenge = { ...challenge, messages: updatedMessages };
        await updateChallenge(updatedChallenge);
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
  const textColor = useThemeColor({}, "text");

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: isCoach ? "#2B5876" : "#B71C1C",
          },
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
                        {
                          backgroundColor: isCoach ? "#2B5876" : "#B71C1C",
                        },
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
              {
                backgroundColor: isCoach ? "#2B5876" : "#B71C1C",
              },
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerContent: {
    marginLeft: 40,
    marginTop: -30,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 8,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  messageList: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: "80%",
  },
  ownMessage: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: "#1C1C1E",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  messageTime: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginRight: 8,
  },
  attachButton: {
    padding: 8,
    justifyContent: "center",
  },
  sendButton: {
    padding: 12,
    borderRadius: 20,
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginVertical: 8,
    alignSelf: "center",
  },
  checkmarkContainer: {
    marginTop: 4,
    alignSelf: "flex-end",
  },
  suggestionText: {
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
    marginBottom: 16,
    fontStyle: "italic",
  },
  disabledInput: {
    opacity: 0.7,
    backgroundColor: "#f5f5f5",
  },
  disabledTextInput: {
    color: "#666",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  disabledButtonText: {
    color: "#666",
  },
});
