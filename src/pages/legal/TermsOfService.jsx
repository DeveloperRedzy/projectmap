import React from 'react';
import LegalPage, { LegalSection } from './LegalPage';

const TermsOfService = () => (
  <LegalPage title="Terms of Service" updated="August 19, 2026">
    <LegalSection heading="About the service">
      ProjectMap is a non-commercial project management application developed
      as an undergraduate thesis project at International Burch University by
      Rijad Kuloglija. It is provided free of charge for collaborative project
      planning by invited users.
    </LegalSection>

    <LegalSection heading="Accounts and invitations">
      Access is invitation-only. An account is created by accepting a project
      invitation sent by an existing project manager, or provisioned directly
      by the administrator. You are responsible for keeping your password
      confidential. Project managers may only invite people who have agreed to
      collaborate on their project and expect the invitation.
    </LegalSection>

    <LegalSection heading="Acceptable use">
      You agree to use ProjectMap only for legitimate project collaboration.
      You must not use it to send unsolicited communications, to store or share
      unlawful content, or to attempt to access data belonging to projects you
      are not a member of. Invitation emails are strictly transactional: using
      the invitation system for newsletters, marketing, prospecting, or any
      promotional purpose is prohibited.
    </LegalSection>

    <LegalSection heading="Your content">
      You retain ownership of the content you create (projects, tasks,
      comments). You grant the application the right to store and display this
      content to the members of the same project, which is necessary to provide
      the service.
    </LegalSection>

    <LegalSection heading="Availability and warranty">
      ProjectMap is an educational project provided &quot;as is&quot;, without
      warranties of any kind. We do our best to keep the service available and
      your data safe, but we cannot guarantee uninterrupted operation, and the
      service may be modified or discontinued as the academic project evolves.
    </LegalSection>

    <LegalSection heading="Termination">
      Accounts used in violation of these terms may be removed. You may stop
      using the service and request deletion of your account and data at any
      time (see the Privacy Policy).
    </LegalSection>

    <LegalSection heading="Contact">
      Questions about these terms can be directed to the project author, Rijad
      Kuloglija, International Burch University, Department of Information
      Technology.
    </LegalSection>
  </LegalPage>
);

export default TermsOfService;
