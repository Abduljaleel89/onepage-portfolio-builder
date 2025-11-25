import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
} from "@react-pdf/renderer";
import { getTemplatePdfStyles } from "@/lib/templateStyles";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#f8fafc",
    padding: 32,
    fontFamily: "Helvetica",
    color: "#0f172a",
    fontSize: 11,
    lineHeight: 1.45,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    border: "1 solid #e2e8f0",
    padding: 28,
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
    paddingBottom: 18,
    borderBottom: "2 solid #3b82f6",
  },
  nameRoleWrap: {
    flexDirection: "column",
    maxWidth: "72%",
  },
  name: {
    fontSize: 26,
    fontWeight: 700,
    color: "#6366f1", // Indigo - middle of blue-purple gradient
    marginBottom: 12,
  },
  headline: {
    fontSize: 13,
    fontWeight: 500,
    marginTop: 8,
    marginBottom: 8,
    color: "#475569",
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 6,
  },
  contactChip: {
    backgroundColor: "#dbeafe",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    marginTop: 6,
    fontSize: 10,
    fontWeight: 500,
    color: "#1e3a8a",
    border: "1 solid #93c5fd",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    border: "2 solid #3b82f6",
    objectFit: "cover",
  },
  section: {
    marginTop: 18,
    paddingLeft: 16,
    position: "relative",
  },
  sectionHeadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  sectionHeadingLine: {
    width: 4,
    height: 20,
    backgroundColor: "#3b82f6",
    borderRadius: 2,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    borderBottom: "2 solid #3b82f6",
    paddingBottom: 4,
    flex: 1,
  },
  summaryText: {
    fontSize: 11,
    color: "#334155",
    lineHeight: 1.6,
  },
  bulletList: {
    marginTop: 6,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    paddingLeft: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3b82f6",
    marginRight: 8,
    marginTop: 4,
  },
  bulletContent: {
    flex: 1,
    fontSize: 11,
    color: "#334155",
    lineHeight: 1.5,
  },
  skillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    gap: 6,
  },
  skillChip: {
    backgroundColor: "#dbeafe",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    marginTop: 6,
    fontSize: 10,
    fontWeight: 600,
    color: "#14325b",
    border: "1 solid #93c5fd",
  },
  timelineWrap: {
    flexDirection: "column",
    gap: 12,
  },
  timelineItem: {
    borderLeft: "2 solid #60a5fa",
    paddingLeft: 14,
    marginBottom: 12,
    position: "relative",
  },
  timelineDot: {
    position: "absolute",
    left: -6,
    top: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3b82f6",
    border: "2 solid #ffffff",
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#1f2937",
  },
  timelineMeta: {
    fontSize: 10,
    fontWeight: 500,
    color: "#475569",
  },
  timelineDescription: {
    marginTop: 4,
    fontSize: 11,
    color: "#334155",
    lineHeight: 1.5,
  },
  projectCard: {
    border: "1 solid #e2e8f0",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f8fafc",
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  projectTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#1f2937",
  },
  projectLink: {
    fontSize: 10,
    color: "#3b82f6",
    textDecoration: "none",
  },
  projectDescription: {
    marginTop: 4,
    fontSize: 11,
    color: "#334155",
    lineHeight: 1.5,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    gap: 4,
  },
  tag: {
    backgroundColor: "#dbeafe",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginTop: 4,
    fontSize: 9,
    color: "#1e3a8a",
    border: "1 solid #93c5fd",
  },
  socialRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    gap: 8,
  },
  socialLink: {
    marginRight: 10,
    marginTop: 4,
    fontSize: 10,
    color: "#3b82f6",
    textDecoration: "none",
  },
});

const BulletList = ({ items = [] }) => (
  <View style={styles.bulletList}>
    {items.map((text, index) => (
      <View key={`${text}-${index}`} style={styles.bulletItem}>
        <View style={styles.bullet} />
        <Text style={styles.bulletContent}>{text}</Text>
      </View>
    ))}
  </View>
);

const Timeline = ({ items = [], templateStyles, dynamicStyles }) => (
  <View style={styles.timelineWrap}>
    {items.map((item, index) => (
      <View key={`${item.id || index}`} style={dynamicStyles?.timelineItem || styles.timelineItem}>
        <View style={dynamicStyles?.timelineDot || styles.timelineDot} />
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineTitle}>{item.role || item.degree || item.title || ""}</Text>
          <Text style={styles.timelineMeta}>{item.period || item.company || item.institution || ""}</Text>
        </View>
        {item.company && (
          <Text style={styles.timelineMeta}>{item.company}</Text>
        )}
        {item.location && (
          <Text style={styles.timelineMeta}>{item.location}</Text>
        )}
        {item.description && (
          <Text style={styles.timelineDescription}>{item.description}</Text>
        )}
      </View>
    ))}
  </View>
);

