import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CollapsibleSection from "@/components/CollapsibleSection";

export default function ProjectsSection({
  projects,
  addProject,
  updateProject,
  removeProject,
  showProjects,
  setShowProjects,
  handleAIProjectDescription,
  aiLoading,
}) {
  return (
    <CollapsibleSection title="Projects" isOpen={showProjects} onToggle={() => setShowProjects((value) => !value)}>
      <div className="space-y-4">
        {projects.map((project, index) => (
          <div key={project.id} className="border-b pb-4 space-y-2">
            <div className="flex justify-between items-start">
              <h4 className="font-medium">Project #{index + 1}</h4>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIProjectDescription(project)}
                  disabled={Boolean(aiLoading[`project-${project.id}`])}
                  className="premium-button cinematic-glow-hover"
                >
                  {aiLoading[`project-${project.id}`] ? "✨ Generating..." : "✨ AI Describe"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => removeProject(project.id)}>
                  Remove
                </Button>
              </div>
            </div>
            <Input
              value={project.title}
              onChange={(event) => updateProject(project.id, "title", event.target.value)}
              placeholder="Project Title"
            />
            <Textarea
              value={project.description}
              onChange={(event) => updateProject(project.id, "description", event.target.value)}
              rows={2}
              placeholder="Project description..."
            />
            <Input
              value={project.image}
              onChange={(event) => updateProject(project.id, "image", event.target.value)}
              placeholder="Image URL"
            />
            <Input
              value={project.link}
              onChange={(event) => updateProject(project.id, "link", event.target.value)}
              placeholder="Project URL"
            />
            <Input
              value={(project.tags || []).join(", ")}
              onChange={(event) =>
                updateProject(
                  project.id,
                  "tags",
                  event.target.value.split(",").map((t) => t.trim()).filter((t) => t)
                )
              }
              placeholder="Tags (comma separated)"
            />
          </div>
        ))}
        <Button variant="outline" onClick={addProject}>
          + Add Project
        </Button>
      </div>
    </CollapsibleSection>
  );
}

