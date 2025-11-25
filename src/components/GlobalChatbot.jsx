import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AIChatbot from "@/components/AIChatbot";
import { usePortfolio } from "@/contexts/PortfolioContext";

export default function GlobalChatbot() {
  const { portfolio } = usePortfolio();
  const router = useRouter();
  const [occupations, setOccupations] = useState([]);

  // Fetch occupations
  useEffect(() => {
    if (typeof window === "undefined") return;
    fetch("/api/occupations")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data)) setOccupations(data);
      })
      .catch((err) => console.error("Failed to load occupations:", err));
  }, []);

  // Handle chatbot suggestions - navigate to index page if not already there
  const handleSuggestion = (type) => {
    // If not on the main page, navigate to it
    if (router.pathname !== "/") {
      router.push("/");
      // Wait a bit for navigation, then trigger the action
      setTimeout(() => {
        // Dispatch a custom event that the index page can listen to
        window.dispatchEvent(new CustomEvent("chatbot-suggestion", { detail: { type } }));
      }, 500);
    } else {
      // If already on index page, dispatch event immediately
      window.dispatchEvent(new CustomEvent("chatbot-suggestion", { detail: { type } }));
    }
  };

  return (
    <AIChatbot
      portfolio={portfolio}
      occupations={occupations}
      onSuggestion={handleSuggestion}
    />
  );
}

