import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const srcPath = `${process.cwd()}/src`;

describe('CSS architecture', () => {
  it('keeps styles.css as an import-only entry point', () => {
    const entry = readFileSync(`${srcPath}/styles.css`, 'utf8');
    const statements = entry
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('/*') && !line.startsWith('*') && !line.startsWith('*/'));

    expect(statements.every((line) => line.startsWith('@import '))).toBe(true);
  });

  it('splits design foundations and component concerns into dedicated files', () => {
    const expectedFiles = [
      'styles/tokens.css',
      'styles/base.css',
      'styles/layout.css',
      'styles/components/data-display.css',
      'styles/components/feedback.css',
      'styles/components/forms.css',
      'styles/components/navigation.css',
      'styles/components/analytics.css',
      'styles/utilities.css',
      'styles/responsive.css',
    ];

    expectedFiles.forEach((path) => expect(existsSync(`${srcPath}/${path}`), path).toBe(true));
  });

  it('uses BEM names for component-owned selectors', () => {
    const componentFiles = ['analytics.css', 'data-display.css', 'feedback.css', 'forms.css', 'navigation.css'];
    const css = componentFiles
      .map((file) => readFileSync(`${srcPath}/styles/components/${file}`, 'utf8'))
      .join('\n');
    const legacySelectors = [
      'sidebar-header', 'analytics-card', 'time-chart-plot', 'compact-time-chart',
      'anomaly-icon', 'status-pending', 'result-kind', 'btn-ghost', 'pager',
    ];

    legacySelectors.forEach((selector) => expect(css, selector).not.toContain(`.${selector}`));
  });
});
