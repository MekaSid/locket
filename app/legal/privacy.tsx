import { LegalDocument, LegalSection } from '../../src/components/LegalDocument';

export default function PrivacyPolicyScreen() {
  return (
    <LegalDocument
      description="How Locket collects, stores, and uses account, pairing, and shared media information."
      effectiveDate="June 21, 2026"
      title="Privacy Policy"
    >
      <LegalSection
        title="What we collect"
        body="Locket stores account details you provide, such as your email address, first name, last name, and profile photo. The app also stores pairing records, invite codes, gameplay state, and the photos or videos you send through the service."
      />
      <LegalSection
        title="How data is used"
        body="Your data is used to authenticate your account, pair you with another user, deliver shared media, keep game progress in sync, and operate core app features. Media is used only to provide the private sharing experience between paired accounts."
      />
      <LegalSection
        title="Who can access shared content"
        body="Media sent through Locket is intended to be accessible only to the paired accounts associated with that conversation. Storage and database rules are configured to restrict access to authenticated users who belong to the relevant pair."
      />
      <LegalSection
        title="Retention and deletion"
        body="Profile records and app activity may remain stored until you delete your account or the data is otherwise removed by the app operator. Deleting your account is intended to remove your user record and end any active pair connected to it."
      />
      <LegalSection
        title="Third-party services"
        body="Locket relies on third-party infrastructure providers for authentication, database storage, media storage, and app delivery. Those providers may process data on behalf of the app in order to keep the service running."
      />
      <LegalSection
        title="Contact and updates"
        body="If you publish this app, replace this section with a real support email or website. You should also update this policy whenever your data practices change in a material way."
      />
    </LegalDocument>
  );
}
