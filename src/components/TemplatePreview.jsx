/**
 * Mini preview component showing how a template looks
 */
import { getTemplateClasses } from "@/lib/templateStyles";

export default function TemplatePreview({ templateId }) {
  const templateClasses = getTemplateClasses(templateId);
  
  return (
    <div className="mt-3 border rounded-lg p-2 bg-white shadow-sm overflow-hidden">
      <div className="transform scale-90 origin-top-left">
        <div className="bg-white rounded border-l-4 p-2">
          {/* Header Preview */}
          <div className={`${templateClasses.header} mb-2 pb-2`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className={`${templateClasses.name} text-xs mb-0.5`}>John Doe</div>
                <div className={`${templateClasses.headline} text-[10px]`}>Software Engineer</div>
              </div>
              <div className="w-6 h-6 rounded-full bg-gray-200 border flex-shrink-0" />
            </div>
          </div>
          
          {/* Skills Preview */}
          <div className="mb-2">
            <div className={`${templateClasses.sectionHeading} text-[10px] mb-1`}>
              <span className={`${templateClasses.sectionLine} h-3`} />
              <span className="ml-1">Skills</span>
            </div>
            <div className="flex flex-wrap gap-1">
              <span className={`${templateClasses.chip} px-1.5 py-0.5 rounded-full text-[9px]`}>React</span>
              <span className={`${templateClasses.chip} px-1.5 py-0.5 rounded-full text-[9px]`}>Node.js</span>
            </div>
          </div>
          
          {/* Experience Preview */}
          <div>
            <div className={`${templateClasses.sectionHeading} text-[10px] mb-1`}>
              <span className={`${templateClasses.sectionLine} h-3`} />
              <span className="ml-1">Experience</span>
            </div>
            <div className="text-[9px] text-gray-600">
              <div className="font-semibold">Senior Developer</div>
              <div className="text-[8px]">2020 - Present</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

