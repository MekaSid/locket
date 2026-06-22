import { LegalDocument, LegalSection } from '../../src/components/LegalDocument';

export default function DataUseScreen() {
  return (
    <LegalDocument
      description="A shorter summary of what Locket stores and why the app needs it."
      effectiveDate="June 21, 2026"
      title="How Data Is Used"
    >
      <LegalSection
        title="Account data"
        body="Your email and profile details are used to identify your account, show your name and avatar in the app, and keep your session tied to the correct user record."
      />
      <LegalSection
        title="Pairing data"
        body="Pair memberships and invite codes are used to connect two accounts privately and decide which media and game records each account can access."
      />
      <LegalSection
        title="Media data"
        body="Photos and videos you send are uploaded to app storage so they can be shown to the linked partner account. The app also stores timestamps, sender information, and related metadata needed to display the latest shared media."
      />
      <LegalSection
        title="Product operations"
        body="The app uses stored data to power login, pairing, media delivery, read-state updates, and game features. Data is not collected for a feature unless the app needs it to make that feature work."
      />
      <LegalSection
        title="What still needs to be finalized before launch"
        body="Before shipping publicly, replace these screens with your final legal text, add a support contact, confirm your retention policy, and make sure the exact app behavior matches what these pages promise."
      />
    </LegalDocument>
  );
}
