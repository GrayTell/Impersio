import { Paper, Source } from "../types";

export function getDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace("www.", "");
  } catch (e) {
    return "";
  }
}

export function getFaviconUrl(url: string): string {
  const domain = getDomain(url);
  if (!domain) return "https://www.google.com/s2/favicons?sz=64&domain=fbi.gov";
  return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
}

// Comprehensive catalog of intelligence, military, and federal crime agencies/sources (representing 100+ sources conceptually)
export const INTELLIGENCE_SOURCES = [
  { name: "Federal Bureau of Investigation (FBI)", url: "https://www.fbi.gov", category: "crime" },
  { name: "CIA World Factbook & Intelligence", url: "https://www.cia.gov", category: "counter-terrorism" },
  { name: "National Counterterrorism Center (NCTC)", url: "https://www.dni.gov/index.php/nctc-home", category: "counter-terrorism" },
  { name: "MI5 Security Service", url: "https://www.mi5.gov.uk", category: "counter-terrorism" },
  { name: "Interpol General Secretariat", url: "https://www.interpol.int", category: "crime" },
  { name: "Defense Intelligence Agency (DIA)", url: "https://www.dia.mil", category: "military" },
  { name: "Combating Terrorism Center at West Point", url: "https://ctc.westpoint.edu", category: "counter-terrorism" },
  { name: "Reuters Security & Defense News", url: "https://www.reuters.com", category: "military" },
  { name: "Associated Press Military News", url: "https://apnews.com", category: "military" },
  { name: "Jane's Defence Intelligence", url: "https://www.janes.com", category: "military" },
  { name: "United Nations Counter-Terrorism Committee", url: "https://www.un.org/securitycouncil/ctc", category: "counter-terrorism" },
  { name: "CSIS Transnational Threats Project", url: "https://www.csis.org", category: "counter-terrorism" },
  { name: "Defense News", url: "https://www.defensenews.com", category: "military" },
  { name: "RAND Corporation Security Studies", url: "https://www.rand.org", category: "counter-terrorism" },
  { name: "Federation of American Scientists (FAS)", url: "https://fas.org", category: "military" },
  { name: "Task & Purpose Military Intel", url: "https://taskandpurpose.com", category: "military" },
  { name: "CTC Sentinel Publications", url: "https://ctc.westpoint.edu/ctc-sentinel", category: "counter-terrorism" },
  { name: "Department of Homeland Security (DHS)", url: "https://www.dhs.gov", category: "counter-terrorism" },
  { name: "Bureau of Alcohol, Tobacco, Firearms (ATF)", url: "https://www.atf.gov", category: "crime" },
  { name: "Drug Enforcement Administration (DEA)", url: "https://www.dea.gov", category: "crime" },
  { name: "Europol Operational Centre", url: "https://www.europol.europa.eu", category: "crime" },
  { name: "Defense Threat Reduction Agency", url: "https://www.dtra.mil", category: "military" },
  { name: "Army Link Military News", url: "https://www.army.mil", category: "military" },
  { name: "National Security Agency (NSA)", url: "https://www.nsa.gov", category: "counter-terrorism" }
];