const Projects = ({ items = [], templateStyles, dynamicStyles }) => (
  <View>
    {items.map((project, index) => (
      <View key={`${project.id || index}`} style={styles.projectCard}>
        <View style={styles.projectHeader}>
          <Text style={styles.projectTitle}>{project.title || "Project"}</Text>
          {project.link && (
            <Link src={project.link.startsWith("http") ? project.link : `https://${project.link}`} style={dynamicStyles?.projectLink || styles.projectLink}>
              View →
            </Link>
          )}
        </View>
        {project.description && (
          <Text style={styles.projectDescription}>{project.description}</Text>
        )}
        {Array.isArray(project.tags) && project.tags.length > 0 && (
          <View style={styles.tagWrap}>
            {project.tags.map((tag) => (
              <View key={tag} style={dynamicStyles?.tag || styles.tag}>
                <Text style={{ fontSize: 9, color: templateStyles?.primaryColor || "#1e3a8a" }}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    ))}
  </View>
);

const PortfolioPdf = ({ data }) => {
  const {
    safeName,
    safeHeadline,
    professionTitle,
    displayBio,
    contactEntries = [],
    socialLinks = [],
    responsibilities = [],
    skills = [],
    experience = [],
    education = [],
    projects = [],
    profile = {},
    template = "modern",
  } = data || {};

  const templateStyles = getTemplatePdfStyles(template);
  const derivedHeadline = safeHeadline || professionTitle || "";

  // Create dynamic styles based on template
  const dynamicStyles = StyleSheet.create({
    name: {
      ...styles.name,
      color: templateStyles.nameColor,
    },
    sectionHeadingLine: {
      ...styles.sectionHeadingLine,
      backgroundColor: templateStyles.primaryColor,
    },
    sectionHeading: {
      ...styles.sectionHeading,
      borderBottomColor: templateStyles.borderColor,
    },
    header: {
      ...styles.header,
      borderBottomColor: templateStyles.borderColor,
    },
    contactChip: {
      ...styles.contactChip,
      backgroundColor: templateStyles.primaryColor + "20",
      borderColor: templateStyles.primaryColor + "60",
      color: templateStyles.primaryColor,
    },
    skillChip: {
      ...styles.skillChip,
      backgroundColor: templateStyles.primaryColor + "20",
      borderColor: templateStyles.primaryColor + "60",
      color: templateStyles.primaryColor,
    },
    timelineDot: {
      ...styles.timelineDot,
      backgroundColor: templateStyles.primaryColor,
    },
    timelineItem: {
      ...styles.timelineItem,
      borderLeftColor: templateStyles.secondaryColor,
    },
    tag: {
      ...styles.tag,
      backgroundColor: templateStyles.primaryColor + "20",
      borderColor: templateStyles.primaryColor + "60",
      color: templateStyles.primaryColor,
    },
    socialLink: {
      ...styles.socialLink,
      color: templateStyles.primaryColor,
    },
    projectLink: {
      ...styles.projectLink,
      color: templateStyles.primaryColor,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.card} wrap>
          <View style={dynamicStyles.header}>
            <View style={styles.nameRoleWrap}>
              <Text style={dynamicStyles.name}>{safeName || "Your Name"}</Text>
              {derivedHeadline && <Text style={styles.headline}>{derivedHeadline}</Text>}
              {contactEntries.length > 0 && (
                <View style={styles.contactRow}>
                  {contactEntries.map((entry) => (
                    <View key={entry.label} style={dynamicStyles.contactChip}>
                      <Text style={{ fontSize: 10, fontWeight: 500, color: templateStyles.primaryColor }}>
                        {`${entry.label}: ${entry.value}`}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              {socialLinks.length > 0 && (
                <View style={styles.socialRow}>
                  {socialLinks.map((item) => (
                    <Link
                      key={item.label}
                      style={dynamicStyles.socialLink}
                      src={item.value.startsWith("http") ? item.value : `https://${item.value}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </View>
              )}
            </View>
            {profile.avatar ? (
              <Image 
                style={styles.avatar} 
                src={profile.avatar}
                cache={false}
              />
            ) : null}
          </View>

          {displayBio && (
            <View style={styles.section} wrap={false}>
              <View style={styles.sectionHeadingContainer}>
                <View style={dynamicStyles.sectionHeadingLine} />
                <Text style={dynamicStyles.sectionHeading}>Professional Summary</Text>
              </View>
              <Text style={styles.summaryText}>{displayBio}</Text>
            </View>
          )}

          {responsibilities.length > 0 && (
            <View style={styles.section} wrap>
              <View style={styles.sectionHeadingContainer}>
                <View style={dynamicStyles.sectionHeadingLine} />
                <Text style={dynamicStyles.sectionHeading}>Key Responsibilities</Text>
              </View>
              <BulletList items={responsibilities} />
            </View>
          )}

          {skills.length > 0 && (
            <View style={styles.section} wrap>
              <View style={styles.sectionHeadingContainer}>
                <View style={styles.sectionHeadingLine} />
                <Text style={styles.sectionHeading}>Skills & Technologies</Text>
              </View>
              <View style={styles.skillWrap}>
                {skills.map((skill) => (
                  <View key={skill} style={dynamicStyles.skillChip}>
                    <Text style={{ fontSize: 10, fontWeight: 600, color: templateStyles.primaryColor }}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {experience.length > 0 && (
            <View style={styles.section} wrap>
              <View style={styles.sectionHeadingContainer}>
                <View style={dynamicStyles.sectionHeadingLine} />
                <Text style={dynamicStyles.sectionHeading}>Professional Experience</Text>
              </View>
              <Timeline items={experience} templateStyles={templateStyles} dynamicStyles={dynamicStyles} />
            </View>
          )}

          {education.length > 0 && (
            <View style={styles.section} wrap>
              <View style={styles.sectionHeadingContainer}>
                <View style={dynamicStyles.sectionHeadingLine} />
                <Text style={dynamicStyles.sectionHeading}>Education</Text>
              </View>
              <Timeline items={education} templateStyles={templateStyles} dynamicStyles={dynamicStyles} />
            </View>
          )}

          {projects.length > 0 && (
            <View style={styles.section} wrap>
              <View style={styles.sectionHeadingContainer}>
                <View style={dynamicStyles.sectionHeadingLine} />
                <Text style={dynamicStyles.sectionHeading}>Projects</Text>
              </View>
              <Projects items={projects} templateStyles={templateStyles} dynamicStyles={dynamicStyles} />
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default PortfolioPdf;
