import React from 'react';
import LegalPage, { LegalSection } from './LegalPage';

const PrivacyPolicy = () => (
  <LegalPage title="Privacy Policy" updated="August 19, 2026">
    <LegalSection heading="What ProjectMap is">
      ProjectMap is a non-commercial project management application developed
      as an undergraduate thesis project at International Burch University. It
      lets small teams organize projects into milestones, outcomes, and tasks.
    </LegalSection>

    <LegalSection heading="Data we collect">
      We collect only what the application needs to function: your email
      address and password (for authentication), your first and last name and
      an optional avatar image URL (your profile), and the content you create
      in the application (projects, milestones, outcomes, tasks, comments, and
      project memberships). We do not collect analytics, tracking, or
      advertising data.
    </LegalSection>

    <LegalSection heading="How we use your data">
      Your data is used exclusively to provide the application&apos;s
      functionality: signing you in, showing you the projects you are a member
      of, and displaying your name and avatar to your teammates. We never sell
      or share your data with third parties, and we never use your email
      address for newsletters, marketing, prospecting, or any promotional
      communication.
    </LegalSection>

    <LegalSection heading="Invitation emails">
      The only email the application sends is a one-time, transactional project
      invitation. It is sent when a project manager explicitly invites a
      specific person who has agreed to collaborate on their project. The email
      contains a unique acceptance link that expires after 7 days and can be
      revoked by the sender. Recipients are never added to any mailing list and
      receive no further emails unless an invitation is explicitly re-sent.
    </LegalSection>

    <LegalSection heading="Where your data is stored">
      All data is stored with Supabase (PostgreSQL) in the European Union
      (eu-west-1 region). Authentication is handled by Supabase Auth; passwords
      are stored only as secure hashes. Access to data is enforced with
      row-level security: users can only see the projects they are members of.
    </LegalSection>

    <LegalSection heading="Cookies and local storage">
      The application stores your authentication session in your
      browser&apos;s local storage so you stay signed in. No advertising or
      third-party tracking cookies are used.
    </LegalSection>

    <LegalSection heading="Data deletion and contact">
      You can request access to or deletion of your account and data at any
      time by contacting the project author, Rijad Kuloglija, at the address
      provided with your invitation, or through International Burch University,
      Department of Information Technology.
    </LegalSection>
  </LegalPage>
);

export default PrivacyPolicy;
