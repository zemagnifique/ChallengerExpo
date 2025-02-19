
import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, ScrollView, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  const [endDate, setEndDate] = useState(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)); // 6 months
  const [frequency, setFrequency] = useState('Daily');
  const [proofRequirements, setProofRequirements] = useState('');
  const router = useRouter();

  const handleSubmit = () => {
    console.log({ title, description, startDate, endDate, frequency, proofRequirements });
    router.back();
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

          <ThemedText>Start Date</ThemedText>
          <DateTimePicker
            value={startDate}
            onChange={(event, date) => date && setStartDate(date)}
            mode="date"
          />

          <ThemedText>End Date</ThemedText>
          <DateTimePicker
            value={endDate}
            onChange={(event, date) => date && setEndDate(date)}
            mode="date"
          />

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

          <TouchableOpacity 
            style={[styles.button, !title && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!title}>
            <ThemedText style={styles.buttonText}>Create Challenge</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
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
});
