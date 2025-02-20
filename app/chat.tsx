import React, { useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

type Challenge = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  frequency: string;
  proofRequirements: string;
  status: string;
  userId: string;
  coachId: string;
  createdAt: Date;
  messages?: Array<{
    text: string;
    userId: string;
    timestamp: Date;
    image?: string;
    isValidated?: boolean;
    isProof?: boolean; // Added isProof property
    isSystem?: boolean; // Added isSystem property
  }>;
};

export default function ChatScreen() {
  const flatListRef = React.useRef(null);
  const { challengeId } = useLocalSearchParams();
  const { challenges, user, updateChallengeStatus, updateChallenge } =
    useAuth();
  const router = useRouter();
  const [message, setMessage] = React.useState("");
  const [localStatus, setLocalStatus] = React.useState("");
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [lastTap, setLastTap] = useState(null); // Added state for double tap detection
  const challenge = challenges.find((c) => c.id === challengeId);

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

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = {
      text: message,
      userId: user?.id || "",
      timestamp: new Date(),
      image: selectedImage,
      isValidated: false, // Initially not validated
      isProof: false, // Initially not marked as proof
    };

    const updatedChallenge = {
      ...challenge,
      messages: [...(challenge.messages || []), newMessage],
    };

    await updateChallenge(updatedChallenge);
    setMessage("");
    setSelectedImage(null);

    // Show suggestion tooltip based on user role
    const updatedMessages = [...updatedChallenge.messages];
    const lastMessage = updatedMessages[updatedMessages.length - 1];

    if (!isCoach && !newMessage.isProof) {
      lastMessage.suggestionText = "Double tap to submit as proof";
    } else if (isCoach && lastMessage.isProof && !lastMessage.isValidated) {
      lastMessage.suggestionText = "Double tap to approve proof";
    }

    updateChallenge({
      ...updatedChallenge,
      messages: updatedMessages,
    });
  };

  // Poll for new messages every 2 seconds
  React.useEffect(() => {
    let isSubscribed = true;
    const interval = setInterval(async () => {
      if (!isSubscribed) return;

      const storedChallenges = await AsyncStorage.getItem("challenges");
      if (storedChallenges) {
        const parsedChallenges = JSON.parse(storedChallenges);
        const updatedChallenge = parsedChallenges.find(
          (c: Challenge) => c.id === challengeId,
        );
        if (
          updatedChallenge &&
          JSON.stringify(updatedChallenge.messages) !==
            JSON.stringify(challenge?.messages)
        ) {
          updateChallenge(updatedChallenge);
        }
      }
    }, 2000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [challengeId]);

  const handleAcceptChallenge = async () => {
    try {
      await updateChallengeStatus(challengeId as string, "active");
      setLocalStatus("active");
      router.back();
    } catch (error) {
      console.error("Error accepting challenge:", error);
    }
  };

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
        userId: user?.id || "",
        timestamp: new Date(),
        image: result.assets[0].uri,
        isValidated: false, // Initially not validated
        isProof: false, // Initially not marked as proof
      };

      const updatedChallenge = {
        ...challenge,
        messages: [...(challenge.messages || []), newMessage],
      };

      await updateChallenge(updatedChallenge);
    }
  };

  const handleLongPress = async (message: any) => {
    if (!isCoach || message.userId === user?.id || !message.isProof) return;

    const updatedMessages = challenge.messages.map((msg) => {
      if (
        msg.timestamp === message.timestamp &&
        msg.userId === message.userId
      ) {
        return { ...msg, isValidated: !msg.isValidated, isProof: true };
      }
      return msg;
    });
    const updatedChallenge = { ...challenge, messages: updatedMessages };
    await updateChallenge(updatedChallenge);
  };

  const handleDoubleTap = async (message: any) => {
    const now = Date.now();
    if (lastTap && now - lastTap < 300) {
      if (isCoach && message.isProof && message.userId !== user?.id) {
        // Coach validating a proof
        const updatedMessages = challenge.messages.map((msg) => {
          if (
            msg.timestamp === message.timestamp &&
            msg.userId === message.userId
          ) {
            return { ...msg, isValidated: !msg.isValidated };
          }
          return msg;
        });
        const updatedChallenge = { ...challenge, messages: updatedMessages };
        await updateChallenge(updatedChallenge);
      } else if (!isCoach && message.userId === user?.id) {
        // Challenger marking their message as proof
        const updatedMessages = challenge.messages.map((msg) => {
          if (
            msg.timestamp === message.timestamp &&
            msg.userId === message.userId
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

  const messages = challenge?.messages ?? [];
  const isCoach = challenge.coachId === user?.id;

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.header,
          {
            backgroundColor:
              challenge?.coachId === user?.id ? "#2B5876" : "#B71C1C",
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol
            name="chevron.left"
            size={24}
            color={useThemeColor({}, "text")}
          />
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
              ? `Challenger: ${challenge.userId}`
              : `Coach: ${challenge.coachId}`}
          </ThemedText>
        </View>

        {challenge.status === "pending" && !isCoach && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.changeCoachButton]}
              onPress={() => handleChangeCoach(challenge.id, "newCoachId")}
            >
              <ThemedText style={styles.buttonText}>Change Coach</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => deleteChallenge(challenge.id)}
            >
              <ThemedText style={styles.buttonText}>Delete</ThemedText>
            </TouchableOpacity>
          </View>
        )}
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
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => {
              isCoach && handleLongPress(item);
            }}
            onPressIn={() => {
              const now = Date.now();
              const DOUBLE_PRESS_DELAY = 300;
              if (lastTap && now - lastTap < DOUBLE_PRESS_DELAY) {
                handleDoubleTap(item);
              } else {
                setLastTap(now);
              }
            }}
            delayLongPress={200}
          >
            <View
              style={[
                styles.messageBubble,
                item.userId === user?.id
                  ? [
                      styles.ownMessage,
                      {
                        backgroundColor:
                          item.userId === challenge?.coachId
                            ? "#2B5876"
                            : "#B71C1C",
                      },
                    ]
                  : styles.otherMessage,
              ]}
            >
              {item.text && (
                <ThemedText style={styles.messageText}>{item.text}</ThemedText>
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
            {((isCoach && item.isProof && !item.isValidated) ||
              (!isCoach &&
                messages[messages.length - 1].timestamp === item.timestamp)) &&
              item.suggestionText && (
                <ThemedText
                  style={[
                    styles.suggestionText,
                    isCoach
                      ? { alignSelf: "flex-start", marginLeft: 8 }
                      : { alignSelf: "flex-end", marginRight: 8 },
                  ]}
                >
                  {item.suggestionText}
                </ThemedText>
              )}
          </TouchableOpacity>
        )}
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
            <IconSymbol
              name="paperclip"
              size={24}
              color={useThemeColor({}, "text")}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  challenge?.coachId === user?.id ? "#2B5876" : "#B71C1C",
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
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  actionContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingTop: 16,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
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
  changeCoachButton: {
    backgroundColor: "#2196F3",
  },
  deleteButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
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
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 8,
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
  sendButton: {
    padding: 12,
    borderRadius: 20,
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  attachButton: {
    padding: 8,
    justifyContent: "center",
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
  imagePreview: {
    position: "relative",
    margin: 8,
    marginTop: 0,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImage: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 12,
  },
});
