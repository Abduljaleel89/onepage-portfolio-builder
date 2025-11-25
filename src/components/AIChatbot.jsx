import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/apiClient";
// Simple icon components
const XIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SendIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const BotIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default function AIChatbot({ portfolio, occupations, onSuggestion }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI portfolio assistant. I can help you generate content, suggest improvements, and guide you through building your portfolio. What would you like help with?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Prepare context for the AI
      const selectedProfession = occupations.find((occ) => occ.slug === portfolio.profession);
      const professionTitle = portfolio.customProfession?.trim() || selectedProfession?.title || portfolio.profession || "Professional";
      
      const context = {
        name: portfolio.profile.name,
        profession: professionTitle,
        skills: portfolio.skills.map((s) => s.name),
        experience: portfolio.experience.length,
        education: portfolio.education.length,
        projects: portfolio.projects.length,
        hasBio: !!portfolio.profile.bio,
        hasHeadline: !!portfolio.profile.headline,
      };

      // Call OpenAI API for chat
      const response = await apiClient.post("/api/ai/chat", {
        message: userMessage,
        context,
        conversationHistory: messages.slice(-5), // Last 5 messages for context
      });

      const assistantMessage = response.reply || "I'm sorry, I couldn't generate a response. Please try again.";
      
      setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }]);

      // Check if the assistant suggested an action
      if (response.suggestion) {
        // Extract suggestion type and trigger appropriate action
        const suggestion = response.suggestion.toLowerCase();
        if (suggestion.includes("generate") && suggestion.includes("bio")) {
          onSuggestion?.("bio");
        } else if (suggestion.includes("generate") && suggestion.includes("headline")) {
          onSuggestion?.("headline");
        } else if (suggestion.includes("generate") && suggestion.includes("skill")) {
          onSuggestion?.("skills");
        } else if (suggestion.includes("generate") && suggestion.includes("responsibilit")) {
          onSuggestion?.("responsibilities");
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error. Please try again or check your OpenAI API key configuration.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { label: "Generate Bio", action: "bio" },
    { label: "Suggest Skills", action: "skills" },
    { label: "Generate Responsibilities", action: "responsibilities" },
    { label: "Improve Headline", action: "headline" },
  ];

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-14 w-14 rounded-full shadow-lg premium-button cinematic-glow z-[9999] hover:scale-110 transition-transform duration-200"
        aria-label="Open AI Assistant"
        style={{
          position: "fixed",
          bottom: "16px",
          right: "16px",
          zIndex: 9999,
        }}
      >
        <BotIcon className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card 
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-96 h-[calc(100vh-32px)] sm:h-[600px] max-h-[600px] shadow-2xl z-[9999] flex flex-col premium-card"
      style={{
        position: "fixed",
        bottom: "16px",
        right: "16px",
        zIndex: 9999,
        maxHeight: "calc(100vh - 32px)",
      }}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <BotIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 p-0"
          aria-label="Close chat"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: "100%" }}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BotIcon className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <BotIcon className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t space-y-2">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.action}
                variant="outline"
                size="sm"
                onClick={() => {
                  setInput(`Help me ${action.label.toLowerCase()}`);
                  setTimeout(() => handleSend(), 100);
                }}
                className="text-xs"
                disabled={isLoading}
              >
                {action.label}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your portfolio..."
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="premium-button"
              size="sm"
            >
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

