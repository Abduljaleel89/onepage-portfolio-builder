import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TEMPLATES, getAllTemplates } from "@/lib/templates";
import CollapsibleSection from "@/components/CollapsibleSection";
import TemplatePreview from "@/components/TemplatePreview";

export default function TemplateSelector({ selectedTemplate, onTemplateChange, showTemplates, setShowTemplates }) {
  const templates = getAllTemplates();

  return (
    <CollapsibleSection 
      title="Portfolio Template" 
      isOpen={showTemplates} 
      onToggle={() => setShowTemplates((value) => !value)}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Choose a template to customize the look and feel of your portfolio
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedTemplate === template.id
                  ? "ring-2 ring-primary border-primary"
                  : ""
              }`}
              onClick={() => onTemplateChange(template.id)}
              role="button"
              tabIndex={0}
              aria-label={`Select ${template.name} template`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onTemplateChange(template.id);
                }
              }}
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{template.name}</h3>
                    {selectedTemplate === template.id && (
                      <span className="text-xs text-primary font-medium">Selected</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                  <TemplatePreview templateId={template.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </CollapsibleSection>
  );
}

