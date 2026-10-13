# Profile

<!--
This file is the RAG source the chatbot answers from — it is read server-side
only (see src/server/chat.ts) and is never shipped to the browser.
-->

## About

Jose Wilfredo Salapantan Narvaez ("Jolo") — Software Engineer based in Metro Manila, Philippines.

- Email: jolonarvaez@icloud.com
- GitHub: github.com/jolonarvaez
- LinkedIn: linkedin.com/in/jolo-narvaez/

## Technical Skills

- **Languages:** JavaScript, TypeScript, HTML/CSS, Java, Kotlin, Python
- **Frontend:** React, Next.js, Lit/LitHTML, WCAG Accessibility
- **Testing & Tooling:** Cypress, Storybook, CI/CD, Git, Sentry, Grafana, Checkmarx, GitHub Copilot, Claude

## Education

**Master of Data Science** (upcoming)
University of Queensland · Starting 2027

**Bachelor of Science in Computer Science, Specialization in Software Technology**
De La Salle University – Manila · 09/2019 – 12/2023 · 
Thesis: *Game-Based Learning as a Tool to Support the Achievement of Learning Outcomes in Physical Education*

## Work Experience

### ING Hubs B.V. Philippines Branch — Web Engineer (Engineer II)
Makati, PH · 01/2024 – Present

- Developed and shipped customer-facing and admin tools for ING's banking platform across five European markets, using LitHTML, JavaScript, and Azure Pipelines. Key features included a Progressive Disclosure service page, Branch Locator, and an A/B Experiment Dashboard that let Product Owners manage experiments independently.
- Led accessibility engineering as the squad's advocate, running accessibility assessments across 8 microfrontend assets to WCAG 2.1 AA standards and embedding accessibility testing plans and tooling in CI/CD pipelines.
- Monitored application health and release stability across 8 microfrontend repositories using Grafana and Sentry, surfacing post-deploy regressions in error rates and API latency within 24 hours.
- Triaged and remediated application vulnerabilities via Checkmarx SAST/SCA scans, maintaining zero open high/critical issues over 2 years.
- Demonstrated proactive risk management, controlled production execution, and rapid resolution of critical P1 and P2 incidents using ServiceNow across 100+ production releases.
- Coordinated ING's internship program end-to-end: conducted semi-annual technical interviews and mentored 3 interns throughout the program, all of whom converted to full-time roles.
- Tech stack: LitHTML, HTML, CSS, JavaScript, JSON, YAML, Cypress
- Tools/frameworks: Azure DevOps, Confluence, Microsoft Teams, ServiceNow, Grafana, Sentry, Checkmarx

### Infor PSSC Inc. — Quality Assurance Intern
Taguig, PH · 09/2023 – 12/2023

- Executed functional and regression testing for an enterprise content management application across multiple deployment environments, authored test cases in Zephyr, and tracked defects through resolution in Jira.
- Reproduced and characterized reported defects with product teams, contributing to sprint planning and retrospectives throughout a four-month engagement.

### D.W. Morgan — Frontend Software Engineer Intern
Remote · 11/2021 – 02/2022

- Diagnosed and resolved defects in production supply-chain applications, working with cross-functional operations and engineering teams to eliminate recurring downtime.
- Contributed to code and design reviews across six sprints, catching frontend defects before release and following team conventions on an existing codebase.

## Talks and Community

- **Workshop Speaker**, SOFTCON 2025 (Philippine Software Industry Association) — "Building a More Inclusive World: A Web and Mobile Accessibility Overview" (October 2025)
- **Panel Speaker**, Internship Placement Services: Company Talk 2024 (Computer Studies Government, De La Salle University – Manila) — represented ING Hubs B.V. Philippines (July 2024)

## Projects

### Function Finder — Full-Stack DJ-Centric Event Discovery Platform
01/2026 – Present
Tech stack: Kotlin/Spring Boot, Next.js/TypeScript, Supabase (Postgres/Auth), MapLibre GL, GitHub Actions, Cypress

- Developed a full-stack platform with a Kotlin/Spring Boot REST API and a Next.js 16/React 19 frontend, using Supabase Postgres RLS for database-enforced authorization and per-token/IP rate limiting to protect endpoints.
- Integrated a custom interactive map feature (MapLibre GL) with clustering, live markers, Google Maps geocoding, and multi-role (DJ/host/event-goer) routing and permissions sharing a single component set.
- Utilized state management (Zustand), a typed REST service layer with JWT auth interceptors, and a themeable shadcn/ui + Tailwind design system; used Dependabot for automated dependency vulnerability management.
- Built a multi-step event creation/editing flow with image upload to Supabase Storage and multi-performer lineup management, backed by documented API contracts (data models, schema, endpoints) for cross-team reference.

### Real-Time Pose Classification for Gamified Fitness Training (Thesis)
01/2023 – 12/2023
Tech stack: C#, Python, Unity, MediaPipe, OpenCV, scikit-learn

- Built a real-time pose-classification pipeline in Python for gamified exercise form assessment. Extracted body landmarks with MediaPipe BlazePose, engineered feature vectors from pairwise joint distances and angles, and trained a k-NN classifier over 15 static exercise poses.
- Validated via a 3-week, 40-student quasi-experiment (Wilcoxon signed-rank): significant gains in form scores (70.1 → 78.7) and isometric endurance (+39–49%); traced classifier false positives to self-occlusion in prone/lateral poses; game design validated with MEEGA+ (θ = 65.5, "excellent quality").

## Personal Interests

- Gym, tennis, badminton, and pickleball
- Watching basketball and staying up to date with UAAP basketball
