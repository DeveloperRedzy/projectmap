import { assert, assertEquals, assertThrows } from 'jsr:@std/assert@1';
import {
  buildBrevoEmail,
  buildInviteUrl,
  generateInviteToken,
  isValidEmail,
  isValidRole,
  isValidUuid,
  validateInviteRequest,
} from './lib.ts';

Deno.test('generateInviteToken: URL-safe, fixed length, unique', () => {
  const a = generateInviteToken();
  const b = generateInviteToken();
  assertEquals(a.length, 43); // 32 random bytes, base64url, no padding
  assert(/^[A-Za-z0-9_-]+$/.test(a), 'token must be URL-safe');
  assert(a !== b, 'tokens must differ');
});

Deno.test('buildInviteUrl: builds accept link and trims trailing slash', () => {
  assertEquals(
    buildInviteUrl('https://app.example.com/', 'abc'),
    'https://app.example.com/accept-invite?token=abc',
  );
  assertEquals(
    buildInviteUrl('http://127.0.0.1:3000', 'x-y_z'),
    'http://127.0.0.1:3000/accept-invite?token=x-y_z',
  );
});

Deno.test('isValidEmail', () => {
  assert(isValidEmail('a@b.com'));
  assert(!isValidEmail('nope'));
  assert(!isValidEmail(''));
});

Deno.test('isValidUuid', () => {
  assert(isValidUuid('00000000-0000-0000-0000-000000000001'));
  assert(!isValidUuid('not-a-uuid'));
});

Deno.test('isValidRole', () => {
  assert(isValidRole('manager'));
  assert(isValidRole('member'));
  assert(!isValidRole('admin'));
});

Deno.test('validateInviteRequest: normalizes good input', () => {
  const out = validateInviteRequest({
    projectId: '00000000-0000-0000-0000-000000000001',
    email: '  Person@Example.com ',
    role: 'member',
  });
  assertEquals(out.email, 'person@example.com');
  assertEquals(out.role, 'member');
  assertEquals(out.projectId, '00000000-0000-0000-0000-000000000001');
});

Deno.test('validateInviteRequest: defaults role to member', () => {
  const out = validateInviteRequest({
    projectId: '00000000-0000-0000-0000-000000000001',
    email: 'p@e.com',
  });
  assertEquals(out.role, 'member');
});

Deno.test('validateInviteRequest: rejects bad input', () => {
  assertThrows(() => validateInviteRequest({ projectId: 'x', email: 'p@e.com' }));
  assertThrows(() =>
    validateInviteRequest({ projectId: '00000000-0000-0000-0000-000000000001', email: 'bad' })
  );
  assertThrows(() =>
    validateInviteRequest({
      projectId: '00000000-0000-0000-0000-000000000001',
      email: 'p@e.com',
      role: 'root',
    })
  );
});

Deno.test('buildBrevoEmail: correct shape and contains the link', () => {
  const payload = buildBrevoEmail({
    toEmail: 'p@e.com',
    inviteUrl: 'https://app/accept-invite?token=tok',
    projectName: 'My Project',
    inviterName: 'Alice',
    fromEmail: 'invites@mail.app',
    fromName: 'ProjectMap',
  });
  assertEquals(payload.sender.email, 'invites@mail.app');
  assertEquals(payload.to[0].email, 'p@e.com');
  assert(payload.subject.includes('My Project'));
  assert(payload.htmlContent.includes('https://app/accept-invite?token=tok'));
});
