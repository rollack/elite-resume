import { ResumeData } from "./types";

export const mockResumes: ResumeData[] = [
  {
    personalInfo: {
      fullName: "Alex Rivera",
      email: "alex.rivera@example.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      website: "alexrivera.dev",
      linkedin: "linkedin.com/in/alexrivera",
      github: "github.com/arivera",
      title: "Senior Full Stack Engineer",
    },
    summary: "Dynamic Full Stack Engineer with 8+ years of experience building scalable web applications. Expert in React, Node.js, and cloud architecture. Proven track record of leading cross-functional teams and delivering high-impact features that improve user engagement by 40%.",
    experience: [
      {
        id: "1",
        company: "TechFlow Systems",
        position: "Senior Software Engineer",
        location: "San Francisco, CA",
        startDate: "2020-01",
        endDate: "Present",
        current: true,
        description: "Leading the core platform team in architecting a microservices-based infrastructure.",
        bullets: [
          "Spearheaded the migration from a monolithic architecture to AWS microservices, reducing deployment time by 60%.",
          "Optimized database queries in PostgreSQL, resulting in a 30% improvement in API response times.",
          "Mentored a team of 5 junior developers, fostering a culture of code quality and continuous learning."
        ]
      },
      {
        id: "2",
        company: "Innovate AI",
        position: "Full Stack Developer",
        location: "Austin, TX",
        startDate: "2017-06",
        endDate: "2019-12",
        current: false,
        description: "Developed and maintained customer-facing dashboards using React and Redux.",
        bullets: [
          "Implemented real-time data visualization components using D3.js, enhancing user data analysis capabilities.",
          "Reduced frontend bundle size by 45% through code splitting and lazy loading techniques.",
          "Collaborated with UX designers to implement a responsive design system used across 3 major products."
        ]
      }
    ],
    education: [
      {
        id: "e1",
        school: "Stanford University",
        degree: "B.S. in Computer Science",
        location: "Stanford, CA",
        startDate: "2013-09",
        endDate: "2017-05",
        gpa: "3.8"
      }
    ],
    skills: ["React", "TypeScript", "Node.js", "AWS", "PostgreSQL", "Docker", "GraphQL", "System Design"],
    projects: [
      {
        id: "p1",
        name: "CloudScale Analytics",
        description: "An open-source analytics engine for tracking cloud resource utilization in real-time.",
        technologies: ["Go", "React", "InfluxDB", "Kubernetes"]
      }
    ],
    certifications: [
      {
        id: "c1",
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        date: "2021-08"
      }
    ],
    languages: ["English (Native)", "Spanish (Fluent)"],
    auditSuggestions: []
  },
  {
    personalInfo: {
      fullName: "Sarah Chen",
      email: "sarah.chen@design.io",
      phone: "+1 (555) 987-6543",
      location: "New York, NY",
      website: "sarahchen.design",
      linkedin: "linkedin.com/in/sarahchendesign",
      github: "github.com/schen-ui",
      title: "Product Designer",
    },
    summary: "User-centric Product Designer with a passion for creating intuitive and accessible digital experiences. 6 years of experience in mobile and web design, specializing in design systems and rapid prototyping. Committed to bridging the gap between user needs and business goals.",
    experience: [
      {
        id: "1",
        company: "Creative Pulse",
        position: "Lead Product Designer",
        location: "New York, NY",
        startDate: "2021-03",
        endDate: "Present",
        current: true,
        description: "Overseeing the end-to-end design process for a leading fitness application.",
        bullets: [
          "Redesigned the onboarding flow, increasing user retention by 25% within the first 3 months.",
          "Established a comprehensive design system in Figma, reducing design-to-development handoff time by 40%.",
          "Conducted over 50 user research sessions to inform product roadmap and feature prioritization."
        ]
      }
    ],
    education: [
      {
        id: "e1",
        school: "Rhode Island School of Design",
        degree: "B.F.A. in Graphic Design",
        location: "Providence, RI",
        startDate: "2012-09",
        endDate: "2016-05"
      }
    ],
    skills: ["UI/UX Design", "Figma", "Prototyping", "User Research", "Design Systems", "HTML/CSS", "Adobe Creative Suite"],
    projects: [
      {
        id: "p1",
        name: "EcoTrack App",
        description: "A mobile application designed to help users track and reduce their carbon footprint through daily tasks.",
        technologies: ["Figma", "React Native", "Firebase"]
      }
    ],
    certifications: [
      {
        id: "c1",
        name: "Google UX Design Professional Certificate",
        issuer: "Coursera",
        date: "2020-11"
      }
    ],
    languages: ["English (Native)", "Mandarin (Conversational)"],
    auditSuggestions: []
  }
];