export const SEED_PAPERS: Paper[] = [
  {
    id: "intel_brief_001",
    title: "Global Counter-Terrorism Operations: Strategic Redirection of Core Cells",
    summary: "An analytical briefing on the redistribution of decentralized transnational extremist cells across West Africa and East Asia. Includes operational updates and coordination reports.",
    content: `### Executive Summary
Recent intelligence intercepts and field activities indicate a strategic shift in the organization and logistics of decentralized transnational extremist networks. Deprived of secure havens in primary historical theaters, core operational planners are establishing new, highly specialized logistics hubs.

### Core Areas of Movement
1. **West Sahel Expansion:**
   Coordination networks have leveraged local conflicts to establish deep reconnaissance encampments. Tactical training regimens focus on asymmetric assault strategies.
2. **Maritime Transit Corridors:**
   Interception data shows increased utilization of falsified shipping documentation for small-vessel transits in maritime border regions.
3. **Cryptographic Financial Rails:**
   Funding mechanisms have transitioned almost exclusively to privacy-centric blockchain networks, utilizing decentralized mixers to obfuscate international deposits.

### Defense & Mitigation Response
Coalition task forces are adjusting surveillance profiles to prioritize high-frequency signal detection in regional transit centers. Cross-agency intelligence sharing between Europol, MI5, and local defense commands has been accelerated.`,
    category: "counter-terrorism",
    status: "approved",
    authorId: "admin_seed",
    authorEmail: "sapkotaanubhav91@gmail.com",
    createdAt: "2026-06-08T14:30:00.000Z",
    updatedAt: "2026-06-08T14:30:00.000Z",
    sources: [
      { name: "NCTC Threat Assessment Guide", url: "https://www.dni.gov/index.php/nctc-home" },
      { name: "Jane's Defence Weekly Update", url: "https://www.janes.com" },
      { name: "Combating Terrorism Center (CTC)", url: "https://ctc.westpoint.edu" }
    ]
  },
  {
    id: "intel_brief_002",
    title: "Tactical Assessment of Hypersonic Armament Deployment in Strategic Maritime Corridors",
    summary: "Analysis of new hypersonic battery configurations deployed in coastal defense sectors and their direct impact on carrier strike group deterrence profiles.",
    content: `### Tactical Analysis Briefing
National defense intelligence commands have verified the deployment of three active battery positions configured for modern anti-ship hypersonic projectiles. These facilities represent a substantial escalation in deep-strike capabilities.

### Weapon Specifications & Threat Envelope
- **Maximum Velocity:** Mach 6.4 verified via regional radar arrays.
- **Flight Envelope:** Semi-ballistic low-altitude cruise profiles, minimizing traditional early warning satellite detection.
- **Guidance Systems:** Active thermal seeking arrays with secondary radar homing to counter carrier electronic jamming fields.

### Strategic Consequences
This deployment actively reshapes the security index of key international shipping corridors. Defensive positioning of navy fleets requires adaptive thermal shields and advanced drone-based missile interceptors operating on automated flight decks.`,
    category: "military",
    status: "approved",
    authorId: "admin_seed",
    authorEmail: "sapkotaanubhav91@gmail.com",
    createdAt: "2026-06-07T09:15:00.000Z",
    updatedAt: "2026-06-07T09:15:00.000Z",
    sources: [
      { name: "Defense Intelligence Agency Briefing", url: "https://www.dia.mil" },
      { name: "Reuters Security Coverage", url: "https://www.reuters.com" },
      { name: "FAS Military Analysis Data", url: "https://fas.org" }
    ]
  },
  {
    id: "intel_brief_003",
    title: "Transnational Cyber-Sindicates Targeting Financial Infrastructure: Operational Report",
    summary: "Investigation into a highly organized multi-country crime syndicate deploying custom ransomware payloads targeting banking clearing houses.",
    content: `### Incident Overview
An elite combined task force comprising Interpol and the FBI's Cyber Division has mapped a series of coordinate cyber assaults against central clearing houses. The group, operating under the alias 'CarbonFrost', exhibits high-level military-grade operational security.

### Attack Vector Analysis
1. **Spearphishing of Executives:** Key network engineers were targeted with highly tailored spearphishing campaigns leveraging deep-fake voice recordings.
2. **Zero-Day Exploitation:** Intrusions leveraged a previously unknown remote execution flaw in standard mainframe hypervisors.
3. **Data Exfiltration:** Over 4.2 Terabytes of financial database backups were exfiltrated before the activation of secondary ransomware encryption.

### Legal & Enforcement Initiatives
Inter-agency warrants have been filed across twelve jurisdictions. Seizure of known server command hubs in neutral territories is currently underway under joint tactical authorization.`,
    category: "crime",
    status: "approved",
    authorId: "admin_seed",
    authorEmail: "sapkotaanubhav91@gmail.com",
    createdAt: "2026-06-06T18:45:00.000Z",
    updatedAt: "2026-06-06T18:45:00.000Z",
    sources: [
      { name: "FBI Cyber Security Division Bulletin", url: "https://www.fbi.gov" },
      { name: "Interpol Transnational Organized Crime", url: "https://www.interpol.int" },
      { name: "Europol Operational Reports", url: "https://www.europol.europa.eu" }
    ]
  }
];
