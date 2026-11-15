import { PROFILE, STACK } from './content.js';
import { analyzeLogins, sampleLogins } from './engines.js';
import {
  PORTFOLIO_PROJECTS,
  findPortfolioProject,
  selectPortfolioProjects,
} from './portfolio-data.js';

const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]
  );

const arrowIcon = /* HTML */ `<svg
  class="pf-arrow"
  viewBox="0 0 16 16"
  aria-hidden="true"
  focusable="false"
>
  <path d="M4 12 12 4M4 4h8v8" fill="none" stroke="currentColor" stroke-width="1.3" />
</svg>`;

const sourceLink = (url, label, className = 'pf-text-link') => /* HTML */ `
  <a class="${className}" href="${escape(url)}" target="_blank" rel="noopener noreferrer">
    ${escape(label)} ${arrowIcon}
  </a>
`;

const routeButton = (route, label, className = 'pf-button') => /* HTML */ `
  <button type="button" class="${className}" data-pf-route="${escape(route)}">
    ${label.replaceAll('↗', arrowIcon)}
  </button>
`;

function badge(project) {
  return /* HTML */ `<span class="pf-badge ${project.planned ? 'pf-badge--planned' : ''}">
    ${escape(project.state)}
  </span>`;
}

function preview(project) {
  const drawings = {
    consent: /* HTML */ `
      <div class="pf-lifecycle">
        <span><i></i>Pending</span><b aria-hidden="true">→</b>
        <span class="pf-confirmed"><i></i>Confirmed</span><b aria-hidden="true">→</b>
        <span><i></i>Withdrawn</span>
      </div>
      <div class="pf-preview-line"><span>Permission has a lifecycle.</span><i>✓</i></div>
    `,
    protect: /* HTML */ `
      <div class="pf-review-sheet">
        <div><span>Payment request</span><span class="pf-mini-pill">Review</span></div>
        <span class="pf-line pf-line--long"></span><span class="pf-line"></span>
        <footer><span>Independent approval</span><b aria-hidden="true">↗</b></footer>
      </div>
    `,
    logsentry: /* HTML */ `
      <div class="pf-log-lines">
        <span>09:01 <i>failed</i></span
        ><span>09:02 <i>failed</i></span> <span>09:03 <i>failed</i></span
        ><span>09:05 <b>review</b></span>
      </div>
      <div class="pf-signal">
        <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
    `,
    pokedex: /* HTML */ `
      <div class="pf-poke-browser">
        <span class="pf-poke-ball"></span>
        <div>
          <span class="pf-line pf-line--long"></span><span class="pf-line"></span>
          <span class="pf-mini-pill">List → Detail</span>
        </div>
      </div>
    `,
    devcontrol: /* HTML */ `
      <div class="pf-console">
        <span><i></i> Java application <b>—</b></span> <span><i></i> PostgreSQL <b>—</b></span
        ><span><i></i> Docker <b>—</b></span>
      </div>
      <span class="pf-concept-label">Proposed console</span>
    `,
    leavepilot: /* HTML */ `
      <div class="pf-calendars">
        ${[0, 1]
          .map(
            (calendar) => /* HTML */ `
              <div>
                <span>Calendar ${calendar + 1}</span>
                <div class="pf-calendar-grid">
                  ${Array.from({ length: 14 }, (_, day) => `<i class="${[4, 5, 11, 12].includes(day) ? 'pf-common-day' : ''}"></i>`).join('')}
                </div>
              </div>
            `
          )
          .join('')}
      </div>
      <span class="pf-concept-label">Shared availability · concept</span>
    `,
    'logsentry-ai': /* HTML */ `
      <div class="pf-ai-sheet">
        <span>Detection rules</span><b aria-hidden="true">↓</b> <span>Assisted summary</span
        ><b aria-hidden="true">↓</b><strong>Human review</strong>
      </div>
    `,
  };
  return /* HTML */ `
    <div class="pf-preview pf-preview--${project.id}" aria-hidden="true">
      <div class="pf-preview-top"><span>${escape(project.name)}</span><span>● ● ●</span></div>
      <div class="pf-preview-drawing">${drawings[project.id] || ''}</div>
      <span class="pf-preview-caption">${escape(project.caption)}</span>
    </div>
  `;
}

