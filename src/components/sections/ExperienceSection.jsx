import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CollapsibleSection from "@/components/CollapsibleSection";

export default function ExperienceSection({
  experience,
  addExperience,
  updateExperience,
  removeExperience,
  showExperience,
  setShowExperience,
}) {
  return (
    <CollapsibleSection title="Work Experience" isOpen={showExperience} onToggle={() => setShowExperience((value) => !value)}>
      <div className="space-y-4">
        {experience.map((exp, index) => (
          <div key={exp.id} className="border-b pb-4 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">Experience #{index + 1}</h4>
              <Button variant="ghost" size="sm" onClick={() => removeExperience(exp.id)}>
                Remove
              </Button>
            </div>
            <Input
              value={exp.role}
              onChange={(event) => updateExperience(exp.id, "role", event.target.value)}
              placeholder="Role"
            />
            <Input
              value={exp.company}
              onChange={(event) => updateExperience(exp.id, "company", event.target.value)}
              placeholder="Company"
            />
            <Input
              value={exp.location}
              onChange={(event) => updateExperience(exp.id, "location", event.target.value)}
              placeholder="Location (optional)"
            />
            <Input
              value={exp.period}
              onChange={(event) => updateExperience(exp.id, "period", event.target.value)}
              placeholder="Jan 2020 - Present"
            />
            <Textarea
              value={exp.description}
              onChange={(event) => updateExperience(exp.id, "description", event.target.value)}
              rows={3}
              placeholder="Job description..."
            />
          </div>
        ))}
        <Button variant="outline" onClick={addExperience}>
          + Add Experience
        </Button>
      </div>
    </CollapsibleSection>
  );
}

