// send-invite Edge Function
//
// Flow: an authenticated project manager POSTs { projectId, email, role }.
// We generate a secure token, call create_project_invitation AS THE MANAGER
// (the SQL RPC enforces manager-only authorization via the forwarded JWT, so
// no service-role key is needed here), then email the secure accept link.
//
// Email delivery:
//   * BREVO_API_KEY set  -> send via Brevo (production).
//   * BREVO_API_KEY unset -> dev mode: log the link and return it in the
//     response so the flow can be exercised without sending real email.
//
// Secrets (function env): BREVO_API_KEY, EMAIL_FROM, EMAIL_FROM_NAME, SITE_URL.
// SUPABASE_URL / SUPABASE_ANON_KEY are injected by the runtime.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.103.0';
import {
  buildBrevoEmail,
  buildInviteUrl,
  generateInviteToken,
  validateInviteRequest,
} from './lib.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

async function sendViaBrevo(apiKey: string, email: ReturnType<typeof buildBrevoEmail>) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(email),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Brevo send failed (${res.status}): ${detail}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Missing Authorization header' }, 401);

  // Validate input.
  let input;
  try {
    input = validateInviteRequest(await req.json());
  } catch (e) {
    return json({ error: (e as Error).message }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const siteUrl = Deno.env.get('SITE_URL') ?? 'http://127.0.0.1:3000';
  const brevoKey = Deno.env.get('BREVO_API_KEY');
  const fromEmail = Deno.env.get('EMAIL_FROM') ?? 'no-reply@projectmap.local';
  const fromName = Deno.env.get('EMAIL_FROM_NAME') ?? 'ProjectMap';

  // Act as the caller so the RPC's manager check applies to them.
  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = generateInviteToken();

  const { data, error } = await supabase.rpc('create_project_invitation', {
    p_project_id: input.projectId,
    p_email: input.email,
    p_role: input.role,
    p_token: token,
  });

  if (error) {
    // 42501 = our "not a manager" / not-authenticated guard.
    const status = error.code === '42501' ? 403 : 400;
    return json({ error: error.message, code: error.code }, status);
  }

  if (data?.status === 'already_member') {
    return json({ status: 'already_member', email: input.email });
  }

  // Look up the project name for a friendlier email (manager can read it).
  const { data: project } = await supabase
    .from('projects')
    .select('name')
    .eq('id', input.projectId)
    .single();
  const projectName = project?.name ?? 'a project';

  const inviteUrl = buildInviteUrl(siteUrl, token);
  const email = buildBrevoEmail({
    toEmail: input.email,
    inviteUrl,
    projectName,
    fromEmail,
    fromName,
  });

  if (brevoKey) {
    try {
      await sendViaBrevo(brevoKey, email);
    } catch (e) {
      console.error('[send-invite] email send failed:', e);
      // Surface the provider's reason (truncated) so the failure is diagnosable
      // from the client instead of requiring log access.
      const detail = (e as Error).message.slice(0, 300);
      return json(
        {
          error: `Invitation created but email failed to send — ${detail}`,
          devInviteUrl: inviteUrl,
        },
        502,
      );
    }
    return json({
      status: 'invited',
      email: input.email,
      userExists: data?.user_exists ?? false,
    });
  }

  // Dev mode: no email provider configured. Log + return the link.
  console.log(`[send-invite] DEV invite link for ${input.email}: ${inviteUrl}`);
  return json({
    status: 'invited',
    email: input.email,
    userExists: data?.user_exists ?? false,
    devInviteUrl: inviteUrl,
  });
});
