import Image from "next/image";
import { sanitizeUrl, validateUrl } from "@/lib/sanitize";
import { getTemplateClasses } from "@/lib/templateStyles";

export default function PreviewSection({
  safeName,
  safeHeadline,
  profile,
  contactEntries,
  socialLinks,
  displayBio,
  responsibilitiesToShow,
  skillNames,
  experienceToShow,
  experienceSummary,
  professionTitle,
  educationToShow,
  projectsToShow,
  template = "modern",
}) {
  let templateClasses;
  try {
    templateClasses = getTemplateClasses(template);
  } catch (error) {
    console.error("Error getting template classes:", error);
    templateClasses = getTemplateClasses("modern");
  }
  
  return (
    <div className={templateClasses.container}>
      <div className="p-4 sm:p-8 print:p-6">
        <div className={templateClasses.header}>
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
            <div className="flex-1 animate-slide-in-right w-full sm:w-auto">
              <h1 className={`cv-name ${templateClasses.name}`}>
                {safeName}
              </h1>
              <p className={templateClasses.headline}>
                {safeHeadline}
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600 cv-header-meta">
                {contactEntries.map((entry) => (
                  <span key={entry.label}>
                    {entry.label}: {entry.value}
                  </span>
                ))}
              </div>
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3 cv-header-links">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={sanitizeUrl(link.value)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
            {profile.avatar && (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-primary print:w-20 print:h-20 mx-auto sm:mx-0 flex-shrink-0">
                <Image
                  src={profile.avatar}
                  alt={profile.name || "Profile"}
                  fill
                  className="object-cover"
                  style={{ imageOrientation: "from-image" }}
                  sizes="(max-width: 640px) 80px, 96px"
                />
              </div>
            )}
          </div>
        </div>

        {displayBio && (
          <section
            className="mb-4 sm:mb-6 cv-section animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <h2 className={templateClasses.sectionHeading}>
              <span className={templateClasses.sectionLine} />
              Professional Summary
            </h2>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{displayBio}</p>
          </section>
        )}

        {responsibilitiesToShow.length > 0 && (
          <section
            className="mb-4 sm:mb-6 cv-section animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <h2 className={templateClasses.sectionHeading}>
              <span className={templateClasses.sectionLine} />
              Key Responsibilities
            </h2>
            <ul className="space-y-1 text-gray-700">
              {responsibilitiesToShow.map((resp, index) => (
                <li key={index} className="leading-relaxed cv-list-item">
                  {resp}
                </li>
              ))}
            </ul>
          </section>
        )}

        {skillNames.length > 0 && (
          <section
            className="mb-4 sm:mb-6 cv-section animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <h2 className={templateClasses.sectionHeading}>
              <span className={templateClasses.sectionLine} />
              Technical Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {skillNames.map((name) => (
                <span key={name} className={`cv-chip ${templateClasses.chip} px-3 py-1 rounded-full text-sm font-medium`}>
                  {name}
                </span>
              ))}
            </div>
          </section>
        )}

        {experienceToShow.length > 0 && (
          <section
            className="mb-4 sm:mb-6 cv-section animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <h2 className={templateClasses.sectionHeading}>
              <span className={templateClasses.sectionLine} />
              Professional Experience
            </h2>
            <div className="cv-timeline">
              {experienceToShow.map((exp) => (
                <div key={exp.id} className="cv-timeline-item">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-lg text-gray-900">{exp.role || "Role"}</h3>
                    <span className="text-sm text-gray-600 font-medium">
                      {exp.period || experienceSummary || "Timeline"}
                    </span>
                  </div>
                  <p className="text-gray-700 font-medium mb-2">
                    {exp.company || professionTitle}
                  </p>
                  {exp.location && (
                    <p className="text-sm text-gray-600 mb-1">{exp.location}</p>
                  )}
                  {exp.description && (
                    <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {educationToShow.length > 0 && (
          <section
            className="mb-4 sm:mb-6 cv-section animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <h2 className={templateClasses.sectionHeading}>
              <span className={templateClasses.sectionLine} />
              Education
            </h2>
            <div className="cv-timeline">
              {educationToShow.map((edu) => (
                <div key={edu.id} className="cv-timeline-item">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {edu.degree || "Degree"}
                    </h3>
                    <span className="text-sm text-gray-600 font-medium">
                      {edu.period || "Timeline"}
                    </span>
                  </div>
                  <p className="text-gray-700 font-medium mb-1">
                    {edu.institution || professionTitle}
                  </p>
                  {edu.description && (
                    <p className="text-gray-700 text-sm leading-relaxed">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {projectsToShow.length > 0 && (
          <section
            className="mb-4 sm:mb-6 cv-section animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            <h2 className={templateClasses.sectionHeading}>
              <span className={templateClasses.sectionLine} />
              Projects
            </h2>
            <div className="space-y-4">
              {projectsToShow.map((project) => (
                <div key={project.id} className="p-4 cv-project-card">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {project.title || "Project Title"}
                    </h3>
                    {project.link && validateUrl(project.link) && (
                      <a
                        href={sanitizeUrl(project.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm print:text-gray-900"
                      >
                        View →
                      </a>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-gray-700 leading-relaxed mb-2">{project.description}</p>
                  )}
                  {Array.isArray(project.tags) && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className={`cv-chip text-xs ${templateClasses.chip} px-2 py-1 rounded-full`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

