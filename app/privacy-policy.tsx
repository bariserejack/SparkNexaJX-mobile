import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { useAppTheme } from '../lib/theme';

const POLICY_VERSION = 'Version 2.6 - Effective: March 2026';

const SHORT_WAVE = `We know privacy policies are usually long, boring, and full of legal jargon. But your trust matters to us. So we have built this Privacy Nexus to be clear, human, and empowering - while still meeting every legal requirement worldwide.

Here is what you need to know at a glance, then we dive deeper below.`;

const HIGHLIGHTS = [
  'SparkNexaJX is a public learning ecosystem. Your posts, profile, and contributions are visible to the world unless you choose otherwise. Think before you share - it is the internet.',
  'We collect data to make your experience better: what you tell us, what we observe, and what partners share (with your permission). We never sell your personal information.',
  'You control your orbit: privacy settings, data downloads, and account deletion. Every setting is just a few taps away.',
  'Questions? We are here: privacy@sparknexajx.com with 24/7 AI support.',
];

const POLICY_SECTIONS = [
  {
    title: 'Table of Contents',
    body: `1. Information We Collect - Your Digital Fingerprint
2. How We Use Your Information - The Purpose Pulse
3. When We Share Information - The Data Orbit
4. How Long We Keep Information - The Retention Rhythm
5. Your Rights and Controls - The Command Center
6. International Data Transfers - The Global Grid
7. Age Restrictions - The Guardian Gate
8. Policy Updates - The Evolution Log
9. Contact Us - The Support Frequency`,
  },
  {
    title: '1. Information We Collect - Your Digital Fingerprint',
    body: `We collect information in three ways: what you give us, what we observe, and what trusted partners share.

1.1 Information You Provide - The Identity Core
- Personal Account: Display name, username, password, email/phone, birth date, language preference, optional third-party sign-in. Purpose: Create and secure your account.
- Professional Account: All of the above plus professional category, street address, contact email, contact phone (all public). Purpose: Help you build your professional presence.
- Payment Information: Card number, expiration, CVV, billing address. Purpose: Process purchases, tips, and subscriptions.
- Biometric Data: Facial recognition or fingerprint (with explicit consent). Purpose: Enhanced security and identity verification.
- Job Applications: Resume, employment history, skills, preferences. Purpose: Connect you with opportunities.
- Preferences: Your settings choices. Purpose: Respect your wishes.

1.2 Information We Collect When You Use SparkNexaJX - The Activity Pulse
Usage Data
- Posts, comments, replies, and shared resources (with timestamps and app version)
- Study sessions, focus mode usage, and learning streaks
- Interactions: likes, bookmarks, shares, mentions, tags
- Direct messages (content, recipients, timestamps) - encrypted where indicated
- Search queries and link clicks
- Broadcast activity (Spaces, live sessions) including participation history

Device Intelligence
- IP address and connection type
- Browser and operating system
- Device IDs and advertising identifiers
- Installed apps and battery level (with permission)
- Address book (only if you choose to sync)

Location Signals
- Approximate location (always, for service optimization)
- Precise location (only if you enable)
- Places you have used SparkNexaJX (optional)

Identity Inference
- We may associate your account with devices you use, even when not logged in
- Email hashes help us find common connections (with your settings)

Cookie and Tracking Technologies
- We use cookies to remember preferences and improve experience
- You can disable cookies, but some features may not work optimally
- Learn more in our Cookie Frequency document

1.3 Information From Third Parties - The Partner Nexus
- Ad Partners: Cookie IDs, device IDs, hashed emails, demographic data
- Connected Services: When you link Google Classroom, Microsoft Education, or other platforms
- Other Users: People may share information about you (e.g., mentioning you in a post)
- Developers: Apps using our API may share usage data`,
  },
  {
    title: '2. How We Use Your Information - The Purpose Pulse',
    body: `We process your data for five core purposes.

2.1 Operate, Improve, and Personalize Your Experience
Core Operations
- Deliver messages, posts, and study sessions
- Maintain your account and settings
- Process payments and subscriptions

Personalization
- Recommend relevant courses, study groups, and connections
- Show tailored content and ads
- Suggest people to Tune Into

AI Training
- We may use your data (anonymized where possible) to train our machine learning models
- This helps us improve recommendations, safety systems, and learning tools
- You can opt out of non-essential AI training in settings

2.2 Foster Safety and Security
- Verify your identity and age
- Detect and prevent fraud, spam, and abuse
- Enforce Community Standards
- Protect your account from unauthorized access

2.3 Measure and Improve
- Analyze usage patterns to enhance features
- Conduct A/B testing and product research
- Monitor system performance and reliability

2.4 Communicate With You
- Service updates and policy changes
- Personalized learning reminders and streak alerts
- Marketing messages (only if you opt in)

2.5 Research and Development
- Surveys and user testing
- Troubleshooting and bug fixes
- Academic research partnerships (anonymized data only)`,
  },
  {
    title: '3. When We Share Information - The Data Orbit',
    body: `We share your information only in these specific contexts.

3.1 Public Content - The Open Frequency
- Your profile (name, username, bio) is always public
- Posts, comments, and shared resources are visible globally
- Search engines may index your public content
- Downloads and screenshots can be shared elsewhere

3.2 With Other Users - The Tuned Network
- Direct messages go only to recipients
- Study group content is visible to all members
- Your interactions (likes, follows) are visible to those who can see the original content

3.3 With Service Providers - The Trusted Orbit
We work with trusted partners who help us:
- Process payments (Stripe, PayPal, etc.)
- Host and deliver content (cloud providers)
- Analyze data and improve our services
- Verify identities and prevent fraud
All partners sign strict data protection agreements.

3.4 With Advertisers - The Sponsored Pulse
- Advertisers see aggregated, anonymized performance data
- When you click an ad, the advertiser knows you came from SparkNexaJX
- We never share your identity with advertisers without consent

3.5 With Your Consent - The Permission Signal
- When you connect third-party apps (e.g., Share to Notion)
- When you participate in research studies
- When you authorize data sharing for specific purposes

3.6 For Legal Reasons - The Compliance Wave
We may share information if we believe it is reasonably necessary to:
- Comply with laws, regulations, or legal process
- Protect against fraud or security threats
- Enforce our Terms of Service
- Prevent imminent harm to any person

3.7 With Affiliates - The Corporate Nexus
We may share data within our family of companies to provide seamless services.

3.8 During Corporate Changes - The Transition Orbit
If SparkNexaJX is acquired, merged, or sold, your data will transfer to the new entity under this Privacy Policy or its equivalent.`,
  },
  {
    title: '4. How Long We Keep Information - The Retention Rhythm',
    body: `We do not keep your data forever. Here is our retention schedule:
- Profile information: Duration of account
- Posts and shared content: Duration of account (or until deleted)
- Direct messages: Duration of account (deleted when both parties delete)
- Payment information: Duration of paid service plus 7 years (legal requirement)
- Usage logs: 18 months
- Cookie data: 13 months
- Ad interaction data: 12 months
- Partner-shared data: 12 months
- Suspended account identifiers: Indefinitely (to prevent repeat abuse)

Exceptions:
- Legal holds: Longer if required by law
- Litigation: Until case resolution
- Safety investigations: As needed

Remember: Even after you delete content, copies may exist in backups, search engine caches, or other users' downloads. We cannot control the entire internet.`,
  },
  {
    title: '5. Your Rights and Controls - The Command Center',
    body: `You have full command over your data.

5.1 Access and Correction
- View and edit your profile anytime in Settings -> Identity Core
- Download your complete data archive: Settings -> Privacy Nexus -> Export My Data
- Request additional information via privacy@sparknexajx.com

5.2 Privacy Controls
- Tune In Privacy: Who can follow you and see your posts
- Message Filters: Who can send you direct messages
- Data Sharing with Partners: Control whether anonymized data helps improve partner services
- Location Services: Choose precise vs. approximate location
- Ad Personalization: Opt out of interest-based ads
- AI Training Opt-Out: Prevent your data from being used for model training

5.3 Deletion
- Deactivate your account: Settings -> Account -> Deactivate
- Data is queued for deletion within 30 days
- You can restore during this period
- After 30 days, deletion is permanent

5.4 Withdrawing Consent
- Change your mind anytime in settings
- Some features may be limited if you withdraw essential permissions

5.5 Authorized Agents
If you are acting on someone's behalf (e.g., parent or legal representative), contact us at legal@sparknexajx.com with proper verification.`,
  },
  {
    title: '6. International Data Transfers - The Global Grid',
    body: `SparkNexaJX connects learners worldwide. That means your data may travel across borders.

6.1 Where We Operate
- Data centers in North America, Europe, and Asia
- Cloud providers and partners globally

6.2 How We Protect Cross-Border Data
- Standard Contractual Clauses (SCCs) - EU-approved data transfer agreements
- Data Privacy Framework (DPF) - Certified for EU-US, Swiss-US, and UK transfers
- Binding Corporate Rules - Within our corporate group

6.3 Your Rights
If you are in the EU, UK, or Switzerland:
- You can request a copy of our SCCs
- You can lodge complaints with your local Data Protection Authority
- Our lead supervisory authority is the Irish Data Protection Commission`,
  },
  {
    title: '7. Age Restrictions - The Guardian Gate',
    body: `SparkNexaJX is designed for learners of all ages, but with appropriate safeguards.

Age Range and Requirements
- Under 13: Not permitted. Cannot create account.
- 13-17: Limited Account. Parental consent required, restricted features, enhanced privacy.
- 18+: Full Account with standard features.

For users under 18:
- Profiles default to private
- Direct messages restricted
- No personalized advertising
- Parental dashboard available

Parents and Guardians:
- You can request account deletion for your child
- Contact guardian@sparknexajx.com for assistance
- View our Family Center for resources`,
  },
  {
    title: '8. Policy Updates - The Evolution Log',
    body: `We update this policy as SparkNexaJX grows.

8.1 How We Notify You
- Minor changes: Updated Effective Date at top
- Material changes: In-app notification plus email and prompt to review

8.2 Your Continued Use
By using SparkNexaJX after changes take effect, you accept the updated policy. If you disagree, you can delete your account.

8.3 Version History
- Version 2.6 (March 2026): Added AI training opt-out, expanded biometric consent, updated DPF certification
- Version 2.5 (October 2025): Enhanced parental controls, clarified international transfers
- Version 2.0 (June 2025): Major rewrite for clarity and user empowerment`,
  },
  {
    title: '9. Contact Us - The Support Frequency',
    body: `We are here to help.

Email
- privacy@sparknexajx.com (response within 48 hours)

Mailing Addresses
Americas and Asia-Pacific:
SparkNexaJX Inc.
Attn: Privacy Nexus
548 Market Street, Suite 98960
San Francisco, CA 94104
USA

Europe, Middle East, and Africa:
SparkNexaJX Ireland Ltd.
Attn: Data Protection Officer
One Customs House Plaza
Dublin 1, D01 X5X7
IRELAND

United Kingdom:
SparkNexaJX UK Ltd.
Attn: Privacy Team
20 Air Street, 4th Floor
London, W1B 5AN
UNITED KINGDOM

Phone (Emergency Only)
+1 (415) 555-NEXA (6392)

Online
- Privacy Request Portal: sparknexajx.com/privacy-portal
- Data Subject Access Requests: sparknexajx.com/dsar
- Report a Concern: sparknexajx.com/report

Response Times
- General inquiries: 48 hours
- Data access requests: 30 days (GDPR requirement)
- Deletion requests: 30 days
- Urgent safety issues: 24 hours`,
  },
  {
    title: 'Additional Information',
    body: `California Residents - CCPA Notice
- Right to know what personal information we collect
- Right to delete your information
- Right to opt out of sales (we do not sell)
- Right to non-discrimination for exercising your rights
To exercise your CCPA rights: Settings -> Privacy Nexus -> California Privacy or email california@sparknexajx.com.

Nevada Residents
We do not sell your covered information as defined by Nevada law. If this changes, we will update you.

International Users
If you are outside the United States, your data may be transferred to and processed in the United States or other countries with different data protection laws. By using SparkNexaJX, you consent to this transfer.`,
  },
  {
    title: 'Your Consent',
    body: `By creating a SparkNexaJX account or using our services, you acknowledge that you have read and understood this Privacy Nexus. If you do not agree, please do not use SparkNexaJX.

Last updated: March 20, 2026

[ BACK TO TOP ]  [ DOWNLOAD PDF ]  [ PRINT VERSION ]`,
  },
];

