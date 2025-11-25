import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CollapsibleSection from "@/components/CollapsibleSection";

export default function SkillsSection({
  skills,
  addSkill,
  updateSkill,
  removeSkill,
  showSkills,
  setShowSkills,
  handleAISkillSuggestions,
  aiLoading,
  profession,
  customProfession,
}) {
  return (
    <CollapsibleSection title="Skills & Technologies" isOpen={showSkills} onToggle={() => setShowSkills((value) => !value)}>
      <div className="space-y-2">
        {skills.map((skill) => (
          <div key={skill.id} className="flex items-center gap-2">
            <Input
              value={skill.name}
              onChange={(event) => updateSkill(skill.id, event.target.value)}
              placeholder="Skill name"
            />
            <Button variant="ghost" size="sm" onClick={() => removeSkill(skill.id)}>
              Remove
            </Button>
          </div>
        ))}
        <div className="flex gap-2">
          <Button variant="outline" onClick={addSkill}>
            + Add Skill
          </Button>
          <Button
            variant="outline"
            className="border-primary/50 premium-button cinematic-glow-hover"
            onClick={handleAISkillSuggestions}
            disabled={Boolean(aiLoading.skills) || (!profession && !customProfession)}
            title={!profession && !customProfession ? "Select or enter a profession first" : ""}
          >
            {aiLoading.skills ? "✨ Generating..." : "✨ AI Generate All"}
          </Button>
        </div>
        {!profession && !customProfession && (
          <p className="text-sm text-muted-foreground">Select or enter a profession above to get profession-specific skill suggestions</p>
        )}
      </div>
    </CollapsibleSection>
  );
}

