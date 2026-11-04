export const PROFILE = {
  name: 'Younes Berebia',
  role: 'Junior Full Stack Java Developer',
  email: 'berebiayounes@gmail.com',
  github: 'https://github.com/yunsBRB',
  linkedin: 'https://www.linkedin.com/in/younesberebia/',
  resume: 'assets/documents/resume.pdf',
};
export const APPS = {
  about: {
    name: 'About me',
    file: 'Welcome.txt',
    icon: 'i',
    kind: 'about',
    hint: 'The person behind the keyboard',
    object: 'The wall screen',
  },
  projects: {
    name: 'Projects',
    file: 'My projects',
    icon: '▰',
    kind: 'folder',
    hint: 'Things I build, one step at a time',
    object: 'The laptop',
  },
  stack: {
    name: 'Skills',
    file: 'My toolbox',
    icon: '⌘',
    kind: 'stack',
    hint: 'Tools, foundations and what comes next',
    object: 'The books',
  },
  journey: {
    name: 'My journey',
    file: 'My journey',
    icon: '↗',
    kind: 'journey',
    hint: 'Belgium, Montréal and a new direction',
    object: 'The postcards',
  },
  resume: {
    name: 'Résumé',
    file: 'Résumé.pdf',
    icon: 'PDF',
    kind: 'resume',
    hint: 'A short profile and the original PDF',
    object: 'The folder',
  },
  security: {
    name: 'Security lab',
    file: 'LogSentry demo',
    icon: '◇',
    kind: 'security',
    hint: 'Spot patterns in sample login logs',
    object: 'The small server',
  },
  terminal: {
    name: 'Terminal',
    file: 'Terminal',
    icon: '>_',
    kind: 'terminal',
    hint: 'A few commands to get to know me',
    object: 'Inside YUNS OS',
  },
  game: {
    name: '2048',
    file: '2048',
    icon: '2048',
    kind: 'game',
    hint: 'A little break between builds',
    object: 'The controller',
  },
  contact: {
    name: 'Contact',
    file: 'Say hello',
    icon: '@',
    kind: 'contact',
    hint: 'Email, GitHub and LinkedIn',
    object: 'The phone',
  },
  guide: {
    name: 'A little guide',
    file: 'Read me first',
    icon: '?',
    kind: 'about',
    hint: 'Find your way around my space',
    object: 'The arch',
  },
};
export const PROJECTS = [
  {
    id: 'consent',
    name: 'yomoConsent',
    category: 'Java',
    state: 'Local prototype',
    stack: ['Java', 'Spring Boot', 'PostgreSQL', 'Flyway'],
    summary:
      'A Java backend that records consent and checks which contacts can be included in a campaign.',
    url: 'https://github.com/yunsBRB/myPersonal-projects/tree/main/java/yomoConsent',
    need: 'An email address alone does not establish permission to send a campaign. The application keeps consent separate for each purpose.',
    features: [
      'Pending, confirmed and withdrawn consent states.',
      'Single-use confirmation tokens with a 24-hour expiry.',
      'Encrypted email storage and hashed tokens.',
      'Audience previews that exclude contacts without valid consent.',
    ],
    limit:
      'A local prototype under development. It is not a production marketing platform or a guarantee of legal compliance.',
  },
  {
    id: 'protect',
    name: 'yomoProtect',
    category: 'Security',
    state: 'Prototype',
    stack: ['Odoo', 'Python', 'Owl', 'PostgreSQL'],
    summary:
      'An Odoo module for reviewing supplier payment requests with an explainable risk score.',
    url: 'https://github.com/yunsBRB/myPersonal-projects/tree/main/odoo/yomoProtect',
    need: 'A payment review should make its reasoning visible, particularly when supplier details, amounts or timing appear unusual.',
    features: [
      'Risk rules based on beneficiary details, amount, history and timing.',
      'Independent review for requests with a score of 50 or more.',
      'Access rules and traceable review decisions.',
      'A workflow built around existing Odoo suppliers and bank accounts.',
    ],
    limit: 'A review prototype. It does not connect to a bank or block accounting payments.',
  },
  {
    id: 'logsentry',
    name: 'LogSentry',
    category: 'Security',
    state: 'Local tool',
    stack: ['Python', 'CSV', 'HTML / JSON', 'unittest'],
    summary:
      'A Python tool that reads login records from a CSV file and reports repeated failures.',
    url: 'https://github.com/yunsBRB/myPersonal-projects/tree/main/python/logsentry',
    need: 'A small set of login records can be difficult to review by eye. This tool looks for defined patterns and exports a readable report.',
    features: [
      'Configurable failure threshold and time window.',
      'Detection of successful logins following repeated failures.',
      'Terminal, HTML and JSON reports.',
      'Unit tests for the detection rules.',
    ],
    limit:
      'A local CSV analysis tool, not live monitoring. An alert is a pattern to review, not evidence that an intrusion occurred.',
  },
  {
    id: 'pokedex',
    name: 'Pokédex',
    category: 'Angular',
    state: 'Training project',
    stack: ['Angular', 'TypeScript', 'REST API', 'HTML / CSS'],
    summary: 'An Angular exercise for browsing Pokémon data from an API.',
    url: 'https://github.com/yunsBRB/mySchool-projects/tree/main/angular/pokedex',
    need: 'Turn data from an external API into a small, understandable interface while practising Angular fundamentals.',
    features: [
      'Component-based interface and routing.',
      'Typed API data and service-based fetching.',
      'A Pokémon list and detail views.',
      'A deliberately focused interface.',
    ],
    limit:
      'A learning project. Its purpose is to practise Angular and explain the code and decisions behind a small application.',
  },
];
export const STACK = [
  {
    title: 'Backend & data',
    tags: ['Java', 'Spring Boot', 'Hibernate', 'REST APIs', 'SQL', 'PostgreSQL'],
    text: 'My main training path: modelling data, separating responsibilities and building APIs with clear business rules.',
  },
  {
    title: 'Frontend',
    tags: ['Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS'],
    text: 'Components, routing, API integration and interfaces that make the next action easy to understand.',
  },
  {
    title: 'Tools & workflow',
    tags: ['Git / GitHub', 'Docker', 'Maven', 'WebStorm', 'PowerShell'],
    text: 'Versioning, local environments and repeatable workflows. Kubernetes is part of my current learning.',
  },
  {
    title: 'Security mindset',
    tags: ['Access control', 'Consent lifecycle', 'Data protection', 'Log analysis'],
    text: 'Learning to consider permissions, data exposure and traceability alongside the feature itself.',
  },
];
export const JOURNEY = [
  {
    date: '2018–2024',
    title: 'Marketing & management',
    text: 'Marketing at HEPH Condorcet, followed by management studies at UMONS. A foundation in understanding needs, working with data and connecting decisions to business goals.',
  },
  {
    date: '2025–2026',
    title: 'A chapter in Montréal',
    text: 'A working-holiday experience in Canada: more independence, conversations in English and exposure to the local technology community, including talks at McGill.',
  },
  {
    date: 'APR–JUN 2026',
    title: 'Building the foundations',
    text: 'Essentials4IT at Technofutur TIC: C#/.NET, object-oriented programming, algorithms, databases and web fundamentals.',
  },
  {
    date: 'JUN–DEC 2026',
    title: 'Full Stack Java, with security in mind',
    text: 'Currently training at Technofutur TIC in Java, Spring Boot, Angular, PostgreSQL, REST APIs and application security. Completion is planned for December 2026.',
  },
  {
    date: 'NEXT',
    title: 'A first role, and room to grow',
    text: 'Looking for a junior development opportunity, with openness to an internship. Curious about application security, cloud and AI, while continuing to strengthen the fundamentals.',
  },
];

