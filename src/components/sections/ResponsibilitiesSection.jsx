import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CollapsibleSection from "@/components/CollapsibleSection";

export default function ResponsibilitiesSection({
  responsibilities,
  addResponsibility,
  updateResponsibility,
  removeResponsibility,
  showResponsibilities,
  setShowResponsibilities,
  handleAIResponsibilities,
  aiLoading,
  profession,
  customProfession,
}) {
  return (
    <CollapsibleSection title="Job Responsibilities" isOpen={showResponsibilities} onToggle={() => setShowResponsibilities((value) => !value)}>
      <div className="space-y-2">
        {responsibilities.map((resp, index) => (
          <div key={index} className="flex items-start gap-2">
            <Textarea
              value={resp}
              onChange={(event) => updateResponsibility(index, event.target.value)}
              rows={2}
              placeholder="Job responsibility..."
              className="flex-1"
            />
            <Button variant="ghost" size="sm" onClick={() => removeResponsibility(index)}>
              Remove
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" onClick={addResponsibility}>
            + Add Responsibility
          </Button>
          <Button
            variant="outline"
            className="border-primary/50 premium-button cinematic-glow-hover"
            onClick={handleAIResponsibilities}
            disabled={Boolean(aiLoading.responsibilities) || (!profession && !customProfession)}
            title={!profession && !customProfession ? "Select or enter a profession first" : ""}
          >
            {aiLoading.responsibilities ? "✨ Generating..." : "✨ AI Generate All"}
          </Button>
        </div>
        {!profession && !customProfession && (
          <p className="text-sm text-muted-foreground">Select or enter a profession above to use AI generation</p>
        )}
      </div>
    </CollapsibleSection>
  );
}

