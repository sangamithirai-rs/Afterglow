import { Link } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'

export function TermsPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16 md:py-20">
        <header className="border-b border-border pb-10">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent">
            Legal
          </p>

          <h1 className="mt-3 font-serif text-4xl font-medium text-ink sm:text-5xl">
            Terms &amp; Conditions
          </h1>

          <p className="mt-4 text-sm text-ink-soft">
            Last updated: September 28, 2026
          </p>
        </header>

        <article className="space-y-12 py-10 text-sm leading-7 text-ink-soft">
          <section>
            <h2 className="font-serif text-2xl text-ink">
              1. About Afterglow
            </h2>

            <p className="mt-4">
              Afterglow is an application for creating, preserving, and
              sharing personal experiences and memories. By using Afterglow,
              you agree to use the service responsibly and in accordance with
              these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">
              2. Your account
            </h2>

            <p className="mt-4">
              You are responsible for maintaining the security of your account
              and for activity carried out through your account. You should
              not knowingly provide access to your account to another person
              in a way that compromises your account or other users' privacy.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">
              3. Your content
            </h2>

            <p className="mt-4">
              You retain ownership of the photos, videos, text, and other
              content that you upload to Afterglow, subject to any rights
              belonging to other people or third parties.
            </p>

            <p className="mt-4">
              By uploading content, you confirm that you have the necessary
              rights or permissions to upload and share that content through
              Afterglow.
            </p>

            <p className="mt-4">
              You grant Afterglow the limited permission necessary to store,
              process, display, and transmit your content solely to provide
              the features you request, including storing experiences and
              displaying them to people with whom you choose to share them.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">
              4. Content involving other people
            </h2>

            <p className="mt-4">
              You are responsible for considering the privacy and other rights
              of people who appear in content that you upload. Do not upload
              or share content in a way that violates another person's rights
              or applicable law.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">
              5. Sharing experiences
            </h2>

            <p className="mt-4">
              You control the sharing setting of your experiences. Depending
              on the setting, an experience may be accessible only to you,
              accessible to anyone who has its link, or accessible to people
              you invite.
            </p>

            <p className="mt-4">
              You are responsible for the links and invitations you distribute
              and should treat a shared experience link as information that
              may be accessible to anyone who obtains it.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">
              6. Prohibited use
            </h2>

            <p className="mt-4">
              You must not use Afterglow to:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>Upload content you do not have the right to share.</li>
              <li>
                Violate another person's privacy, intellectual property, or
                other legal rights.
              </li>
              <li>
                Upload malicious software or content intended to compromise
                the service or another user's device.
              </li>
              <li>
                Attempt to bypass authentication, access controls, or sharing
                restrictions.
              </li>
              <li>
                Abuse the service in a way that interferes with its normal
                operation.
              </li>
              <li>
                Use the service for unlawful purposes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">
              7. Third-party services
            </h2>

            <p className="mt-4">
              Afterglow relies on third-party services for certain
              infrastructure and authentication functionality. Your use of
              those services may also be subject to their respective terms
              and policies.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">
              8. Availability
            </h2>

            <p className="mt-4">
              Afterglow is provided as an evolving application. Features may
              be changed, suspended, or removed as the application develops.
              We do not guarantee that the service will always be available or
              uninterrupted.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">
              9. User responsibility for backups
            </h2>

            <p className="mt-4">
              You should keep copies of important original photos, videos,
              documents, or other content outside Afterglow. Afterglow should
              not be treated as your sole backup for important personal
              information.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">
              10. Changes to these Terms
            </h2>

            <p className="mt-4">
              These Terms may be updated when Afterglow changes or new
              functionality is introduced. The date at the top of this page
              indicates when the Terms were most recently updated.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">
              11. Contact
            </h2>

            <p className="mt-4">
              If you have questions about these Terms or Afterglow, contact
              the creator through the contact links provided in the
              application footer.
            </p>
          </section>

          <div className="border-t border-border pt-8">
            <Link
              to="/"
              className="text-xs font-medium uppercase tracking-[0.16em] text-ink transition hover:text-accent"
            >
              ← Back to Afterglow
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  )
}