function projectCard(project, index) {
  return /* HTML */ `
    <button
      type="button"
      class="pf-project"
      data-pf-route="project/${project.id}"
      aria-label="Open ${escape(project.name)} ${project.planned ? 'planned project' : 'case study'}"
    >
      ${preview(project)}
      <div class="pf-project-copy">
        <div class="pf-project-top">
          <span class="pf-index">${String(index + 1).padStart(2, '0')}</span>${badge(project)}
        </div>
        <h3>${escape(project.name)}</h3>
        <p>${escape(project.summary)}</p>
        <span class="pf-stack-line">${project.stack.slice(0, 3).map(escape).join(' / ')}</span>
        <span class="pf-project-action"
          >${project.planned ? 'Explore the plan' : 'Read case study'}
          <span aria-hidden="true">↗</span></span
        >
      </div>
    </button>
  `;
}

function projectGroup(title, note, projects) {
  if (!projects.length) return '';
  return /* HTML */ `
    <section class="pf-project-group" aria-label="${escape(title)}">
      <div class="pf-section-heading">
        <h2>${title}<sup>${String(projects.length).padStart(2, '0')}</sup></h2>
        <p>${note}</p>
      </div>
      <div class="pf-project-list">${projects.map(projectCard).join('')}</div>
    </section>
  `;
}

function workPage(state) {
  const projects = selectPortfolioProjects(state.filter);
  const current = projects.filter((project) => !project.planned);
  const planned = projects.filter((project) => project.planned);
  return /* HTML */ `
    <section class="pf-hero">
      <p class="pf-kicker">JAVA FULL STACK / BELGIUM</p>
      <h1 data-pf-heading tabindex="-1">Younes Berebia<span>.</span></h1>
      <div class="pf-hero-bottom">
        <p>
          A background in business. A focus on software.<br />Currently building with Java, Angular
          and security in mind.
        </p>
        ${routeButton('profile', 'Meet Younes <span aria-hidden="true">↗</span>', 'pf-text-link')}
      </div>
      <span class="pf-availability"><i></i>Open to junior roles & internships</span>
    </section>
    <div class="pf-work-toolbar">
      <span class="pf-kicker">THE WORK</span>
      <div class="pf-filters" role="group" aria-label="Filter portfolio projects">
        ${[
          ['all', 'All', 7],
          ['current', 'Current', 4],
          ['planned', 'Planned', 3],
        ]
          .map(
            ([filter, label, count]) => /* HTML */ `
              <button
                type="button"
                data-pf-filter="${filter}"
                aria-pressed="${state.filter === filter}"
              >
                ${label}<span>${count}</span>
              </button>
            `
          )
          .join('')}
      </div>
    </div>
    ${projectGroup('Selected work', 'Personal prototypes & training projects.', current)}
    ${projectGroup('Next builds', 'Planned projects. Proposed scope and stack.', planned)}
    <section class="pf-next-conversation">
      <p>Business understanding.<br /><strong>Technical curiosity.</strong></p>
      ${routeButton('contact', 'Start a conversation <span aria-hidden="true">↗</span>')}
    </section>
  `;
}

function casePage(project) {
  const position = PORTFOLIO_PROJECTS.indexOf(project);
  const next = PORTFOLIO_PROJECTS[(position + 1) % PORTFOLIO_PROJECTS.length];
  return /* HTML */ `
    <div class="pf-case-nav">
      ${routeButton('work', '<span aria-hidden="true">←</span> All projects', 'pf-text-link')}<span
        >${escape(project.discipline)}</span
      >
    </div>
    <header class="pf-case-heading">
      <div class="pf-case-badges">
        ${badge(project)}${project.priority ? `<span class="pf-priority">${escape(project.priority)}</span>` : ''}
      </div>
      <h1 data-pf-heading tabindex="-1">${escape(project.name)}<span>.</span></h1>
      <p>${escape(project.summary)}</p>
      <div class="pf-case-links">
        ${project.url ? sourceLink(project.url, 'View source', 'pf-button pf-button--dark') : ''}
        ${project.demo ? routeButton('demo/logsentry', 'Try the log sample <span aria-hidden="true">↗</span>') : ''}
        ${project.related ? routeButton(`project/${project.related}`, 'See the existing LogSentry tool <span aria-hidden="true">↗</span>') : ''}
      </div>
    </header>
    <div class="pf-case-visual">${preview(project)}</div>
    <div class="pf-case-meta">
      <div>
        <span>${project.planned ? 'Proposed stack' : 'Stack'}</span>
        <p>${project.stack.map(escape).join(' / ')}</p>
      </div>
      <div>
        <span>Focus</span>
        <p>${escape(project.focus)}</p>
      </div>
    </div>
    <section class="pf-case-section">
      <span class="pf-section-number">01</span>
      <div>
        <h2>The need</h2>
        <p>${escape(project.need)}</p>
      </div>
    </section>
    <section class="pf-case-section">
      <span class="pf-section-number">02</span>
      <div>
        <h2>${project.planned ? 'Proposed approach' : 'The approach'}</h2>
        <p>${escape(project.approach)}</p>
        <div class="pf-flow" aria-label="${project.planned ? 'Proposed flow' : 'Project flow'}">
          ${project.flow.map((step, index) => /* HTML */ `<span>${escape(step)}</span>${index < project.flow.length - 1 ? '<b aria-hidden="true">→</b>' : ''}`).join('')}
        </div>
      </div>
    </section>
    <section class="pf-case-section">
      <span class="pf-section-number">03</span>
      <div>
        <h2>${project.planned ? 'Planned functionality' : 'What it does'}</h2>
        <ul class="pf-feature-list">
          ${project.features.map((feature) => `<li>${escape(feature)}</li>`).join('')}
        </ul>
      </div>
    </section>
    ${
      project.milestone
        ? /* HTML */ `<section class="pf-milestone">
            <span class="pf-kicker">FIRST MILESTONE</span>
            <p>${escape(project.milestone)}</p>
          </section>`
        : ''
    }
    <section class="pf-scope">
      <span class="pf-kicker">${project.planned ? 'CURRENT STATUS' : 'SCOPE & LIMITS'}</span>
      <p>${escape(project.limit)}</p>
    </section>
    <div class="pf-case-bottom">
      ${routeButton('work', '← Back to projects', 'pf-text-link')}${routeButton(`project/${next.id}`, `Next: ${escape(next.name)} <span aria-hidden="true">→</span>`, 'pf-text-link')}
    </div>
  `;
}

function profilePage() {
  return /* HTML */ `
    <section class="pf-profile-hero">
      <span class="pf-kicker">BEHIND THE WORK</span>
      <h1 data-pf-heading tabindex="-1">Business. Code.<br /><span>Room to grow.</span></h1>
      <p>
        I’m Younes, a junior Full Stack Java developer in training at Technofutur TIC, based in
        Belgium.
      </p>
      <p>
        My earlier path in marketing and management helps me look at the need behind a feature. I’m
        now building the technical foundations to turn those needs into useful software.
      </p>
      <p>
        Application security interests me because permissions, data protection and traceability
        belong in the conversation from the start.
      </p>
    </section>
    <section class="pf-profile-stack">
      <div class="pf-section-heading">
        <h2>My current toolbox</h2>
        <p>Learning through training and personal projects.</p>
      </div>
      ${STACK.map(
        (group) =>
          /* HTML */ `<div class="pf-stack-group">
            <h3>${escape(group.title)}</h3>
            <p>${group.tags.map(escape).join(' / ')}</p>
          </div>`
      ).join('')}
    </section>
    <section class="pf-next-conversation">
      <p>A first role.<br /><strong>A team to learn with.</strong></p>
      ${routeButton('contact', 'Get in touch ↗')}
    </section>
  `;
}

function contactPage() {
  return /* HTML */ `
    <section class="pf-contact">
      <span class="pf-kicker">THE NEXT CONVERSATION</span>
      <h1 data-pf-heading tabindex="-1">Let’s talk<span>.</span></h1>
      <p>I’m looking for a first junior development role and I’m open to internships.</p>
      <a class="pf-email" href="mailto:${escape(PROFILE.email)}"
        >${escape(PROFILE.email)} <span aria-hidden="true">↗</span></a
      >
      <div class="pf-contact-links">
        ${sourceLink(PROFILE.github, 'GitHub')}${sourceLink(PROFILE.linkedin, 'LinkedIn')}${sourceLink(PROFILE.resume, 'Résumé · French PDF')}
      </div>
      <div class="pf-contact-note">
        <span>Based in Belgium</span><span>Java / Angular / Application security</span>
      </div>
    </section>
  `;
}

function demoResult(result) {
  if (!result) return '<p class="pf-demo-ready">Choose a sample, then run the analysis.</p>';
  return /* HTML */ `
    <div class="pf-demo-metrics">
      <div><strong>${result.total}</strong><span>records</span></div>
      <div><strong>${result.failures}</strong><span>failures</span></div>
      <div><strong>${result.alerts.length}</strong><span>patterns to review</span></div>
    </div>
    ${
      result.alerts.length
        ? result.alerts
            .map(
              (alert) =>
                /* HTML */ `<article class="pf-demo-alert">
                  <h3>
                    ${alert.type === 'failure-burst' ? 'Repeated login failures' : 'Success after repeated failures'}
                  </h3>
                  <p>${escape(alert.message)}</p>
                  <small>${escape(alert.ip)} / ${escape(alert.username)}</small>
                </article>`
            )
            .join('')
        : '<p class="pf-demo-clear">No patterns matched these rules in this sample.</p>'
    }
  `;
}

function demoPage(state) {
  const records = sampleLogins(state.sample);
  return /* HTML */ `
    <div class="pf-case-nav">
      ${routeButton('project/logsentry', '← LogSentry case study', 'pf-text-link')}<span
        >Interactive sample</span
      >
    </div>
    <header class="pf-case-heading">
      <span class="pf-kicker">TRY THE IDEA</span>
      <h1 data-pf-heading tabindex="-1">Read the signals<span>.</span></h1>
      <p>
        A small browser demonstration using the House’s existing log-analysis rules and synthetic
        records.
      </p>
    </header>
    <div class="pf-demo-controls">
      <label for="pf-log-sample"
        >Sample<select id="pf-log-sample" data-pf-sample>
          <option value="burst" ${state.sample === 'burst' ? 'selected' : ''}>
            Repeated failures
          </option>
          <option value="quiet" ${state.sample === 'quiet' ? 'selected' : ''}>
            Quiet activity
          </option>
        </select></label
      ><button type="button" class="pf-button pf-button--dark" data-pf-analyze>
        Analyze sample <span aria-hidden="true">↗</span>
      </button>
    </div>
    <div class="pf-demo-table-wrap">
      <table class="pf-demo-table">
        <caption>
          Synthetic login records · UTC
        </caption>
        <thead>
          <tr>
            <th>Time</th>
            <th>IP address</th>
            <th>User</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${records
            .map(
              (record) =>
                /* HTML */ `<tr>
                  <td>${record.timestamp.slice(11, 19)}</td>
                  <td>${escape(record.ip)}</td>
                  <td>${escape(record.username)}</td>
                  <td>
                    <span
                      class="pf-log-status ${record.status === 'failure' ? 'pf-log-status--failure' : ''}"
                      >${record.status}</span
                    >
                  </td>
                </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>
    <section class="pf-demo-results" aria-label="Analysis result" aria-live="polite" data-pf-result>
      ${demoResult(state.result)}
    </section>
    <p class="pf-demo-note">
      Rule: 5 failures in 5 minutes for the same IP and username. A finding needs human review. This
      demonstration does not read real logs, call the Python tool or use an AI model.
    </p>
  `;
}

export function resolvePortfolioRoute(route) {
  if (typeof route !== 'string') return 'work';
  if (['work', 'profile', 'contact', 'demo/logsentry'].includes(route)) return route;
  if (route.startsWith('project/') && findPortfolioProject(route.slice(8))) return route;
  return 'work';
}

export function renderPortfolio(state = {}) {
  const view = { route: 'work', filter: 'all', sample: 'burst', result: null, ...state };
  view.route = resolvePortfolioRoute(view.route);
  const active = ['profile', 'contact'].includes(view.route) ? view.route : 'work';
  const page = view.route.startsWith('project/')
    ? casePage(findPortfolioProject(view.route.slice(8)))
    : view.route === 'profile'
      ? profilePage()
      : view.route === 'contact'
        ? contactPage()
        : view.route === 'demo/logsentry'
          ? demoPage(view)
          : workPage(view);
  return /* HTML */ `
    <div class="pf-shell">
      <header class="pf-header">
        ${routeButton('work', 'YUNS<span>PORTFOLIO</span>', 'pf-brand')}
        <nav aria-label="Portfolio pages">
          ${[
            ['work', 'Work'],
            ['profile', 'Profile'],
            ['contact', 'Contact'],
          ]
            .map(
              ([route, label]) =>
                /* HTML */ `<button
                  type="button"
                  data-pf-route="${route}"
                  ${active === route ? 'aria-current="page"' : ''}
                >
                  ${label}
                </button>`
            )
            .join('')}
        </nav>
        ${sourceLink(PROFILE.github, 'GitHub', 'pf-header-source')}
      </header>
      <div class="pf-page">${page}</div>
      <footer class="pf-footer">
        <span>YUNS / Younes Berebia</span><span>Built with curiosity.</span>
      </footer>
    </div>
  `;
}

export function mountProjectPortfolio(root) {
  const state = { route: 'work', filter: 'all', sample: 'burst', result: null };
  const scroll = root.closest('.window-scroll');
  let workScroll = 0;
  root.classList.add('projects-portfolio');
  const status = root.closest('[data-window="projects"]').querySelector('.window-status > span');
  if (status) status.textContent = '4 current projects · 3 planned';

  function render({ focus = false, restore = false } = {}) {
    root.innerHTML = renderPortfolio(state);
    scroll.scrollTop = restore ? workScroll : 0;
    if (focus) root.querySelector('[data-pf-heading]')?.focus({ preventScroll: true });
  }

  root.addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target || !root.contains(target)) return;
    if (target.dataset.pfRoute) {
      if (state.route === 'work') workScroll = scroll.scrollTop;
      state.route = resolvePortfolioRoute(target.dataset.pfRoute);
      render({ focus: true, restore: state.route === 'work' });
    } else if (target.dataset.pfFilter) {
      const previousScroll = scroll.scrollTop;
      state.filter = target.dataset.pfFilter;
      render();
      scroll.scrollTop = previousScroll;
      root.querySelector(`[data-pf-filter="${state.filter}"]`)?.focus({ preventScroll: true });
    } else if (target.hasAttribute('data-pf-analyze')) {
      state.result = analyzeLogins(sampleLogins(state.sample));
      root.querySelector('[data-pf-result]').innerHTML = demoResult(state.result);
    }
  });

  root.addEventListener('change', (event) => {
    if (!event.target.matches('[data-pf-sample]')) return;
    const previousScroll = scroll.scrollTop;
    state.sample = event.target.value;
    state.result = null;
    render();
    scroll.scrollTop = previousScroll;
    root.querySelector('[data-pf-sample]')?.focus({ preventScroll: true });
  });

  render();
}
