import {
  EMAIL_EVENTS,
  buildPreviewVars,
  escapeHtml,
  getEmailEvent,
  purposeToEventKey,
  renderEmailTemplate,
} from './email-events';

describe('email-events registry', () => {
  it('defines unique event keys with non-empty defaults', () => {
    const keys = EMAIL_EVENTS.map((e) => e.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const event of EMAIL_EVENTS) {
      expect(event.label.length).toBeGreaterThan(0);
      expect(event.defaultSubject.length).toBeGreaterThan(0);
      expect(event.defaultBodyHtml).toContain('{{siteName}}');
    }
  });

  it('maps auth verification purposes to their events', () => {
    expect(purposeToEventKey('signup')).toBe('signup_verification');
    expect(purposeToEventKey('login')).toBe('login_verification');
    expect(purposeToEventKey('change_email')).toBe(
      'email_change_verification',
    );
  });

  it('returns definitions for every registered key', () => {
    for (const event of EMAIL_EVENTS) {
      expect(getEmailEvent(event.key)).toBe(event);
    }
    expect(getEmailEvent('nope')).toBeUndefined();
  });
});

describe('renderEmailTemplate', () => {
  it('replaces placeholders with escaped values', () => {
    const rendered = renderEmailTemplate('<p>{{code}} / {{name}}</p>', {
      code: 42,
      name: '<b>Evil & "Friends"</b>',
    });
    expect(rendered).toBe(
      '<p>42 / &lt;b&gt;Evil &amp; &quot;Friends&quot;&lt;/b&gt;</p>',
    );
  });

  it('drops unknown placeholders instead of leaking raw markers', () => {
    expect(renderEmailTemplate('Hi {{unknown}}, {{code}}', { code: '9' })).toBe(
      'Hi , 9',
    );
  });

  it('renders single-brace content untouched', () => {
    expect(renderEmailTemplate('a { not a placeholder } b', {})).toBe(
      'a { not a placeholder } b',
    );
  });
});

describe('buildPreviewVars', () => {
  it('fills every declared variable with its example value', () => {
    const definition = getEmailEvent('signup_verification')!;
    const vars = buildPreviewVars(definition);
    for (const variable of definition.variables) {
      expect(vars[variable.key]).toBe(variable.example);
    }
  });

  it('lets explicit overrides win', () => {
    const definition = getEmailEvent('signup_verification')!;
    expect(buildPreviewVars(definition, { code: '111111' }).code).toBe(
      '111111',
    );
  });
});

describe('escapeHtml', () => {
  it('escapes the five dangerous characters', () => {
    expect(escapeHtml(`<&>"'`)).toBe('&lt;&amp;&gt;&quot;&#39;');
  });
});
