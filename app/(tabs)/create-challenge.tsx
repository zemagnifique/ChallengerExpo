import { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  View,
  Platform,
  ActionSheetIOS,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ApiClient } from "@/api/client";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { GlobalStyles } from "@/constants/Styles";
import { Colors } from "@/constants/Colors";

const DEFAULT_CHALLENGES = [
  {
    title: "Daily Exercise",
    description: "30 minutes of exercise every day",
    frequency: "Daily",
    proofRequirements: "Photo or screenshot of workout completion",
  },
  {
    title: "Reading Challenge",
    description: "Read for 20 minutes",
    frequency: "Daily",
    proofRequirements: "Photo of book and progress",
  },
  {
    title: "Weekly Meditation",
    description: "1 hour of meditation",
    frequency: "Weekly",
    proofRequirements: "Screenshot of meditation app completion",
  },
];

export default function CreateChallengeScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
  );
  const [frequency, setFrequency] = useState("Daily");
  const [proofRequirements, setProofRequirements] = useState("");
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null);
  const [users, setUsers] = useState([]);
  const [coachSearch, setCoachSearch] = useState("");
  const router = useRouter();
  const { user, addChallenge } = useAuth();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await ApiClient.getAllUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };
    loadUsers();
  }, []);

  const handleSubmit = async () => {
    try {
      const challenge = {
        title,
        description,
        startDate,
        endDate,
        frequency,
        proofRequirements,
        user_id: user?.id?.toString() || "",
        coachId: selectedCoach?.toString() || "",
      };
      addChallenge(challenge);
      router.back();
    } catch (error) {
      console.error("Error submitting challenge:", error);
      // Handle error appropriately, e.g., display an error message to the user.
    }
  };

  const selectDefaultChallenge = (challenge) => {
    setTitle(challenge.title);
    setDescription(challenge.description);
    setFrequency(challenge.frequency);
    setProofRequirements(challenge.proofRequirements);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    >
      <ThemedView style={styles.globalHeader}>
        <ThemedText style={styles.headerTitle}>Create Challenge</ThemedText>
      </ThemedView>
      <ScrollView style={styles.container}>
        <ThemedView style={styles.quickStartSection}>
          <ThemedText style={styles.quickStartTitle}>
            Quick Start Challenges
          </ThemedText>
          <View style={styles.challengeGrid}>
            {DEFAULT_CHALLENGES.map((challenge, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.challengeCard,
                  styles[`challengeType${index + 1}`],
                  { flex: 1 },
                ]}
                onPress={() => selectDefaultChallenge(challenge)}
              >
                <ThemedText style={styles.cardTitle}>
                  {challenge.title}
                </ThemedText>
                <ThemedText style={styles.cardDescription}>
                  {challenge.description}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>
        <View style={styles.formSeparator} />

        <ThemedView style={[styles.section, styles.form]}>
          <ThemedText style={styles.headerTitle}>
            Create New Challenge
          </ThemedText>
          <ThemedText>Challenge Title *</ThemedText>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter challenge title"
            placeholderTextColor="#666"
          />

          <ThemedText>Description (Optional)</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your challenge"
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
          />

          <ThemedText>Start Date: {startDate.toLocaleDateString()}</ThemedText>
          {Platform.OS === "web" ? (
            <input
              type="date"
              value={startDate.toISOString().split("T")[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              style={styles.webDateInput}
            />
          ) : (
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                const currentDate = startDate || new Date();
                const tempDate = new Date(currentDate);
                tempDate.setDate(tempDate.getDate() + 180);
                setEndDate(tempDate);
              }}
            >
              <ThemedText>{startDate.toLocaleDateString()}</ThemedText>
            </TouchableOpacity>
          )}

          <ThemedText>End Date: {endDate.toLocaleDateString()}</ThemedText>
          {Platform.OS === "web" ? (
            <input
              type="date"
              value={endDate.toISOString().split("T")[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              style={styles.webDateInput}
            />
          ) : (
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                const currentDate = endDate || new Date();
                setEndDate(currentDate);
              }}
            >
              <ThemedText>{endDate.toLocaleDateString()}</ThemedText>
            </TouchableOpacity>
          )}

          <ThemedText>Frequency</ThemedText>
          <View style={styles.frequencyContainer}>
            {["Daily", "Weekly"].map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.frequencyButton,
                  frequency === freq && styles.frequencyButtonActive,
                ]}
                onPress={() => setFrequency(freq)}
              >
                <ThemedText
                  style={frequency === freq && styles.frequencyTextActive}
                >
                  {freq}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <ThemedText>Proof Requirements</ThemedText>
          <TextInput
            style={styles.input}
            value={proofRequirements}
            onChangeText={setProofRequirements}
            placeholder="How will you verify completion?"
            placeholderTextColor="#666"
          />

          <ThemedText>Assign Coach</ThemedText>
          {Platform.OS === "web" ? (
            <select
              style={styles.webSelect}
              value={selectedCoach || ""}
              onChange={(e) => setSelectedCoach(e.target.value)}
            >
              <option value="">Select a coach</option>
              {users
                .filter((u) => u.id !== user?.id)
                .map((otherUser) => (
                  <option key={otherUser.id} value={otherUser.id.toString()}>
                    {otherUser.username}
                  </option>
                ))}
            </select>
          ) : (
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => {
                if (Platform.OS === "ios") {
                  ActionSheetIOS.showActionSheetWithOptions(
                    {
                      options: [
                        "Cancel",
                        ...users
                          .filter((u) => u.id !== user?.id)
                          .map((u) => u.username),
                      ],
                      cancelButtonIndex: 0,
                      title: "Select a Coach",
                    },
                    (buttonIndex) => {
                      if (buttonIndex !== 0) {
                        const selectedUser = users.filter(
                          (u) => u.id !== user?.id,
                        )[buttonIndex - 1];
                        setSelectedCoach(selectedUser.id.toString());
                      }
                    },
                  );
                } else {
                  // Fallback to default Picker for other platforms
                  <Picker
                    selectedValue={selectedCoach}
                    onValueChange={(itemValue) => setSelectedCoach(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select a coach" value="" />
                    {users
                      .filter((u) => u.id !== user?.id)
                      .map((otherUser) => (
                        <Picker.Item
                          key={otherUser.id}
                          label={otherUser.username}
                          value={otherUser.id.toString()}
                        />
                      ))}
                  </Picker>;
                }
              }}
            >
              <View style={styles.pickerContainer}>
                <ThemedText style={styles.pickerText}>
                  {selectedCoach
                    ? users.find((u) => u.id.toString() === selectedCoach)
                        ?.username
                    : "Select a Coach"}
                </ThemedText>
                <IconSymbol name="chevron.right" size={20} color="#999" />
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              (!title || !selectedCoach) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!title || !selectedCoach}
          >
            <ThemedText style={styles.buttonText}>Create Challenge</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  ...GlobalStyles,
  quickStartSection: {
    padding: 20,
    marginBottom: 20,
  },
  quickStartTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  challengeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  challengeCard: {
    padding: 16,
    borderRadius: 12,
    minHeight: 120,
    width: "48%",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  challengeType1: {
    backgroundColor: "#FFE5E5", // Pastel red
  },
  challengeType2: {
    backgroundColor: "#E5FFE5", // Pastel green
  },
  challengeType3: {
    backgroundColor: "#E5E5FF", // Pastel blue
  },
  challengeType4: {
    backgroundColor: "#FFE5FF", // Pastel purple
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#333",
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
  },
  formSeparator: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginVertical: 10,
  },
  coachSelectContainer: {
    position: "relative",
    zIndex: 999,
    elevation: 999,
  },
  coachInput: {
    marginBottom: 0,
  },
  dropdownContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    maxHeight: 200,
    overflow: "scroll",
    zIndex: 1000,
    elevation: 1000,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  pickerButton: {
    marginBottom: 16,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    height: 48,
  },
  pickerText: {
    fontSize: 16,
    color: "#000",
  },
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  defaultChallenges: {
    padding: 20,
    gap: 10,
  },
  challengeCard: {
    padding: 15,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    marginTop: 10,
  },
  form: {
    padding: 20,
    paddingBottom: 100,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  frequencyContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  frequencyButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    flex: 1,
    alignItems: "center",
  },
  frequencyButtonActive: {
    backgroundColor: "#F44336",
    borderColor: "#F44336",
  },
  frequencyTextActive: {
    color: "#fff",
  },
  coachContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  coachButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    minWidth: 100,
    alignItems: "center",
  },
  coachTextActive: {
    color: "#fff",
  },
  button: {
    backgroundColor: "#F44336",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  webDateInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    width: "100%",
  },
  webSelect: {
    width: "100%",
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    marginBottom: 16,
    appearance: "auto",
  },
});
