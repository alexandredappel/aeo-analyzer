import FooterSection from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Terms of Service</h1>
          <div className="mt-8 space-y-6 text-base leading-7">
            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p className="mt-3 text-muted-foreground">
                Welcome to Evotha, an AI-powered website optimization analysis service. By accessing or using our service, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">2. Service Description</h2>
              <p className="mt-3 text-muted-foreground">
                Evotha provides AI-powered analysis tools to help optimize websites for generative search engines and Large Language Models (LLMs). Our service includes:
              </p>
              <ul className="mt-3 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Website content and structure analysis</li>
                <li>AI optimization recommendations</li>
                <li>Performance reports and insights</li>
                <li>Accessibility and readability assessments</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">3. Account Registration</h2>
              <p className="mt-3 text-muted-foreground">To use our service, you must:</p>
              <ul className="mt-3 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Provide accurate and current information during registration</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">4. Subscription Plans and Pricing</h2>
              <h3 className="mt-4 font-semibold text-foreground">Current Plans</h3>
              <p className="mt-3 text-muted-foreground font-semibold">Free Plan</p>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li>5 website analyses per month</li>
              </ul>
              <p className="mt-3 text-muted-foreground font-semibold">Premium Plan</p>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li>$14.50/month - 100 website analyses per month</li>
              </ul>
              <h3 className="mt-4 font-semibold text-foreground">Payment Terms</h3>
              <ul className="mt-3 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Subscription fees are charged monthly in advance</li>
                <li>All prices are in USD and may be subject to applicable taxes</li>
                <li>We reserve the right to change pricing with 30 days notice</li>
                <li><strong>No refunds are provided for subscription fees</strong></li>
                <li>Cancellation takes effect at the end of the current billing cycle</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">5. Usage Limits and Restrictions</h2>
              <h3 className="mt-4 font-semibold text-foreground">Analysis Limits</h3>
              <ul className="mt-3 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Free accounts: 5 website analyses per month</li>
                <li>Premium accounts: 100 website analyses per month</li>
                <li>Unused analyses do not roll over to the next month</li>
              </ul>
              <h3 className="mt-4 font-semibold text-foreground">Acceptable Use</h3>
              <p className="mt-3 text-muted-foreground">You agree not to:</p>
              <ul className="mt-3 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Use automated tools to exceed your plan limits</li>
                <li>Share your account credentials with others</li>
                <li>Attempt to reverse engineer or copy our service</li>
                <li>Use the service for illegal or harmful activities</li>
                <li>Overload our systems with excessive requests</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">6. Intellectual Property</h2>
              <p className="mt-3 text-muted-foreground">
                You retain ownership of any content you submit for analysis, and we only use it to provide our analysis services. Our service, methodologies, and proprietary algorithms remain our intellectual property.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">7. Disclaimers and Limitations</h2>
              <h3 className="mt-4 font-semibold text-foreground">Important Disclaimer</h3>
              <p className="mt-3 text-muted-foreground">
                <strong>Our analysis results are provided "as is" for informational purposes only.</strong> AI optimization criteria and algorithms change frequently, and our analysis may not be exhaustive or represent the only method for website optimization.
              </p>
              <h3 className="mt-4 font-semibold text-foreground">Service Limitations</h3>
              <ul className="mt-3 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Analysis accuracy depends on AI models and current optimization best practices</li>
                <li>Recommendations are suggestions, not guarantees of improved performance</li>
                <li>We do not guarantee specific ranking improvements or traffic increases</li>
                <li>Analysis results may become outdated as AI algorithms evolve</li>
              </ul>
              <h3 className="mt-4 font-semibold text-foreground">Limitation of Liability</h3>
              <p className="mt-3 text-muted-foreground">
                <strong>To the maximum extent permitted by law, we disclaim all warranties and limit our liability for any damages arising from your use of our service.</strong> We are not responsible for any business losses, data loss, or indirect damages resulting from the use of our analysis or recommendations.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">8. Data and Privacy</h2>
              <p className="mt-3 text-muted-foreground">We collect and process data as described in our Privacy Policy, including:</p>
              <ul className="mt-3 list-disc pl-6 text-muted-foreground space-y-2">
                <li>Website URLs you submit for analysis</li>
                <li>Generated analysis results</li>
                <li>Account information and usage data</li>
              </ul>
              <p className="mt-3 text-muted-foreground">
                By using our service, you consent to data collection and processing as outlined in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">9. Service Availability</h2>
              <p className="mt-3 text-muted-foreground">
                We strive to maintain high service availability but do not guarantee uninterrupted access. We may perform maintenance, updates, or experience technical issues that temporarily affect service availability. We are not liable for any losses resulting from service downtime.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">10. Account Termination</h2>
              <h3 className="mt-4 font-semibold text-foreground">Termination by You</h3>
              <p className="mt-3 text-muted-foreground">
                You may cancel your account at any time. Cancellation takes effect at the end of your current billing cycle, and you will retain access until then.
              </p>
              <h3 className="mt-4 font-semibold text-foreground">Termination by Us</h3>
              <p className="mt-3 text-muted-foreground">
                We may suspend or terminate accounts for violations of these terms, non-payment, or other legitimate business reasons. In case of termination for cause, no refunds will be provided.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">11. Changes to Terms</h2>
              <p className="mt-3 text-muted-foreground">
                We may update these Terms of Service from time to time. Material changes will be communicated via email or through our service. Continued use after changes constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">12. Governing Law</h2>
              <p className="mt-3 text-muted-foreground">
                These terms are governed by Indonesian law. Any disputes will be resolved through binding arbitration or in the courts of Indonesia, depending on the nature and value of the dispute.
              </p>
            </section>

            <section>
              <h2 className="text-xl md:text-2xl font-semibold text-foreground">13. Contact Information</h2>
              <p className="mt-3 text-muted-foreground">
                For questions about these Terms of Service, please contact us:
              </p>
              <p className="text-muted-foreground">
                <strong>Email:</strong> <a className="underline" href="mailto:alexandre@evadigital.fr">alexandre@evadigital.fr</a>
              </p>
            </section>

            <hr className="my-8 border-border" />

            <p className="text-muted-foreground">
              By using Evotha, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
            <p className="text-muted-foreground"><strong>Last updated:</strong> August 2025</p>
          </div>
        </section>
        <FooterSection />
      </main>
    </div>
  );
}


