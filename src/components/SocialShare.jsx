import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  shareToLinkedIn,
  shareToTwitter,
  shareToFacebook,
  copyToClipboard,
  shareViaEmail,
} from "@/lib/socialShare";
import { apiClient } from "@/lib/apiClient";
import CollapsibleSection from "@/components/CollapsibleSection";

export default function SocialShare({
  portfolioUrl,
  portfolioTitle,
  portfolioSummary,
  showSocialShare,
  setShowSocialShare,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(portfolioUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const trackShare = async (platform) => {
    try {
      await apiClient.post("/api/analytics/track", {
        event: "share",
        data: { platform },
      });
    } catch (err) {
      // Silent fail for analytics
    }
  };

  const handleShareLinkedIn = () => {
    shareToLinkedIn(portfolioUrl, portfolioTitle, portfolioSummary);
    trackShare("linkedin");
  };

  const handleShareTwitter = () => {
    const text = `${portfolioTitle} - Check out my portfolio!`;
    shareToTwitter(text, portfolioUrl);
    trackShare("twitter");
  };

  const handleShareFacebook = () => {
    shareToFacebook(portfolioUrl);
    trackShare("facebook");
  };

  const handleShareEmail = () => {
    const subject = `Check out my portfolio: ${portfolioTitle}`;
    const body = `Hi,\n\nI wanted to share my portfolio with you:\n\n${portfolioUrl}\n\n${portfolioSummary || ""}`;
    shareViaEmail(subject, body);
    trackShare("email");
  };

  return (
    <CollapsibleSection
      title="Share Portfolio"
      isOpen={showSocialShare}
      onToggle={() => setShowSocialShare((value) => !value)}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Share your portfolio on social media or via email
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            onClick={handleShareLinkedIn}
            className="flex items-center gap-2"
            aria-label="Share on LinkedIn"
          >
            <span>💼</span> LinkedIn
          </Button>
          <Button
            variant="outline"
            onClick={handleShareTwitter}
            className="flex items-center gap-2"
            aria-label="Share on Twitter"
          >
            <span>🐦</span> Twitter
          </Button>
          <Button
            variant="outline"
            onClick={handleShareFacebook}
            className="flex items-center gap-2"
            aria-label="Share on Facebook"
          >
            <span>📘</span> Facebook
          </Button>
          <Button
            variant="outline"
            onClick={handleShareEmail}
            className="flex items-center gap-2"
            aria-label="Share via Email"
          >
            <span>📧</span> Email
          </Button>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={portfolioUrl}
            readOnly
            className="flex-1 px-3 py-2 border rounded-md bg-muted text-sm"
            aria-label="Portfolio URL"
          />
          <Button
            variant="outline"
            onClick={handleCopyLink}
            aria-label="Copy portfolio URL"
          >
            {copied ? "✓ Copied" : "📋 Copy"}
          </Button>
        </div>
      </div>
    </CollapsibleSection>
  );
}

