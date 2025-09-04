"use client"

import { useState } from "react"
import { Send, Bot, MessageCircle, Mic, Settings, Maximize2, Volume2 } from "lucide-react"

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      content: "Hi Siddh! I'm your AI learning assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState("connected")

  const styles = {
    container: {
      height: "100vh",
      background: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)",
      padding: "8px",
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      maxWidth: "1200px",
      margin: "0 auto 8px auto",
      flexShrink: 0,
    },
    headerTop: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "0",
      padding: "8px 0",
    },
    headerLeft: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    avatar: {
      position: "relative",
    },
    avatarIcon: {
      width: "32px",
      height: "32px",
      background: "linear-gradient(135deg, #2563eb, #4f46e5)",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
    },
    statusDot: {
      position: "absolute",
      bottom: "-2px",
      right: "-2px",
      width: "12px",
      height: "12px",
      backgroundColor: "#10b981",
      borderRadius: "50%",
      border: "2px solid white",
    },
    title: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#111827",
      margin: "0 0 2px 0",
    },
    subtitle: {
      color: "#6b7280",
      fontSize: "12px",
      margin: 0,
    },
    headerRight: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    statusIndicator: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    statusDotSmall: {
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      backgroundColor: "#10b981",
    },
    statusText: {
      fontSize: "10px",
      color: "#6b7280",
    },
    mainContainer: {
      maxWidth: "1200px",
      margin: "0 auto",
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minHeight: 0, // Important for proper flex sizing
    },
    chatCard: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
      border: "1px solid #f3f4f6",
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    },
    chatHeader: {
      background: "linear-gradient(135deg, #2563eb, #4f46e5)",
      color: "white",
      padding: "8px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: "40px",
      flexShrink: 0,
    },
    chatHeaderLeft: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    chatHeaderIcon: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      backdropFilter: "blur(10px)",
      padding: "6px",
      borderRadius: "8px",
    },
    chatHeaderText: {
      flex: 1,
    },
    chatHeaderTitle: {
      fontSize: "14px",
      fontWeight: "600",
      margin: "0 0 2px 0",
    },
    chatHeaderSubtitle: {
      fontSize: "10px",
      color: "rgba(255, 255, 255, 0.8)",
      margin: 0,
    },
    chatHeaderRight: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    headerButton: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      border: "none",
      color: "white",
      padding: "6px",
      borderRadius: "6px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    chatBody: {
      flex: 1,
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      minHeight: 0, // Important for proper flex sizing
    },
    iframeContainer: {
      flex: 1,
      width: "100%",
      background: "linear-gradient(135deg, #f9fafb, white)",
      minHeight: 0, // Important for flex children
    },
    iframe: {
      width: "100%",
      height: "100%",
      border: "none",
      display: "block",
    },
    chatInput: {
      padding: "12px 16px",
      borderTop: "1px solid #f3f4f6",
      background: "linear-gradient(135deg, #f9fafb, white)",
      minHeight: "80px",
      flexShrink: 0,
    },
    inputContainer: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "8px",
    },
    inputWrapper: {
      flex: 1,
      position: "relative",
      display: "flex",
      alignItems: "center",
    },
    textarea: {
      width: "100%",
      border: "1px solid #d1d5db",
      borderRadius: "12px",
      padding: "8px 40px 8px 12px",
      fontSize: "14px",
      resize: "none",
      minHeight: "36px",
      maxHeight: "36px",
      outline: "none",
      transition: "all 0.2s ease",
      backgroundColor: "white",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    micButton: {
      position: "absolute",
      right: "6px",
      top: "50%",
      transform: "translateY(-50%)",
      backgroundColor: "transparent",
      border: "none",
      padding: "6px",
      borderRadius: "6px",
      cursor: "pointer",
      color: "#9ca3af",
      transition: "all 0.2s ease",
    },
    sendButton: {
      backgroundColor: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "8px 16px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      height: "36px",
      whiteSpace: "nowrap",
      flexShrink: 0,
    },
    suggestions: {
      display: "flex",
      flexWrap: "wrap",
      gap: "6px",
    },
    suggestionButton: {
      fontSize: "11px",
      backgroundColor: "white",
      color: "#374151",
      border: "1px solid #d1d5db",
      borderRadius: "16px",
      padding: "4px 8px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
  }

  const handleSendMessage = () => {
    if (!input.trim()) return
    // Your existing logic here
  }

  const suggestionPrompts = [
    "I paid for a course but it's not showing in my account",
  "How do I make payment for a course?",
  "Where can I view my event tickets?",
  "How to redeem my learning coins/rewards?",
  "My payment failed but money was deducted",
  ]

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.headerLeft}>
            <div style={styles.avatar}>
              <div style={styles.avatarIcon}>
                <Bot size={28} color="white" />
              </div>
              <div style={styles.statusDot}></div>
            </div>
            <div>
              <h1 style={styles.title}>AI Assistant</h1>
              <p style={styles.subtitle}>Your personalized query companion powered by EduConnect </p>
            </div>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.statusIndicator}>
              <div style={styles.statusDotSmall}></div>
              <span style={styles.statusText}>Connected</span>
            </div>
            <button style={styles.headerButton}>
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat */}
      <div style={styles.mainContainer}>
        <div style={styles.chatCard}>
          <div style={styles.chatHeader}>
            <div style={styles.chatHeaderLeft}>
              <div style={styles.chatHeaderIcon}>
                <MessageCircle size={20} />
              </div>
              <div style={styles.chatHeaderText}>
                <h2 style={styles.chatHeaderTitle}>Real-Time AI Assistant</h2>
                <p style={styles.chatHeaderSubtitle}>Powered by EduConnect • Real-time Assistance</p>
              </div>
            </div>

            <div style={styles.chatHeaderRight}>
              <button style={styles.headerButton}>
                <Volume2 size={16} />
              </button>
              <button style={styles.headerButton}>
                <Maximize2 size={16} />
              </button>
            </div>
          </div>
          <div style={styles.chatBody}>
            <div style={styles.iframeContainer}>
              <iframe
                src="https://labs.heygen.com/guest/streaming-embed?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJFbGVub3JhX0lUX1NpdHRpbmdfcHVibGlj%0D%0AIiwicHJldmlld0ltZyI6Imh0dHBzOi8vZmlsZXMyLmhleWdlbi5haS9hdmF0YXIvdjMvY2JkNGE2%0D%0AOTg5MGEwNDBlNmEwZDU0MDg4ZTYwNmE1NTlfNDU2MTAvcHJldmlld190YWxrXzMud2VicCIsIm5l%0D%0AZWRSZW1vdmVCYWNrZ3JvdW5kIjpmYWxzZSwia25vd2xlZGdlQmFzZUlkIjoiZjRkZDVlZjBiZTU5%0D%0ANDljNGI2OTUzZmJhMjJhOWVkNDIiLCJ1c2VybmFtZSI6ImI1YzQxN2JlZDM3YjRkNjNiMGM5NGI2%0D%0AOTAxNmJmZDY3In0%3D&inIFrame=1"
                allow="microphone"
                allowFullScreen
                style={styles.iframe}
              />
            </div>
          </div>
          <div style={styles.chatInput}>
            <div style={styles.inputContainer}>
              <div style={styles.inputWrapper}>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your queries and doubts here..."
                  style={styles.textarea}
                />
                <button style={styles.micButton}>
                  <Mic size={16} />
                </button>
              </div>
              <button style={styles.sendButton} onClick={handleSendMessage}>
                <Send size={18} />
                Send
              </button>
            </div>
            <div style={styles.suggestions}>
              {suggestionPrompts.map((prompt, index) => (
                <button key={index} onClick={() => setInput(prompt)} style={styles.suggestionButton}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant