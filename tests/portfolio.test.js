import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PROJECTS } from '../src/js/content.js';
import {
  PLANNED_PROJECTS,
  findPortfolioProject,
  selectPortfolioProjects,
} from '../src/js/portfolio-data.js';
import { renderPortfolio, resolvePortfolioRoute } from '../src/js/portfolio.js';

// Existing work keeps its original source links and scope descriptions.
test('current projects reuse the existing portfolio data without rewriting it', () => {
  assert.equal(selectPortfolioProjects('current').length, PROJECTS.length);
  for (const original of PROJECTS) {
    const project = findPortfolioProject(original.id);
    assert.equal(project.url, original.url);
    assert.equal(project.state, original.state);
    assert.equal(project.limit, original.limit);
    assert.equal(project.planned, false);
  }
});

test('new concepts are marked planned and have no invented source or live-demo URL', () => {
  assert.deepEqual(
    PLANNED_PROJECTS.map((project) => project.id),
    ['devcontrol', 'leavepilot', 'logsentry-ai']
  );
  for (const project of PLANNED_PROJECTS) {
    assert.equal(project.state, 'Planned');
    assert.equal(project.planned, true);
    assert.equal(project.url, undefined);
    assert.equal(project.demo, undefined);
    assert.ok(project.milestone);
  }
});

test('planned filter separates concepts from the current project list', () => {
  const html = renderPortfolio({ filter: 'planned' });
  assert.match(html, /Next builds/);
  assert.match(html, /DevControl/);
  assert.match(html, /LeavePilot SaaS/);
  assert.match(html, /LogSentry AI/);
  assert.doesNotMatch(html, /Open yomoConsent case study/);
});

test('LeavePilot detail stays inclusive and clearly describes an unbuilt project', () => {
  const html = renderPortfolio({ route: 'project/leavepilot' });
  assert.match(html, /Mode Ensemble/);
  assert.match(html, /friends, family, colleagues or partners/);
  assert.match(html, /Planned functionality/);
  assert.match(html, /no deployed SaaS/);
});

test('invalid routes and unknown projects recover to the work page', () => {
  for (const route of [null, undefined, 'project/missing', 'demo/missing', 'invalid']) {
    assert.equal(resolvePortfolioRoute(route), 'work');
    assert.match(renderPortfolio({ route }), /Younes Berebia/);
  }
  assert.equal(findPortfolioProject('missing'), null);
});
