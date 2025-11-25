import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CollapsibleSection from "@/components/CollapsibleSection";

export default function EducationSection({
  education,
  addEducation,
  updateEducation,
  removeEducation,
  showEducation,
  setShowEducation,
}) {
  return (
    <CollapsibleSection title="Education" isOpen={showEducation} onToggle={() => setShowEducation((value) => !value)}>
      <div className="space-y-4">
        {education.map((edu, index) => (
          <div key={edu.id} className="border-b pb-4 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">Education #{index + 1}</h4>
              <Button variant="ghost" size="sm" onClick={() => removeEducation(edu.id)}>
                Remove
              </Button>
            </div>
            <Input
              value={edu.degree}
              onChange={(event) => updateEducation(edu.id, "degree", event.target.value)}
              placeholder="Degree"
            />
            <Input
              value={edu.institution}
              onChange={(event) => updateEducation(edu.id, "institution", event.target.value)}
              placeholder="Institution"
            />
            <Input
              value={edu.period}
              onChange={(event) => updateEducation(edu.id, "period", event.target.value)}
              placeholder="2018 - 2022"
            />
            <Textarea
              value={edu.description}
              onChange={(event) => updateEducation(edu.id, "description", event.target.value)}
              rows={2}
              placeholder="Additional details..."
            />
          </div>
        ))}
        <Button variant="outline" onClick={addEducation}>
          + Add Education
        </Button>
      </div>
    </CollapsibleSection>
  );
}