export default function PrivacyPolicyScreen() {
  const { activeTheme } = useAppTheme();
  const { from } = useLocalSearchParams<{ from?: string }>();

  const handleBack = () => {
    if (from === 'settings') {
      router.replace('/settings');
      return;
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/settings');
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.background }]}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: activeTheme.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={16} color={activeTheme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: activeTheme.text }]}>Privacy Policy</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.versionText, { color: activeTheme.textMuted }]}>{POLICY_VERSION}</Text>

          <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Before You Tune In - The Short Wave</Text>
          <View style={[styles.card, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
            <Text style={[styles.bodyText, { color: activeTheme.text }]}>{SHORT_WAVE}</Text>
          </View>

          <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>Highlights</Text>
          <View style={[styles.card, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
            {HIGHLIGHTS.map((item, index) => (
              <View key={item}>
                <Bullet text={item} theme={activeTheme} />
                {index < HIGHLIGHTS.length - 1 ? <Divider theme={activeTheme} /> : null}
              </View>
            ))}
          </View>

          {POLICY_SECTIONS.map((section) => (
            <View key={section.title}>
              <Text style={[styles.sectionLabel, { color: activeTheme.textMuted }]}>{section.title}</Text>
              <View style={[styles.card, { borderColor: activeTheme.border, backgroundColor: activeTheme.card }]}>
                <Text style={[styles.bodyText, { color: activeTheme.text }]}>{section.body}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Bullet({ text, theme }: { text: string; theme: any }) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: theme.textMuted }]} />
      <Text style={[styles.rowText, { color: theme.text }]}>{text}</Text>
    </View>
  );
}

function Divider({ theme }: { theme: any }) {
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 34, alignItems: 'flex-start' },
  headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.3 },
  headerSpacer: { width: 34 },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 28 },
  versionText: { fontSize: 12, fontWeight: '700', marginBottom: 10 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  card: { borderWidth: 1, borderRadius: 18, overflow: 'hidden', padding: 14, gap: 10 },
  bodyText: { fontSize: 13, fontWeight: '500', lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  rowText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 7 },
  divider: { height: 1, opacity: 0.5, marginVertical: 8 },
});
