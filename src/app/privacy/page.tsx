import FooterSection from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Privacy Policy</h1>
          <div className="mt-8 space-y-6 text-base leading-7">
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">1. Introduction</h2>
              <p className="mt-3 text-muted-foreground">
                Welcome to Evotha, an AI-powered website optimization analysis tool. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">2. Information We Collect</h2>
              <h3 className="mt-4 font-semibold text-foreground">Account Information</h3>
              <ul className="mt-3 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Email address (for account creation and communication)</li>
                <li>Encrypted password (we use Supabase authentication for security)</li>
                <li>Account preferences and settings</li>
              </ul>

              <h3 className="mt-4 font-semibold text-foreground">Usage Data</h3>
              <ul className="mt-3 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Website URLs you submit for analysis</li>
                <li>Analysis results and generated reports</li>
                <li>Usage analytics via Umami (privacy-focused analytics)</li>
                <li>Session data and login information</li>
              </ul>

              <h3 className="mt-4 font-semibold text-foreground">Technical Data</h3>
              <ul className="mt-3 list-disc pl-6 text-muted-foreground space-y-2">
                <li>IP address and browser information</li>
                <li>Device and operating system data</li>
                <li>Session cookies (essential for service functionality)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">3. How We Use Your Information</h2>
              <ul className="mt-3 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide and improve our website analysis service</li>
                <li>Generate personalized optimization reports</li>
                <li>Manage your account and subscription</li>
                <li>Send service-related communications</li>
                <li>Analyze usage patterns to improve our service</li>
                <li>Ensure security and prevent abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">4. Data Storage and Security</h2>
              <p className="mt-3 text-muted-foreground">We use industry-standard security measures to protect your data:</p>
              <ul className="mt-3 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Secure authentication through Supabase</li>
                <li>Encrypted data transmission (HTTPS)</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal data on a need-to-know basis</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">5. Data Sharing and Disclosure</h2>
              <p className="mt-3 text-muted-foreground">We do not sell, trade, or rent your personal information. We may share data only in these limited circumstances:</p>
              <ul className="mt-3 list-disc pl-6 text-muted-foreground space-y-2">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With trusted service providers (Supabase, Umami) under strict data protection agreements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">6. Your Rights</h2>
              <p className="mt-3 text-muted-foreground">You have the following rights regarding your personal data:</p>
              <ul className="mt-3 list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a structured format</li>
                <li><strong>Objection:</strong> Opt-out of certain data processing activities</li>
              </ul>
              <p className="mt-3 text-muted-foreground">To exercise these rights, contact us at <a className="underline" href="mailto:alexandre@evadigital.fr">alexandre@evadigital.fr</a></p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">7. Cookies and Tracking</h2>
              <p className="mt-3 text-muted-foreground">We use minimal cookies to ensure our service functions properly:</p>
              <ul className="mt-3 list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Essential cookies:</strong> Required for authentication and security</li>
                <li><strong>Analytics:</strong> Privacy-focused analytics via Umami (no personal identification)</li>
              </ul>
              <p className="mt-3 text-muted-foreground">We do not use advertising cookies or third-party tracking scripts.</p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">8. International Data Transfers</h2>
              <p className="mt-3 text-muted-foreground">
                Our services are operated from Indonesia. By using Evotha, you consent to the transfer and processing of your data in Indonesia and other countries where our service providers operate. We ensure appropriate safeguards are in place for international data transfers.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">9. Data Retention</h2>
              <p className="mt-3 text-muted-foreground">
                We retain your personal data for as long as necessary to provide our services and comply with legal obligations. You can request deletion of your account and associated data at any time by contacting <a className="underline" href="mailto:alexandre@evadigital.fr">alexandre@evadigital.fr</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">10. Changes to This Policy</h2>
              <p className="mt-3 text-muted-foreground">
                We may update this privacy policy from time to time. We will notify users of any material changes via email or through our service. Your continued use of Evotha after such modifications constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">11. Contact Us</h2>
              <p className="mt-3 text-muted-foreground">If you have any questions about this privacy policy or our data practices, please contact us:</p>
              <p className="text-muted-foreground"><strong>Email:</strong> <a className="underline" href="mailto:alexandre@evadigital.fr">alexandre@evadigital.fr</a></p>
              <p className="text-muted-foreground"><strong>Last updated:</strong> August 2025</p>
            </section>
          </div>
        </section>
        <FooterSection />
      </main>
    </div>
  );
}


