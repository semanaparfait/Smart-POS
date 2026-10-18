export interface JobOffer {
  id: string;
  title: string;
  company: string;
  companyLogoBg: string;
  companyLogoText: string;
  department: string;
  location: string;
  type: "Full Time" | "Part Time" | "Freelance" | "Contract";
  salary: string;
  postedAgo: string;
  isLiked?: boolean;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  benefits?: string[];
}

export const JOBS_DATA: JobOffer[] = [
  {
    id: "sales-1",
    title: "Field Sales Agent - Retail & Restaurants",
    company: "SmartPOS",
    companyLogoBg: "bg-ink",
    companyLogoText: "S",
    department: "Field Sales",
    location: "Kigali, Rwanda",
    type: "Full Time",
    salary: "50,000 RWF per installation",
    postedAgo: "1 Hr Ago",
    summary:
      "Help SmartPOS grow by visiting restaurants, bars, hotels, supermarkets, pharmacies, and retail shops in Rwanda. Demonstrate the system, explain its benefits, and help businesses get started. Earn 50,000 RWF for each successful installation.",
    responsibilities: [
      "Visit local business owners and introduce them to SmartPOS.",
      "Demonstrate how SmartPOS manages sales, inventory, and business operations.",
      "Identify potential customers and follow up with interested businesses.",
      "Coordinate installations with the SmartPOS team.",
      "Build strong relationships with business owners across Rwanda.",
    ],
    requirements: [
      "Good communication and interpersonal skills.",
      "Confidence in approaching and talking to business owners.",
      "Motivation to work independently and achieve sales targets.",
      "Basic smartphone skills and willingness to learn SmartPOS.",
      "Previous sales experience is an advantage but not mandatory.",
    ],
    benefits: [
      "Earn 50,000 RWF for every successful installation.",
      "Sales training and SmartPOS product demonstrations.",
      "Opportunity to grow with a developing technology company.",
      "Performance-based earning opportunities.",
    ],
  },
  {
    id: "sales-2",
    title: "Independent Sales Agent",
    company: "SmartPOS",
    companyLogoBg: "bg-ink",
    companyLogoText: "S",
    department: "Commission Sales",
    location: "Kigali, Rwanda",
    type: "Freelance",
    salary: "Commission per successful installation",
    postedAgo: "3 Hrs Ago",
    summary:
      "Work flexibly by connecting SmartPOS with business owners in your network. Introduce the system to potential customers and earn commission for every qualifying installation.",
    responsibilities: [
      "Recommend SmartPOS to restaurants, shops, bars, and other businesses.",
      "Find and refer potential customers to the SmartPOS team.",
      "Arrange product demonstrations with interested business owners.",
      "Follow up on referrals until installation is completed.",
    ],
    requirements: [
      "Strong communication and networking skills.",
      "Ability to identify potential business customers.",
      "Self-motivation and a results-oriented attitude.",
      "Previous sales experience is an advantage.",
    ],
    benefits: [
      "Flexible working schedule.",
      "Commission-based earning opportunities.",
      "Product training and sales guidance.",
    ],
  },
  {
    id: "sales-3",
    title: "Regional Sales Representative",
    company: "SmartPOS",
    companyLogoBg: "bg-ink",
    companyLogoText: "S",
    department: "Regional Sales",
    location: "Huye, Rwanda",
    type: "Full Time",
    salary: "Negotiable + Sales Commission",
    postedAgo: "5 Hrs Ago",
    summary:
      "Help expand SmartPOS into businesses in Huye and surrounding areas. Build relationships with local merchants and support the onboarding of new customers.",
    responsibilities: [
      "Identify restaurants, retail shops, pharmacies, and hotels that could benefit from SmartPOS.",
      "Present the product and arrange demonstrations.",
      "Develop a pipeline of potential customers in the assigned area.",
      "Coordinate successful customer onboarding with the technical team.",
      "Submit regular sales and customer acquisition reports.",
    ],
    requirements: [
      "Excellent communication and negotiation skills.",
      "Knowledge of local businesses and the surrounding community.",
      "Ability to travel within the assigned region when needed.",
      "Previous field sales experience is an advantage.",
    ],
    benefits: [
      "Commission on successful sales.",
      "Product and sales training.",
      "Career development opportunities.",
    ],
  },
  {
    id: "sales-4",
    title: "Tele-Sales & Customer Outreach Agent",
    company: "SmartPOS",
    companyLogoBg: "bg-ink",
    companyLogoText: "S",
    department: "Inside Sales",
    location: "Kigali, Rwanda",
    type: "Part Time",
    salary: "Negotiable + Performance Incentives",
    postedAgo: "6 Hrs Ago",
    summary:
      "Connect with potential customers across Rwanda through phone calls and digital communication. Explain SmartPOS features, schedule demonstrations, and help generate new business opportunities.",
    responsibilities: [
      "Contact potential customers using approved contact lists.",
      "Explain SmartPOS features and business benefits.",
      "Schedule demonstrations with interested business owners.",
      "Follow up on leads and maintain accurate customer records.",
      "Share customer feedback with the sales team.",
    ],
    requirements: [
      "Clear verbal and written communication skills.",
      "Comfortable making phone calls and following up with customers.",
      "Basic computer and smartphone skills.",
      "Kinyarwanda and English communication skills are an advantage.",
    ],
    benefits: [
      "Flexible part-time working opportunities.",
      "Sales training and product knowledge.",
      "Performance-based incentives.",
    ],
  },
  {
    id: "sales-5",
    title: "Business Development Agent",
    company: "SmartPOS",
    companyLogoBg: "bg-ink",
    companyLogoText: "S",
    department: "Business Development",
    location: "Musanze, Rwanda",
    type: "Full Time",
    salary: "Negotiable + Commission",
    postedAgo: "8 Hrs Ago",
    summary:
      "Build SmartPOS's presence in Musanze by identifying business opportunities, building merchant relationships, and helping local businesses adopt digital sales and inventory management.",
    responsibilities: [
      "Identify and approach prospective business customers.",
      "Build partnerships with local business communities.",
      "Present SmartPOS solutions and communicate their value.",
      "Track sales leads and meet agreed sales targets.",
      "Coordinate customer onboarding and collect feedback.",
    ],
    requirements: [
      "Strong networking and relationship-building skills.",
      "Ability to communicate product benefits clearly.",
      "Good organization and follow-up skills.",
      "Interest in technology and helping businesses grow.",
    ],
    benefits: [
      "Commission and performance incentives.",
      "Professional development opportunities.",
      "Training and support from the SmartPOS team.",
    ],
  },
  {
    id: "sales-6",
    title: "Junior Sales & Onboarding Agent",
    company: "SmartPOS",
    companyLogoBg: "bg-ink",
    companyLogoText: "S",
    department: "Sales Support",
    location: "Kigali, Rwanda",
    type: "Full Time",
    salary: "Negotiable + Performance Incentives",
    postedAgo: "12 Hrs Ago",
    summary:
      "Help new SmartPOS customers get started by explaining the basic features, supporting initial setup, and ensuring business owners understand how to use the system.",
    responsibilities: [
      "Assist new customers during SmartPOS onboarding.",
      "Explain basic product features and daily sales workflows.",
      "Help coordinate product setup and staff training.",
      "Follow up with newly onboarded businesses.",
      "Report technical issues to the appropriate support team.",
    ],
    requirements: [
      "Willingness to learn new technology.",
      "Good communication and customer service skills.",
      "Basic computer and smartphone knowledge.",
      "Reliable, patient, and organized approach to work.",
      "Previous customer service experience is an advantage.",
    ],
    benefits: [
      "SmartPOS product and onboarding training.",
      "Opportunity to develop sales and technical skills.",
      "Career growth opportunities.",
    ],
  },
];

export function getJobById(id: string): JobOffer | undefined {
  return JOBS_DATA.find((job) => job.id === id);
}