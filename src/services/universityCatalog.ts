import { CountryInfo } from '../types';

export const COUNTRIES_CATALOG: CountryInfo[] = [
  {
    code: 'GLOBAL',
    name: 'Global / Independent',
    flag: '',
    universities: ['Independent Scholar', 'Online / Self-Taught', 'Global Research Pod'],
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '',
    universities: [
      'Tokyo Institute of Technology',
      'University of Tokyo',
      'Kyoto University',
      'Waseda University',
      'Osaka University',
      'Keio University',
    ],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '',
    universities: [
      'University of Oxford',
      'University of Cambridge',
      'Imperial College London',
      'University College London (UCL)',
      'University of Edinburgh',
      'King’s College London',
    ],
  },
  {
    code: 'US',
    name: 'United States',
    flag: '',
    universities: [
      'Harvard University',
      'Massachusetts Institute of Technology (MIT)',
      'Johns Hopkins University',
      'Stanford University',
      'UC Berkeley',
      'Columbia University',
    ],
  },
  {
    code: 'KR',
    name: 'South Korea',
    flag: '',
    universities: [
      'Seoul National University (SNU)',
      'KAIST',
      'Yonsei University',
      'Korea University',
      'Sungkyunkwan University (SKKU)',
    ],
  },
  {
    code: 'UG',
    name: 'Uganda',
    flag: '',
    universities: [
      'Makerere University',
      'Kyambogo University',
      'Mbarara University of Science & Technology',
      'Uganda Christian University (UCU)',
      'Kampala International University',
    ],
  },
  {
    code: 'KE',
    name: 'Kenya',
    flag: '',
    universities: [
      'University of Nairobi',
      'Kenyatta University',
      'Strathmore University',
      'Jomo Kenyatta University of Agriculture & Technology (JKUAT)',
      'Moi University',
    ],
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '',
    universities: [
      'University of Toronto',
      'McGill University',
      'University of British Columbia (UBC)',
      'University of Waterloo',
      'University of Alberta',
    ],
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '',
    universities: [
      'Technical University of Munich (TUM)',
      'LMU Munich',
      'Heidelberg University',
      'RWTH Aachen University',
      'Humboldt University Berlin',
    ],
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '',
    universities: [
      'University of Melbourne',
      'University of Sydney',
      'UNSW Sydney',
      'Australian National University (ANU)',
      'Monash University',
    ],
  },
  {
    code: 'FR',
    name: 'France',
    flag: '',
    universities: [
      'Sorbonne University',
      'École Polytechnique',
      'PSL Research University',
      'Sciences Po',
    ],
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '',
    universities: [
      'National University of Singapore (NUS)',
      'Nanyang Technological University (NTU)',
      'Singapore Management University (SMU)',
    ],
  },
];

export const STUDY_FIELDS = [
  'Medicine & Healthcare (USMLE, Pre-Med)',
  'Computer Science & Software Engineering',
  'Law & Jurisprudence (Bar Exam, LLB)',
  'Biological & Chemical Sciences (MCAT)',
  'Mathematics, Physics & Engineering',
  'Economics, Finance & Business',
  'Humanities, Languages & Arts',
  'Architecture & Industrial Design',
  'A-Levels / High School Prep',
];
