import { Card, CardContent } from "@/components/ui/card";

export default function CollapsibleSection({ title, isOpen, onToggle, children }) {
  return (
    <Card className="mb-6 premium-card">
      <div
        className="flex justify-between items-center px-6 py-4 border-b cursor-pointer select-none hover:bg-accent/50 transition-all duration-300 hover:shadow-lg"
        onClick={onToggle}
      >
        <h3 className="font-semibold text-lg">{title}</h3>
        <span className="text-sm text-muted-foreground">{isOpen ? "▲ Hide" : "▼ Show"}</span>
      </div>
      {isOpen && <CardContent className="pt-4">{children}</CardContent>}
    </Card>
  );
}

