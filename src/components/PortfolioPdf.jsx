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
    alignItems: "center",
    marginBottom: 18,
  },
  nameRoleWrap: {
    flexDirection: "column",
    maxWidth: "72%",
  },
  name: {
    fontSize: 26,
    fontWeight: 700,
    color: "#1f2937",
  },
  headline: {
    fontSize: 13,
    fontWeight: 500,
    marginTop: 4,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  contactChip: {
    backgroundColor: "#e0f2fe",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    marginTop: 6,
    fontSize: 10,
    fontWeight: 500,
    color: "#1e3a8a",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    border: "2 solid #e2e8f0",
  },
  section: {
    marginTop: 18,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1f2937",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 11,
    color: "#334155",
  },
  bulletList: {
    marginTop: 6,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  bullet: {
    width: 6,
    fontWeight: 700,
    color: "#2563eb",
  },
  bulletContent: {
    flex: 1,
    fontSize: 11,
    color: "#334155",
  },
  skillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  skillChip: {
    backgroundColor: "#e0f2fe",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    marginTop: 6,
    fontSize: 10,
    fontWeight: 500,
    color: "#1e3a8a",
  },
  timelineWrap: {
    flexDirection: "column",
    gap: 10,
  },
  timelineItem: {
    borderLeft: "2 solid #60a5fa",
    paddingLeft: 10,
    marginBottom: 10,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  },
  projectCard: {
    border: "1 solid #e2e8f0",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  projectTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#1f2937",
  },
  projectLink: {
    fontSize: 10,
    color: "#2563eb",
    textDecoration: "none",
  },
  projectDescription: {
    marginTop: 4,
    fontSize: 11,
    color: "#334155",
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  tag: {
    backgroundColor: "#e0f2fe",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginTop: 4,
    fontSize: 9,
    color: "#1e3a8a",
  },
  socialRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  socialLink: {
    marginRight: 10,
    marginTop: 4,
    fontSize: 10,
    color: "#2563eb",
    textDecoration: "none",
  },
});

const BulletList = ({ items = [] }) => (
  <View style={styles.bulletList}>
    {items.map((text, index) => (
      <View key={`${text}-${index}`} style={styles.bulletItem}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.bulletContent}>{text}</Text>
      </View>
    ))}
  </View>
);

const Timeline = ({ items = [] }) => (
  <View style={styles.timelineWrap}>
    {items.map((item, index) => (
      <View key={`${item.id || index}`} style={styles.timelineItem}>
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

const Projects = ({ items = [] }) => (
  <View>
    {items.map((project, index) => (
      <View key={`${project.id || index}`} style={styles.projectCard}>
        <View style={styles.projectHeader}>
          <Text style={styles.projectTitle}>{project.title || "Project"}</Text>
          {project.link && (
            <Link src={project.link.startsWith("http") ? project.link : `https://${project.link}`} style={styles.projectLink}>
              {project.link}
            </Link>
          )}
        </View>
        {project.description && (
          <Text style={styles.projectDescription}>{project.description}</Text>
        )}
        {Array.isArray(project.tags) && project.tags.length > 0 && (
          <View style={styles.tagWrap}>
            {project.tags.map((tag) => (
              <Text key={tag} style={styles.tag}>{tag}</Text>
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
  } = data || {};

  const derivedHeadline = safeHeadline || professionTitle || "";

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.card} wrap>
          <View style={styles.header}>
            <View style={styles.nameRoleWrap}>
              <Text style={styles.name}>{safeName || "Your Name"}</Text>
              <Text style={styles.headline}>{derivedHeadline}</Text>
              {contactEntries.length > 0 && (
                <View style={styles.contactRow}>
                  {contactEntries.map((entry) => (
                    <Text key={entry.label} style={styles.contactChip}>
                      {`${entry.label}: ${entry.value}`}
                    </Text>
                  ))}
                </View>
              )}
              {socialLinks.length > 0 && (
                <View style={styles.socialRow}>
                  {socialLinks.map((item) => (
                    <Link
                      key={item.label}
                      style={styles.socialLink}
                      src={item.value.startsWith("http") ? item.value : `https://${item.value}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </View>
              )}
            </View>
            {profile.avatar ? (
              <Image style={styles.avatar} src={profile.avatar} />
            ) : null}
          </View>

          {displayBio && (
            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionHeading}>Professional Summary</Text>
              <Text style={styles.summaryText}>{displayBio}</Text>
            </View>
          )}

          {responsibilities.length > 0 && (
            <View style={styles.section} wrap>
              <Text style={styles.sectionHeading}>Key Responsibilities</Text>
              <BulletList items={responsibilities} />
            </View>
          )}

          {skills.length > 0 && (
            <View style={styles.section} wrap>
              <Text style={styles.sectionHeading}>Skills & Technologies</Text>
              <View style={styles.skillWrap}>
                {skills.map((skill) => (
                  <Text key={skill} style={styles.skillChip}>{skill}</Text>
                ))}
              </View>
            </View>
          )}

          {experience.length > 0 && (
            <View style={styles.section} wrap>
              <Text style={styles.sectionHeading}>Professional Experience</Text>
              <Timeline items={experience} />
            </View>
          )}

          {education.length > 0 && (
            <View style={styles.section} wrap>
              <Text style={styles.sectionHeading}>Education</Text>
              <Timeline items={education} />
            </View>
          )}

          {projects.length > 0 && (
            <View style={styles.section} wrap>
              <Text style={styles.sectionHeading}>Projects</Text>
              <Projects items={projects} />
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default PortfolioPdf;
