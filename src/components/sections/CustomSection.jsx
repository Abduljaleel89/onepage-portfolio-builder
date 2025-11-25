import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CollapsibleSection from "@/components/CollapsibleSection";

export default function CustomSection({
  customSections,
  addCustomSection,
  updateCustomSection,
  removeCustomSection,
  showCustomSections,
  setShowCustomSections,
}) {
  return (
    <CollapsibleSection
      title="Custom Sections"
      isOpen={showCustomSections}
      onToggle={() => setShowCustomSections((value) => !value)}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Add custom sections to your portfolio (e.g., Certifications, Awards, Publications)
        </p>
        {customSections.map((section, index) => (
          <div key={section.id} className="border-b pb-4 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">Custom Section #{index + 1}</h4>
              <Button variant="ghost" size="sm" onClick={() => removeCustomSection(section.id)}>
                Remove
              </Button>
            </div>
            <Input
              value={section.title}
              onChange={(event) => updateCustomSection(section.id, "title", event.target.value)}
              placeholder="Section Title (e.g., Certifications)"
            />
            <Textarea
              value={section.content}
              onChange={(event) => updateCustomSection(section.id, "content", event.target.value)}
              rows={4}
              placeholder="Section content..."
            />
          </div>
        ))}
        <Button variant="outline" onClick={addCustomSection}>
          + Add Custom Section
        </Button>
      </div>
    </CollapsibleSection>
  );
}

