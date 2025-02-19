
import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';

export default function ChatScreen() {
  const { challengeId } = useLocalSearchParams();
  const { challenges, user } = useAuth();
  const router = useRouter();
  const [message, setMessage] = React.useState('');
  
  const challenge = challenges.find(c => c.id === challengeId);

  if (!challenge) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Challenge not found</ThemedText>
      </ThemedView>
    );
  }

  const messages = challenge.messages || [];
  const isCoach = challenge.coachId === user?.id;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#000" />
        </TouchableOpacity>
        <ThemedText style={styles.title}>{challenge.title}</ThemedText>
        <ThemedText style={styles.subtitle}>
          {isCoach ? `Challenger: ${challenge.userId}` : `Coach: ${challenge.coachId}`}
        </ThemedText>
        
        {challenge.status === 'pending' && (
          <View style={styles.actionContainer}>
            {isCoach ? (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.acceptButton]} 
                  onPress={() => updateChallengeStatus(challenge.id, 'active')}>
                  <ThemedText style={styles.buttonText}>Accept</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => updateChallengeStatus(challenge.id, 'rejected')}>
                  <ThemedText style={styles.buttonText}>Reject</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.changeCoachButton]}
                  onPress={() => handleChangeCoach(challenge.id, 'newCoachId')}>
                  <ThemedText style={styles.buttonText}>Change Coach</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteChallenge(challenge.id)}>
                  <ThemedText style={styles.buttonText}>Delete</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      <FlatList
        style={styles.messageList}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.userId === user?.id ? styles.ownMessage : styles.otherMessage
          ]}>
            <ThemedText style={styles.messageText}>{item.text}</ThemedText>
            <ThemedText style={styles.messageTime}>
              {new Date(item.timestamp).toLocaleTimeString()}
            </ThemedText>
          </View>
        )}
      />

      {challenge.status === 'active' ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            placeholderTextColor="#666"
          />
          <TouchableOpacity style={styles.sendButton}>
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
          <TouchableOpacity style={[styles.sendButton, styles.disabledButton]} disabled>
            <ThemedText style={[styles.sendButtonText, styles.disabledButtonText]}>Send</ThemedText>
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
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  changeCoachButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledInput: {
    opacity: 0.7,
    backgroundColor: '#f5f5f5',
  },
  disabledTextInput: {
    color: '#666',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledButtonText: {
    color: '#666',
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
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
    maxWidth: '80%',
  },
  ownMessage: {
    backgroundColor: '#4CAF50',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#E8E8E8',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
