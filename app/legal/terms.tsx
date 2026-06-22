import { LegalDocument, LegalSection } from '../../src/components/LegalDocument';

export default function TermsScreen() {
  return (
    <LegalDocument
      description="Basic terms governing access to and use of the Locket app."
      effectiveDate="June 21, 2026"
      title="Terms & Conditions"
    >
      <LegalSection
        title="Acceptance of terms"
        body="By creating an account or using Locket, you agree to these terms. If you do not agree, you should stop using the service."
      />
      <LegalSection
        title="Account responsibilities"
        body="You are responsible for maintaining the confidentiality of your account and for activity that occurs through it. You must provide accurate account information and use the app only in lawful ways."
      />
      <LegalSection
        title="Content and conduct"
        body="You may not use Locket to share unlawful, abusive, infringing, or harmful content. The app operator may suspend or terminate access for misuse, suspected abuse, or attempts to interfere with service integrity."
      />
      <LegalSection
        title="Availability"
        body="Locket is provided on an as-is and as-available basis. The service may change, be interrupted, or be discontinued without prior notice."
      />
      <LegalSection
        title="Pairing and account actions"
        body="Pairing, unpairing, sign-out, and account deletion features may affect access to shared content and ongoing app features. Deleting an account is intended to be permanent."
      />
      <LegalSection
        title="Limitation of liability"
        body="To the fullest extent allowed by law, the app operator is not liable for indirect, incidental, special, consequential, or punitive damages arising from your use of the service."
      />
      <LegalSection
        title="Changes to these terms"
        body="These terms may be updated over time. Continued use of the app after updated terms are published will constitute acceptance of the revised version."
      />
    </LegalDocument>
  );
}
