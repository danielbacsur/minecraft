import type { Metadata } from "next";
import Link from "next/link";

import { Document, Mail, Section } from "@/app/_components/document";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The agreement between you and Daniel Bacsur LLC governing use of minecraft.danielbacsur.dev.",
};

export default function Page() {
  return (
    <Document title="Terms of Service">
      <p>
        These Terms of Service (the &ldquo;Terms&rdquo;) constitute a binding
        agreement between you and Daniel Bacsur LLC, a Delaware limited
        liability company of 2261 Market Street STE 86805, San Francisco, CA
        94114, United States (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
        &ldquo;our&rdquo;), governing your use of minecraft.danielbacsur.dev
        (the &ldquo;Service&rdquo;). By using the Service you agree to be bound
        by them. If you do not agree, you must not use the Service.
      </p>

      <Section heading="1. No affiliation with Mojang or Microsoft">
        <p>
          NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH
          MOJANG OR MICROSOFT.
        </p>

        <p>
          Minecraft is a trademark of Mojang Synergies AB. We operate
          independently of Mojang Synergies AB and Microsoft Corporation,
          neither of which has endorsed or approved the Service, and we do not
          sell or distribute Minecraft, Minecraft accounts, or any modification
          to the game.
        </p>
      </Section>

      <Section heading="2. The Service and eligibility">
        <p>
          The Service generates Minecraft character skins from text descriptions
          you submit and presents each on a three-dimensional preview.
          Subscribers may download a generated skin as a 64×64 PNG file and
          apply it to their own Minecraft account.
        </p>

        <p>
          You must be at least 13 to register an account, and if you are under
          18 you may use the Service only with the consent of a parent or legal
          guardian. The Service is not directed to children under 13 and we do
          not knowingly permit their registration. A subscription may be
          purchased only by a person aged 18 or over who is the authorised
          cardholder or holds the cardholder&rsquo;s express permission; where
          one is purchased without that permission we will cancel and refund it
          under Section 4.
        </p>

        <p>
          Authentication is performed by Google, Discord or Microsoft, so we
          neither receive nor store your password. You may hold one account and
          are responsible for all activity under it, and should notify us at{" "}
          <Mail /> of any unauthorised use.
        </p>
      </Section>

      <Section heading="3. Plans, fees and renewal">
        <p>
          Without an account you may generate three skins in total; a free
          account allows three each day, reset at 00:00 UTC and not accruing if
          unused. Unlimited removes that limit and adds the right to download
          the PNG file, which is available under a paid subscription only. Where
          we materially reduce what a paid plan includes, we will give prior
          notice and you may terminate.
        </p>

        <p>
          Unlimited is charged at $4.99 USD per month. Stripe, Inc. is the
          merchant of record for your purchase and sells the subscription to you
          on our behalf; we do not receive or store card details, and Stripe,
          Inc. issues your receipt and invoice.{" "}
          <strong>
            The subscription renews automatically each month and continues until
            cancelled
          </strong>
          , each renewal being charged to the payment method on file. The charge
          may be settled in your local currency, in which case the converted
          amount follows the exchange rate applicable at the time and your card
          issuer may add its own fees. Charges appear on your statement as{" "}
          LINK.COM* SKIN STUDIO. Tax is calculated and collected at checkout,
          and Stripe, Inc. registers for, files and remits sales tax, VAT and
          GST in the countries it covers; elsewhere we remain responsible for
          any tax due. We will give not less than 30 days&rsquo; notice of any
          change to the fee, which applies from the next renewal. Where a
          payment fails, collection is retried for a limited period, after which
          the subscription is cancelled and the account reverts to the free
          entitlement.
        </p>

        <p>
          A promotional code applies to a single subscription, may not be
          combined with another offer, carries no cash value and may be
          withdrawn at any time; unless stated otherwise, a code discounting an
          initial period does not apply to renewals.
        </p>
      </Section>

      <Section heading="4. Cancellation and refunds" id="refunds">
        <p>
          You may cancel at any time, without charge, through the billing portal
          reached from the{" "}
          <Link href="/pricing" className="underline underline-offset-4">
            pricing page
          </Link>
          . Cancellation takes effect at the end of the billing period in
          progress; access continues until that date, after which the account
          reverts to the free entitlement. Skins already generated remain
          available to you.
        </p>

        <p>
          We will refund the most recent monthly charge in full on request made
          within 14 days of it, without requiring a reason; any charge made
          without the cardholder&rsquo;s authorisation, in full and at any time;
          and the unused portion of the period where we terminate your account
          other than for breach. We do not otherwise refund periods that have
          elapsed, nor accounts terminated for breach of Section 5. Approved
          refunds are submitted within two business days and returned to the
          original payment method, typically within five to ten business days.
        </p>

        <p>
          Where a charge appears incorrect, contact <Mail /> before initiating a
          chargeback. As merchant of record, Stripe, Inc. also handles payment
          queries and disputes, and you can manage or cancel your subscription
          from the account it provides. The Service is delivered electronically
          and immediately, so no goods are shipped and no return process
          applies.
        </p>
      </Section>

      <Section heading="5. Acceptable use" id="acceptable-use">
        <p>
          The Service is used by children, and the following restrictions are
          conditions of access.
        </p>

        <p>
          You must not submit a description, or use the Service to produce
          content, that is sexual or sexually suggestive; that is hateful, or
          demeans or attacks a person or group by reference to race, ethnicity,
          national origin, religion, disability, sex, gender identity or sexual
          orientation; that targets, harasses or depicts an identifiable
          individual without their consent; that depicts graphic violence or
          gore, or encourages self-harm, suicide or disordered eating; that
          incorporates extremist symbols or promotes terrorism; that
          impersonates a person or organisation to deceive; or that is otherwise
          unlawful. Content of a sexual nature involving a minor is reported to
          the authorities without exception.
        </p>

        <p>
          You must not access the Service by automated means or through any
          interface other than the website; circumvent generation limits, rate
          limits, the download entitlement or any security control, including by
          registering additional accounts; redistribute or resell generated
          skins in bulk; use the Service or its output to train a
          machine-learning model or assemble a competing dataset; or disrupt or
          place undue load on our infrastructure, or attempt to access another
          user&rsquo;s account.
        </p>

        <p>
          We may refuse any request, remove content, suspend or terminate an
          account, and report unlawful content to the authorities. Accounts
          terminated under this Section are not refunded.
        </p>
      </Section>

      <Section heading="6. Your descriptions and generated skins">
        <p>
          You retain such rights as subsist in the descriptions you submit, and
          grant us a non-exclusive, worldwide, royalty-free licence to process
          them in order to operate, secure and improve the Service. Subject to
          your compliance with these Terms, we assign to you such rights as we
          hold in the skins generated for you, which you may use for personal
          and commercial purposes; because generation is automated, identical or
          similar output may be produced for other users, and we give no
          warranty of uniqueness and grant no exclusivity. All rights in the
          Service itself remain vested in us or our licensors.
        </p>
      </Section>

      <Section heading="7. Warranties and liability">
        <p>
          We do not warrant that the Service will be uninterrupted or
          error-free, or that any particular result will be achieved. To the
          maximum extent permitted by law it is provided &ldquo;as is&rdquo; and
          &ldquo;as available&rdquo;, and we disclaim all warranties, express,
          implied or statutory, including merchantability, fitness for a
          particular purpose and non-infringement.
        </p>

        <p>
          To the maximum extent permitted by law we shall not be liable for
          indirect, incidental, special, consequential or punitive damages, or
          for any loss of data, profits or goodwill, and our aggregate liability
          in connection with the Service shall not exceed the greater of the
          fees you paid in the preceding twelve months and fifty US dollars.
          Nothing here excludes liability that cannot lawfully be excluded,
          including for fraud or for death or personal injury resulting from
          negligence, and these Terms do not affect statutory consumer rights
          available where you live.
        </p>
      </Section>

      <Section heading="8. Suspension, termination and amendment">
        <p>
          We may suspend or terminate access where you breach these Terms or
          where required by law; where we terminate a paid account other than
          for breach, we refund the unused portion of the period. You may
          terminate at any time by cancelling and requesting deletion of your
          account at <Mail />, and we handle your personal data as described in
          the{" "}
          <Link href="/privacy" className="underline underline-offset-4">
            Privacy Policy
          </Link>
          .
        </p>

        <p>
          We may amend these Terms, and where an amendment materially affects
          your rights we will give notice through the Service or by email before
          it takes effect. The date above shows when they were last amended.
        </p>
      </Section>

      <Section heading="9. Governing law and general">
        <p>
          These Terms are governed by the laws of the State of Delaware, United
          States, and the state and federal courts sitting there have exclusive
          jurisdiction, save that a consumer may bring proceedings in the courts
          of their country of residence where the law of that country confers
          that right. Before commencing proceedings the parties will attempt in
          good faith to resolve the dispute, beginning with written notice to{" "}
          <Mail />.
        </p>

        <p>
          If any provision is held unenforceable it shall be severed and the
          remainder continue in force. You may not assign your rights under
          these Terms; we may assign ours in connection with a sale of our
          business. These Terms and the Privacy Policy constitute the entire
          agreement between the parties.
        </p>
      </Section>
    </Document>
  );
}
