// RealtorX founding texts (owner-provided), shown in the membership journey.

export const MANIFESTO: string[] = [
  'Real estate is not just about land, buildings or transactions. It is about people, dreams and trust.',
  "Every investment represents someone's hard-earned savings. Every project carries the hopes of families, entrepreneurs and communities.",
  'Too often, people are left alone when projects are delayed, investments become uncertain and businesses struggle. RealtorX was created to change that.',
  'We believe the future of real estate is not competition alone; it is collaboration. We are building more than a marketplace. We are building a community:',
  'a platform where professionals connect, opportunities are created, knowledge is shared, partnerships are formed, challenges become solutions and trust is earned through actions.',
  'Every member of RealtorX carries the responsibility to strengthen this community, because our success will never be measured only by properties sold, but by lives improved, businesses empowered, investments protected and relationships built.',
  'Together, we are creating the future of real estate. Connect. Collaborate. Grow.',
];

export const CODE: [string, string][] = [
  ['Integrity First', 'Always tell the truth.'],
  ['Collaboration Before Competition', 'We grow together.'],
  ['Solutions Over Excuses', 'Every problem deserves an honest attempt at a solution.'],
  ['Respect Every Professional', 'Everyone has value.'],
  ['Learn Continuously', 'Knowledge creates opportunity.'],
  ['Give Before You Receive', 'The strongest communities are built by those who contribute.'],
  ['Protect the Community', 'Trust takes years to build and moments to lose.'],
  ['Leave the Industry Better Than You Found It', 'Every action should improve the profession.'],
];

export const OATH: string[] = [
  'I proudly join RealtorX with honesty, integrity and a commitment to serve the real estate community.',
  'I will always place ethics before personal gain.',
  'I will respect every member regardless of their size, experience or background.',
  'I will contribute knowledge, opportunities and support whenever I can.',
  'I will never intentionally mislead, exploit or damage the trust of this community.',
  'I understand that RealtorX is built on collaboration, not selfish competition.',
  'I will protect the reputation of RealtorX through my actions.',
  'I will help solve problems rather than create them.',
  'I will represent professionalism in every interaction.',
  'I join RealtorX not only to grow my own business, but to help strengthen the real estate industry for everyone.',
  'Today, I become more than a member. I become a custodian of the RealtorX mission.',
];

export const PHILOSOPHY =
  'Success is not measured by the number of properties we sell, but by the number of lives, businesses and investments we help transform.';

export const MEMBER_TYPES: { value: string; label: string; description: string; org: boolean }[] = [
  { value: 'Realtor', label: 'Realtor', description: 'Individual property consultant. Get listings, buyer leads and the RealtorX sales desk.', org: false },
  { value: 'Agency', label: 'Agency', description: 'Real estate agency or firm working with a team of realtors.', org: true },
  { value: 'Developer', label: 'Developer', description: 'Builder or project owner. Use the Developer Center and RealtorX realtors.', org: true },
  { value: 'Investor', label: 'Investor', description: 'Invest with verified information, join events and get help from the Solution Desk.', org: false },
  { value: 'Solution Partner', label: 'Solution Partner', description: 'Legal, marketing, construction or finance partner serving the community.', org: true },
];
