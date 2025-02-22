import { StyleSheet } from "react-native";
import { Colors } from "./Colors";

export const GlobalStyles = StyleSheet.create({
  // Challenge & Coaching Styles
  challengeAvatar: {
    backgroundColor: "", // e.g., "#FFEBEE"
    borderColor: "#F44336",
    borderWidth: 2,
  },
  coachingAvatar: {
    backgroundColor: "", // e.g., "#E3F2FD"
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
  // Renamed to avoid duplication with chat
  challengeTypeLabel: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: "italic",
  },
  participantInfo: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },

  // General Layout Styles
  baseContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128, 128, 128, 0.2)",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E0E0E0",
    marginLeft: 76,
  },
  avatarContainer: {
    marginRight: 16,
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
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  preview: {
    fontSize: 14,
    opacity: 0.6,
    flex: 1,
    marginRight: 8,
  },
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

  // Card & Section Styles
  coachingCard: {
    borderColor: "#98D8A1",
    borderWidth: 2,
  },
  pendingCard: {
    borderStyle: "dashed",
  },
  activeCard: {
    borderStyle: "solid",
  },
  cardContainer: {
    flex: 1,
    gap: 20,
  },
  globalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.15)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
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
    marginRight: 10,
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
  participantsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 8,
  },
  participantText: {
    fontSize: 14,
    opacity: 0.9,
  },
  actionsContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
    paddingTop: 16,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
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
  defaultButtonText: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
  },
  challengerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  createButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    width: 60,
    height: 60,
    borderRadius: 30,
    position: "absolute",
    bottom: 24,
    right: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 1,
  },
  swipeableButtons: {
    flexDirection: "row",
    alignItems: "center",
    width: 200,
    gap: 8,
    paddingHorizontal: 8,
  },
  swipeButton: {
    flex: 1,
    height: 70,
    justifyContent: "center",
  },
  coachSection: {
    backgroundColor: "rgba(161, 206, 220, 0.15)",
    borderWidth: 1,
    borderColor: "#A1CEDC",
  },
  section: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  challengeCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  challengeTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: 0.4,
    color: "#0a7ea4",
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
  },
  archiveButton: {
    backgroundColor: "rgba(128, 128, 128, 0.8)",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    height: "100%",
  },

  // Chat Styles
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  chatHeaderContent: {
    marginLeft: 40,
    marginTop: -30,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#FFFFFF",
  },
  chatSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.7,
  },
  chatActionButtons: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 8,
  },
  chatActionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  chatAcceptButton: {
    backgroundColor: "#4CAF50",
  },
  chatRejectButton: {
    backgroundColor: "#f44336",
  },
  chatButtonText: {
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
  chatInput: {
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
  chatSendButtonText: {
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

  // User Styles
  userContainer: {
    flex: 1,
    padding: 20,
  },
  testControls: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    gap: 10,
  },
  logoutButton: {
    backgroundColor: "#F44336",
  },
  username: {
    fontSize: 24,
    marginVertical: 10,
  },
  notificationsContainer: {
    marginTop: 20,
    gap: 10,
  },
  notification: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  notificationRead: {
    opacity: 0.6,
  },
  notificationText: {
    fontSize: 16,
    marginBottom: 5,
  },
  notificationDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  userButton: {
    backgroundColor: "#F44336",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  userButtonText: {
    color: "white",
    fontSize: 16,
  },
});
