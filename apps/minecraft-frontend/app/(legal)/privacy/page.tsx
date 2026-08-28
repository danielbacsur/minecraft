import type { Metadata } from "next";

import { Document, Mail, Section } from "@/app/_components/document";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Daniel Bacsur LLC processes personal data on minecraft.danielbacsur.dev.",
};

export default function Page() {
  return (
    <Document title="Privacy Policy">
      <p>
        Daniel Bacsur LLC of 2261 Market Street STE 86805, San Francisco, CA
        94114, United States (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
        &ldquo;our&rdquo;) is the controller of personal data processed through{" "}
        minecraft.danielbacsur.dev (the &ldquo;Service&rdquo;). This policy sets
        out what we process, why, who receives it, and the rights available to
        you.
      </p>

      <Section heading="1. What we process and why">
        <p>
          Where you authenticate through Google, Discord or Microsoft, the
          provider discloses to us your name, email address and profile image,
          and we record which provider was last used; we never receive your
          password. Where you use the Service without registering, we create a
          provisional account so that usage limits can be applied, and transfer
          that activity to your registered account if you later sign up. We
          record the descriptions you submit, an identifier for each skin
          generated and the timestamp, together with your IP address and browser
          user-agent against your session. Where you subscribe, Stripe sells the
          subscription to you as merchant of record and processes the payment;
          we store only your Stripe customer and subscription identifiers, the
          plan, its status and the billing dates, and card details never reach
          our systems.
        </p>

        <p>
          We process this to provide the Service and administer your account,
          and to apply usage entitlements and collect fees, in each case to
          perform our contract with you; and to prevent abuse and fraud, keep
          the Service secure and improve generation quality, which are our
          legitimate interests. We do not process precise location data, and we
          operate no advertising or analytics tracking.
        </p>
      </Section>

      <Section heading="2. Who receives it">
        <p>
          We disclose personal data only to the providers that deliver the
          Service. Stripe, Inc. is the merchant of record for subscriptions,
          processes payments and holds your card details, which never reach us.
          Google, Discord and Microsoft authenticate you and disclose your name,
          email address and profile image when you sign in. Beyond those, your
          data is handled by the hosting, database, translation and
          machine-learning providers that operate the Service on our behalf,
          each bound by contract to process it only on our instructions and each
          established in the United States.
        </p>

        <p>
          We disclose personal data further only where required by law or where
          necessary to establish or defend legal claims. On a sale of our
          business, personal data may transfer as part of that transaction, of
          which you would be given prior notice. We do not sell personal data,
          and we do not share it for cross-context behavioural advertising.
        </p>
      </Section>

      <Section heading="3. Cookies">
        <p>
          We set only those cookies necessary to deliver the Service: a session
          cookie maintaining your authenticated state, and short-lived cookies
          carrying that state across the redirect to and from Google, Discord or
          Microsoft. We set no advertising, analytics or tracking cookies and
          accordingly display no consent banner. Clearing these cookies
          terminates your session.
        </p>
      </Section>

      <Section heading="4. Children">
        <p>
          The Service is intended for persons aged 13 and over and is not
          directed to children under 13, from whom we do not knowingly collect
          personal data. If you believe a child under 13 has provided us with
          personal data, contact <Mail /> and we will delete the account and its
          data. A parent or legal guardian may at any time require us to
          disclose, correct or delete the data we hold concerning their child,
          and to cease further collection.
        </p>
      </Section>

      <Section heading="5. Retention">
        <p>
          We retain account data and generation history for the duration of the
          account and delete them within 30 days of its closure, at which point
          deletion cascades to sessions, linked authentication records and the
          subscription record. Session data, including your IP address and
          user-agent, is kept until the session expires. Billing records
          comprising identifiers, status and dates are kept for seven years, as
          required by applicable tax law.
        </p>
      </Section>

      <Section heading="6. Your rights">
        <p>
          Wherever you live, you may contact <Mail /> to obtain access to,
          correction of, a portable copy of, or deletion of the personal data we
          hold concerning you, or to object to its processing; we respond within
          30 days and levy no charge. In the European Economic Area and the
          United Kingdom you hold the rights conferred by the General Data
          Protection Regulation, including the right to complain to your
          supervisory authority; in California, those conferred by the
          California Consumer Privacy Act as amended. We will not discriminate
          against you for exercising any right.
        </p>

        <p>
          We operate from the United States and our providers are established
          there. Where personal data leaves the European Economic Area or the
          United Kingdom, those providers rely on the European
          Commission&rsquo;s Standard Contractual Clauses, the UK International
          Data Transfer Addendum, or an equivalent safeguard.
        </p>
      </Section>

      <Section heading="7. Security">
        <p>
          The Service is served exclusively over HTTPS. Authentication is
          delegated to Google, Discord and Microsoft, so we hold no passwords,
          and card data goes directly to Stripe, a PCI DSS Level 1 certified
          service provider, without traversing our systems. Access to production
          data is restricted to those who require it. No system is entirely
          secure; where a breach affects you we will notify you and any
          competent supervisory authority without undue delay.
        </p>
      </Section>

      <Section heading="8. Amendments">
        <p>
          We may amend this policy, and where an amendment materially affects
          your rights we will give notice through the Service or by email before
          it takes effect. The date shown above indicates when it was last
          amended.
        </p>
      </Section>
    </Document>
  );
}
