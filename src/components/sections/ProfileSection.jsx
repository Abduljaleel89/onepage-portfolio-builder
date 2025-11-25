import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import CollapsibleSection from "@/components/CollapsibleSection";

export default function ProfileSection({
  profile,
  updateProfileField,
  social,
  updateSocialField,
  contact,
  updateContactField,
  handleAvatarUpload,
  uploading,
  fileInputRef,
  handleAIHeadline,
  handleAIBio,
  handleAIOptimize,
  aiLoading,
  customProfession,
  handleCustomProfessionChange,
  showSocial,
  setShowSocial,
  showContact,
  setShowContact,
}) {
  return (
    <>
      <Card className="mb-6 premium-card">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="profile-photo" className="font-medium mb-1 block">Profile Photo</label>
              <div className="flex items-center gap-4">
                {profile.avatar && (
                  <img
                    src={profile.avatar}
                    alt="Profile photo"
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                    role="img"
                    aria-label="Profile photo"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
                <div>
                  <input
                    id="profile-photo"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    aria-label="Upload profile photo"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    aria-label={uploading ? "Uploading photo" : profile.avatar ? "Change profile photo" : "Upload profile photo"}
                    aria-busy={uploading}
                  >
                    {uploading ? "Uploading..." : profile.avatar ? "Change Photo" : "Upload Photo"}
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="profile-name" className="font-medium mb-1 block">Name</label>
              <Input
                id="profile-name"
                value={profile.name}
                onChange={(event) => updateProfileField("name", event.target.value)}
                placeholder="Your Name"
                aria-required="true"
                aria-label="Your full name"
              />
            </div>

            <div>
              <label htmlFor="custom-profession" className="font-medium mb-1 block">Profession</label>
              <Input
                id="custom-profession"
                value={customProfession}
                onChange={(event) => handleCustomProfessionChange(event.target.value)}
                placeholder="e.g., Senior Product Designer, Tailor, Software Engineer"
                className="mt-1"
                aria-label="Enter your profession"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium">Headline</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAIHeadline}
                  disabled={Boolean(aiLoading.headline)}
                  className="text-xs premium-button cinematic-glow-hover"
                >
                  {aiLoading.headline ? "✨ Generating..." : "✨ AI Generate"}
                </Button>
              </div>
              <Input
                value={profile.headline}
                onChange={(event) => updateProfileField("headline", event.target.value)}
                placeholder="Full Stack Developer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-medium">Bio</label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAIBio}
                    disabled={Boolean(aiLoading.bio)}
                    className="text-xs premium-button cinematic-glow-hover"
                  >
                    {aiLoading.bio ? "✨ Generating..." : "✨ AI Generate"}
                  </Button>
                  {profile.bio && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAIOptimize("bio", profile.bio)}
                      disabled={Boolean(aiLoading["optimize-bio-general"])}
                      className="text-xs"
                    >
                      {aiLoading["optimize-bio-general"] ? "⚡ Optimizing..." : "⚡ Optimize"}
                    </Button>
                  )}
                </div>
              </div>
              <Textarea
                value={profile.bio}
                onChange={(event) => updateProfileField("bio", event.target.value)}
                placeholder="Tell us about yourself..."
                className="min-h-[150px]"
              />
            </div>
          </div>
          </CardContent>
        </Card>

      <CollapsibleSection
        title="Social Media Links"
        isOpen={showSocial}
        onToggle={() => setShowSocial((value) => !value)}
      >
        <div className="space-y-4">
          <div>
            <label className="font-medium mb-1 block">GitHub</label>
            <Input
              value={social.github}
              onChange={(event) => updateSocialField("github", event.target.value)}
              placeholder="https://github.com/username"
            />
          </div>
          <div>
            <label className="font-medium mb-1 block">LinkedIn</label>
            <Input
              value={social.linkedin}
              onChange={(event) => updateSocialField("linkedin", event.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          <div>
            <label className="font-medium mb-1 block">Twitter</label>
            <Input
              value={social.twitter}
              onChange={(event) => updateSocialField("twitter", event.target.value)}
              placeholder="https://twitter.com/username"
            />
          </div>
          <div>
            <label className="font-medium mb-1 block">Website</label>
            <Input
              value={social.website}
              onChange={(event) => updateSocialField("website", event.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
          <div>
            <label className="font-medium mb-1 block">Email</label>
            <Input
              type="email"
              value={social.email}
              onChange={(event) => updateSocialField("email", event.target.value)}
              placeholder="your@email.com"
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Contact"
        isOpen={showContact}
        onToggle={() => setShowContact((value) => !value)}
      >
        <div className="grid gap-4">
          <div>
            <label className="font-medium mb-1 block">Email</label>
            <Input
              type="email"
              value={contact.email}
              onChange={(event) => updateContactField("email", event.target.value)}
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="font-medium mb-1 block">Phone</label>
            <Input
              value={contact.phone}
              onChange={(event) => updateContactField("phone", event.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <label className="font-medium mb-1 block">Location</label>
            <Input
              value={contact.location}
              onChange={(event) => updateContactField("location", event.target.value)}
              placeholder="City, Country"
            />
          </div>
        </div>
      </CollapsibleSection>
    </>
  );
}

