import { PROJECTS } from './content.js';

const caseStudies = {
  consent: {
    discipline: 'Java / Business applications',
    caption: 'Consent, as a lifecycle.',
    approach:
      'Keep consent separate from the contact record. Make confirmation, withdrawal and audience eligibility explicit business rules.',
    flow: ['REST API', 'Consent rules', 'PostgreSQL'],
    focus: 'Business rules, token handling and data protection.',
  },
  protect: {
    discipline: 'Odoo / Application security',
    caption: 'A payment deserves a second look.',
    approach:
      'Fit the review into an existing Odoo workflow. Show which rules contribute to a risk score and keep an independent review step.',
    flow: ['Payment request', 'Risk rules', 'Independent review'],
    focus: 'Explainable decisions, access rules and traceability.',
  },
  logsentry: {
    discipline: 'Python / Security tooling',
    caption: 'Small signals. Clearer review.',
    approach:
      'Start with a local CSV file and a small set of deterministic rules. Group events by IP and username, then export findings for a person to review.',
    flow: ['CSV records', 'Detection rules', 'HTML / JSON report'],
    focus: 'Time windows, repeatable analysis and clear limits.',
    demo: 'logsentry',
  },
  pokedex: {
    discipline: 'Angular / Frontend learning',
    caption: 'An API, made browsable.',
    approach:
      'Use a focused browsing interface to practise components, typed services, routing and API integration.',
    flow: ['Angular views', 'Typed service', 'REST API'],
    focus: 'Components, data flow and a deliberately small interface.',
  },
};

export const PLANNED_PROJECTS = [
  {
    id: 'devcontrol',
    name: 'DevControl',
    category: 'Java',
    state: 'Planned',
    planned: true,
    priority: 'High priority',
    discipline: 'Developer tools / Local environments',
    caption: 'One place for local applications.',
    stack: ['Java', 'Spring Boot', 'Angular', 'Docker'],
    summary: 'A dashboard to start, stop and monitor Java applications and Docker containers.',
    need: 'Switching between terminals makes it harder to see which local services are running and where a problem started.',
    approach:
      'Begin with a read-only inventory and log viewer. Add controlled start and stop actions once the monitoring flow is useful.',
    features: [
      'An overview of registered applications and containers.',
      'Application and container start / stop controls.',
      'A log viewer with filters and a clear service status.',
      'Alerts for failed starts or stopped services.',
    ],
    flow: ['Angular dashboard', 'Spring Boot API', 'Local services / Docker'],
    focus: 'Planned: authenticated controls, approved services and an action history.',
    milestone: 'List registered services and read their status and recent logs.',
    limit: 'A project concept. The dashboard, Docker controls and alerts have not been built yet.',
  },
  {
    id: 'leavepilot',
    name: 'LeavePilot SaaS',
    category: 'Java',
    state: 'Planned',
    planned: true,
    discipline: 'Business applications / Scheduling',
    caption: 'Find time that works for both.',
    stack: ['Java', 'Spring Boot', 'Angular', 'PostgreSQL'],
    summary: 'Leave planning with shared availability, user roles and crossed calendars.',
    need: 'Two people can have different days off, constraints and available leave. Finding a shared period should be easier than comparing calendars by hand.',
    approach:
      'Start with two calendars on one page. Compare available dates for friends, family, colleagues or partners, then build the account and leave-management workflow.',
    features: [
      'A shared view of two calendars in Mode Ensemble.',
      'Calculation of common available periods.',
      'User roles and leave-request workflows.',
      'A before / after view of a proposed leave plan.',
    ],
    flow: ['Two calendars', 'Availability rules', 'Common periods'],
    focus: 'Planned: calendar-sharing permissions and clear access boundaries.',
    milestone: 'Enter two calendars and calculate their common available dates.',
    limit:
      'A planned evolution of an idea. There is no deployed SaaS or completed leave-management system.',
  },
  {
    id: 'logsentry-ai',
    name: 'LogSentry AI',
    category: 'Security',
    state: 'Planned',
    planned: true,
    discipline: 'Application security / Assisted analysis',
    caption: 'Explain the alert. Keep the decision human.',
    stack: ['Spring Boot', 'Angular', 'PostgreSQL', 'Python'],
    summary: 'A web interface and assisted alert summaries around the existing LogSentry analyzer.',
    need: 'A report can identify a pattern without making the next review step clear. A web view could help group alerts and explain their context.',
    approach:
      'Start by displaying exported LogSentry reports. Add rule-based alert classification, then evaluate an AI summary that supports human review.',
    features: [
      'A web interface for existing analysis reports.',
      'Alert classification with visible detection rules.',
      'An AI-assisted summary, clearly identified as generated.',
      'Human review and decisions outside the model.',
    ],
    flow: ['LogSentry report', 'Web review', 'Assisted summary'],
    focus: 'Planned: minimize data sent to a model and keep security decisions with the reviewer.',
    milestone: 'Import and display a real LogSentry report before adding AI.',
    limit:
      'A proposed extension. The existing CSV analyzer works locally; the web interface and AI integration are not implemented. The AI provider is still to be evaluated.',
    related: 'logsentry',
  },
];

export const PORTFOLIO_PROJECTS = [
  ...PROJECTS.map((project) => ({
    ...project,
    ...caseStudies[project.id],
    planned: false,
  })),
  ...PLANNED_PROJECTS,
];

export function selectPortfolioProjects(filter = 'all') {
  if (filter === 'current') return PORTFOLIO_PROJECTS.filter((project) => !project.planned);
  if (filter === 'planned') return PORTFOLIO_PROJECTS.filter((project) => project.planned);
  return PORTFOLIO_PROJECTS;
}

export function findPortfolioProject(id) {
  return PORTFOLIO_PROJECTS.find((project) => project.id === id) ?? null;
}
