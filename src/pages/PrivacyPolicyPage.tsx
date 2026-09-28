import { Link } from 'react-router-dom'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16 md:py-20">
        <header className="border-b border-border pb-10">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent">
            Legal
          </p>

          <h1 className="mt-3 font-serif text-4xl font-medium text-ink sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-4 text-sm text-ink-soft">
            Last updated: September 28, 2026
          </p>
        </header>

        <article className="space-y-12 py-10 text-sm leading-7 text-ink-soft">
          <section>
            <h2 className="font-serif text-2xl text-ink">
              1. Overview
            </h2>

            <p className="mt-4">
              Afterglow is a personal memory and experience-sharing
              application. This Privacy Policy explains what information
              Afterglow may handle, how it is used, and the choices available
              to you.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">
              2. Information you provide
            </h2>

            <p className="mt-4">
              Depending on how you use Afterglow, you may provide information
              including:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>
                Account information associated with your authentication
                account, such as your email address.
              </li>
              <li>
                Experience information such as titles, locations, dates,
                descriptions, timelines, and people you add.
              </li>
              <li>
                Photos and videos that you choose to upload.
              </li>
              <li>
                Songs or music references that you choose to associate with
                an experience.
              </li>
              <li>
                Information you provide when using experience invitations,
                such as an invited person's email address.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">
              3. How your information is used
            </h2>

            <p className="mt-4">
              Afterglow uses the information you provide to operate the
              application and provide its features. This includes storing and
              displaying your experiences, authenticating your account,
              managing sharing permissions, and allowing you to access or
              delete content through the application.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">
              4. Photos and videos
            </h2>

            <p className="mt-4">
              Photos and videos uploaded to Afterglow are stored as part of
              your experiences. Uploaded media may contain personal
              information or information about other people, so you should
              only upload content that you have the right to store and share.
            </p>

            <p className="mt-4">
              Afterglow does not make a private experience publicly
              discoverable simply because it exists. Sharing depends on the
              visibility setting you choose for the experience.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">
              5. Sharing and visibility
            </h2>

            <p className="mt-4">
              Afterglow provides different sharing settings for experiences:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>
                <strong className="font-medium text-ink">Only me:</strong>{' '}
                the experience is intended to remain accessible only to you.
              </li>
              <li>
                <strong className="font-medium text-ink">
                  Anyone with the link:
                </strong>{' '}
                people who obtain the experience link may be able to view the
                published experience.
              </li>
              <li>
                <strong className="font-medium text-ink">
                  Only people I invite:
                </strong>{' '}
                access is limited to people invited to the experience,
                subject to the application's authentication and access
                controls.
              </li>
            </ul>

            <p className="mt-4">
              You are responsible for deciding who receives an experience
              link or invitation. Do not share a link or invitation with
              someone if you do not want them to access the associated
              experience.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">
              6. Authentication and service providers
            </h2>

            <p className="mt-4">
              Afterglow uses third-party services to provide infrastructure
              and authentication functionality, including Supabase and
              Google authentication where enabled.
            </p>

            <p className="mt-4">
              These providers may process information according to their own
              privacy policies and terms. Afterglow does not control the
              privacy practices of third-party services.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">
              7. Data security
            </h2>

            <p className="mt-4">
              Afterglow uses authentication, database access controls, and
              storage access controls intended to restrict access to user
              content according to the application's permissions.
            </p>

            <p className="mt-4">
              No method of storing or transmitting information over the
              internet can be guaranteed to be completely secure. You should
              avoid uploading information that you are not comfortable storing
              with an online service.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">
              8. Data retention and deletion
            </h2>

            <p className="mt-4">
              Your experiences and uploaded content are retained so that
              Afterglow can provide the features you use. You can delete
              experiences and associated content through the application where
              those controls are available.
            </p>

            <p className="mt-4">
              If you need assistance with deletion or account-related data,
              contact the Afterglow creator using the contact information
              provided below.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">
              9. Children's privacy
            </h2>

            <p className="mt-4">
              Afterglow is not designed to knowingly collect personal
              information from children without appropriate authorization.
              If you believe a child has provided personal information to the
              service in a way that should not have occurred, please contact
              us so the information can be reviewed and addressed where
              appropriate.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">
              10. Changes to this policy
            </h2>

            <p className="mt-4">
              This Privacy Policy may be updated as Afterglow changes or new
              features are introduced. The date at the top of this page
              indicates when the policy was most recently updated.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-ink">
              11. Contact
            </h2>

            <p className="mt-4">
              For privacy-related questions or requests concerning Afterglow,
              contact the creator through the contact links provided in the
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