Object.assign(APPS, {
  arcade: {
    name: 'Games',
    file: 'Games',
    icon: '▸',
    kind: 'game',
    hint: '2048 and Tetris',
    object: 'The laptop',
  },
  tetris: {
    name: 'Tetris',
    file: 'Tetris',
    icon: '▦',
    kind: 'game',
    hint: 'A falling-block puzzle',
    object: 'Inside Games',
  },
  interests: {
    name: 'Outside coding',
    file: 'Outside coding',
    icon: '◦',
    kind: 'about',
    hint: 'Basketball, puzzles and anime',
    object: 'A few objects in the room',
  },
  basketball: {
    name: 'Basketball',
    file: 'Basketball',
    icon: '○',
    kind: 'about',
    hint: 'Teamwork, communication and consistency',
    object: 'The basketball',
  },
  cube: {
    name: 'Rubik’s Cube',
    file: 'Rubik’s Cube',
    icon: '▧',
    kind: 'about',
    hint: 'Breaking a problem into smaller steps',
    object: 'The cube',
  },
  anime: {
    name: 'Anime',
    file: 'Anime',
    icon: '✳',
    kind: 'about',
    hint: 'A personal interest in anime',
    object: 'The One Piece poster',
  },
  boxing: {
    name: 'Muhammad Ali',
    file: 'Muhammad Ali',
    icon: '◇',
    kind: 'about',
    hint: 'Determination and persistence',
    object: 'The boxing poster',
  },
});

Object.assign(APPS.about, { hint: 'Profile and current training', file: 'About.txt' });
Object.assign(APPS.projects, { hint: 'Personal and training projects', file: 'Projects' });
Object.assign(APPS.stack, { hint: 'Technologies I use', file: 'Skills' });
Object.assign(APPS.guide, { name: 'Help', file: 'Help', hint: 'Objects, controls and shortcuts' });
