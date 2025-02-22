
import { StyleSheet } from 'react-native';
import { Colors } from './Colors';

export const GlobalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    gap: 20,
  },
  
  // Header styles
  header: {
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  headerContent: {
    marginLeft: 40,
    marginTop: -30,
  },

  // Filter styles
  filterContainer: {
    marginTop: 10,
  },
  filterContentContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 10,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  filterButtonActive: {
    backgroundColor: "#F44336",
    borderColor: "#F44336",
  },
  filterTextActive: {
    color: "#fff",
  },
  filterTextActiveLight: {
    color: "#fff",
  },

  // List item styles
  listItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8EAF6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "500",
  },
  challengeAvatar: {
    backgroundColor: "",
    borderColor: "#F44336",
    borderWidth: 2,
  },
  coachingAvatar: {
    backgroundColor: "",
    borderColor: "#2196F3",
    borderWidth: 2,
  },
  challengeItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  coachingItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },

  // Content styles
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  preview: {
    fontSize: 14,
    opacity: 0.6,
    flex: 1,
    marginRight: 8,
  },
  participantInfo: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },

  // Badge styles
  badge: {
    backgroundColor: "#FF4444",
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  // Action button styles
  actionButton: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
  },
  acceptButton: {
    backgroundColor: "rgba(76, 175, 80, 0.8)",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    height: "100%",
  },
  rejectButton: {
    backgroundColor: "rgba(244, 67, 54, 0.8)",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    height: "100%",
  },
  changeCoachButton: {
    backgroundColor: "rgba(33, 150, 243, 0.8)",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    height: "100%",
  },
  deleteButton: {
    backgroundColor: "rgba(244, 67, 54, 0.8)",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    height: "100%",
  },
  archiveButton: {
    backgroundColor: "rgba(128, 128, 128, 0.8)",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    height: "100%",
  },
  buttonText: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
  },

  // Chat specific styles
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
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
});
