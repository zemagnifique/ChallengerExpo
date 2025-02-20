import { useState, useCallback, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, View, Platform, Picker } from 'react-native';
import { ApiClient } from '@/api/client';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

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
  }
];

export default function CreateChallengeScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000));
  const [frequency, setFrequency] = useState('Daily');
  const [proofRequirements, setProofRequirements] = useState('');
  const [selectedCoach, setSelectedCoach] = useState<number | null>(null);
  const [users, setUsers] = useState([]);
  const [coachSearch, setCoachSearch] = useState('');
  const router = useRouter();
  const { user, addChallenge } = useAuth();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await ApiClient.getAllUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error loading users:', error);
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
        status: 'pending',
        userId: parseInt(user?.id),
        coachId: selectedCoach,
        createdAt: new Date(),
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
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}>
      <ScrollView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Create Challenge</ThemedText>

        <ThemedView style={styles.defaultChallenges}>
          <ThemedText type="subtitle">Quick Start Challenges</ThemedText>
          {DEFAULT_CHALLENGES.map((challenge, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.challengeCard}
              onPress={() => selectDefaultChallenge(challenge)}>
              <ThemedText style={styles.cardTitle}>{challenge.title}</ThemedText>
              <ThemedText>{challenge.description}</ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>

        <ThemedView style={styles.form}>
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
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={startDate.toISOString().split('T')[0]}
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
              }}>
              <ThemedText>{startDate.toLocaleDateString()}</ThemedText>
            </TouchableOpacity>
          )}

          <ThemedText>End Date: {endDate.toLocaleDateString()}</ThemedText>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={endDate.toISOString().split('T')[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              style={styles.webDateInput}
            />
          ) : (
            <TouchableOpacity 
              style={styles.input}
              onPress={() => {
                const currentDate = endDate || new Date();
                setEndDate(currentDate);
              }}>
              <ThemedText>{endDate.toLocaleDateString()}</ThemedText>
            </TouchableOpacity>
          )}

          <ThemedText>Frequency</ThemedText>
          <View style={styles.frequencyContainer}>
            {['Daily', 'Weekly'].map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.frequencyButton,
                  frequency === freq && styles.frequencyButtonActive
                ]}
                onPress={() => setFrequency(freq)}>
                <ThemedText style={frequency === freq && styles.frequencyTextActive}>
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
          {Platform.OS === 'web' ? (
            <select
              style={styles.webSelect}
              value={selectedCoach || ''}
              onChange={(e) => setSelectedCoach(parseInt(e.target.value))}
            >
              <option value="">Select a coach</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  @{user.username}
                </option>
              ))}
            </select>
          ) : (
            <View style={styles.coachSelectContainer}>
              <Picker
                selectedValue={selectedCoach}
                onValueChange={(itemValue) => setSelectedCoach(parseInt(itemValue))}
                style={styles.picker}>
                <Picker.Item label="Select a coach" value="" />
                {users.map(user => (
                  <Picker.Item 
                    key={user.id} 
                    label={`@${user.username}`} 
                    value={user.id} 
                  />
                ))}
              </Picker>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.button, (!title || !selectedCoach) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!title || !selectedCoach}>
            <ThemedText style={styles.buttonText}>Create Challenge</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  coachSelectContainer: {
    position: 'relative',
    zIndex: 999,
    elevation: 999,
  },
  coachInput: {
    marginBottom: 0,
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    maxHeight: 200,
    overflow: 'scroll',
    zIndex: 1000,
    elevation: 1000,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  picker: {
    height: 50,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  defaultChallenges: {
    padding: 20,
    gap: 10,
  },
  challengeCard: {
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginTop: 10,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  form: {
    padding: 20,
    paddingBottom: 100,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  frequencyButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    flex: 1,
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  frequencyTextActive: {
    color: '#fff',
  },
  coachContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  coachButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    minWidth: 100,
    alignItems: 'center',
  },
  coachButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  coachTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webDateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    width: '100%',
  },
  webSelect: {
    width: '100%',
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginBottom: 16,
    appearance: 'auto'
  },
});