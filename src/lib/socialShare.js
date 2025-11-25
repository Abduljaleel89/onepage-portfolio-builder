/**
 * Social media sharing utilities
 */

export function shareToLinkedIn(portfolioUrl, title, summary) {
  const url = new URL("https://www.linkedin.com/sharing/share-offsite/");
  url.searchParams.set("url", portfolioUrl);
  if (title) url.searchParams.set("title", title);
  if (summary) url.searchParams.set("summary", summary);
  window.open(url.toString(), "_blank", "width=600,height=400");
}

export function shareToTwitter(text, url) {
  const twitterUrl = new URL("https://twitter.com/intent/tweet");
  twitterUrl.searchParams.set("text", text);
  if (url) twitterUrl.searchParams.set("url", url);
  window.open(twitterUrl.toString(), "_blank", "width=600,height=400");
}

export function shareToFacebook(url) {
  const facebookUrl = new URL("https://www.facebook.com/sharer/sharer.php");
  facebookUrl.searchParams.set("u", url);
  window.open(facebookUrl.toString(), "_blank", "width=600,height=400");
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch (e) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

export function shareViaEmail(subject, body) {
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
}

