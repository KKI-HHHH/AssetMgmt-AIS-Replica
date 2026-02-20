
import { Asset, User, AssetType, AssetStatus, LicenseType, PlatformAccount, Platform, AccountType, AccountStatus, Request, RequestStatus, SoftwareProfile, HardwareProduct, LicenseVariant, ComplianceStatus, HardwareCondition, AssetFamily, Vendor, AssignmentHistory } from '../types';

// Provided Types from Prompt (Implicitly used to structure data)
interface MockUser {
    id: string | number;
    displayName: string;
    email: string;
}

interface RepoItem {
    id: string;
    title: string;
    assetType: 'ExternalLicense' | 'Hardware';
    prefix: string;
    configuration: string;
    description: string;
    totalCount: number;
    created: string;
    modified: string;
    author: MockUser;
    editor: MockUser;
    vendorName?: string; // Added to map to Vendor
}

// ... Users ...
const CURRENT_USER: User = { 
    id: 'user-1', 
    fullName: 'Kamal Kishore', 
    firstName: 'Kamal',
    lastName: 'Kishore',
    email: 'kamal.kishore@hochhuth-consulting.de',
    avatarUrl: `https://i.pravatar.cc/150?u=kamal-kishore`,
    role: 'admin', 
    isVerified: true,
    jobTitle: 'Junior Developer',
    department: 'General',
    organization: 'Smalsus Infolabs Pvt Ltd',
    dateOfJoining: '2022-05-15',
    dateOfExit: null,
    businessPhone: '7042269388',
    mobileNo: '9350006744',
    address: '100C Jagriti Appartment sector 71 Noida',
    city: 'Noida',
    postalCode: '201307',
    linkedin: 'kamal-kishore-77385921b',
    twitter: '@kamal_kishore',
    userType: 'Internal User',
    extension: '201307',
    permissionGroups: ['Designers', 'GmbH Owners'],
    principalName: 'kamal.kishore@test.com',
    userStatus: 'Active Internal User',
    userTypeDetail: 'Member',
    createdDate: '15/05/2022',
    modifiedDate: '20/05/2024',
    createdBy: 'Admin',
    modifiedBy: 'Admin',
    site: ['SMALSUS'],
    typeOfContact: ['Employee'],
    history: [
        { id: 'h-1', assetName: 'Laptop (Windows)', assetId: 'HW-LAP-0001', date: '2022-05-15', type: 'Assigned', notes: 'Initial device' }
    ]
};

const MOCK_USERS_RAW: MockUser[] = [
  { id: 'user-1', displayName: 'Kamal Kishore', email: 'kamal.kishore@hochhuth-consulting.de' },
  { id: 'user-2', displayName: 'Deepak Trivedi', email: 'deepak.trivedi@example.com' },
  { id: 'user-3', displayName: 'Garima Arya', email: 'garima.arya@hochhuth-consulting.de' },
  { id: 'user-4', displayName: 'Piyoosh Bharadwaj', email: 'piyoosh.bhardwaj@hochhuth-consulting.de' },
  { id: 'user-5', displayName: 'Pravesh Kumar', email: 'Pravesh.Kumar@hochhuth-consulting.de' },
  { id: 'user-6', displayName: 'Ranu Trivedi', email: 'ranu.trivedi@hochhuth-consulting.de' },
  { id: 'user-7', displayName: 'Santosh Kumar', email: 'santosh.kumar@hochhuth-consulting.de' },
  { id: 'user-8', displayName: 'Abhishek Tiwari', email: 'abhishek.tiwari@hochhuth-consulting.de' },
  { id: 'user-9', displayName: 'Aditi Mishra', email: 'aditi.mishra@hochhuth-consulting.de' },
  { id: 'user-10', displayName: 'Aman Munjal', email: 'aman.munjal@hochhuth-consulting.de' },
  { id: 'user-11', displayName: 'Amit Kumar', email: 'amit.kumar@hochhuth-consulting.de' },
  { id: 'user-12', displayName: 'Juli Kumari', email: 'juli@example.com' },
  { id: 'user-13', displayName: 'Shivdutt Mishra', email: 'shivdutt@example.com' },
  { id: 'user-14', displayName: 'Udbhav Sharma', email: 'udbhav@example.com' },
];

const mockPlatformAccounts: PlatformAccount[] = [
  { id: 'acc-1', userId: 'user-1', platform: Platform.SHAREPOINT, accountType: AccountType.INTERNAL, email: 'kamal.kishore@test.com', status: AccountStatus.ACTIVE, createdDate: '15/05/2022' },
  { id: 'acc-2', userId: 'user-1', platform: Platform.GMAIL, accountType: AccountType.INTERNAL, email: 'kamal.kishore@smalsus.com', status: AccountStatus.ACTIVE, createdDate: '15/05/2022' },
  { id: 'acc-3', userId: 'user-2', platform: Platform.SHAREPOINT, accountType: AccountType.INTERNAL, email: 'deepak@example.com', status: AccountStatus.ACTIVE, createdDate: '21/04/2021' },
  { id: 'acc-4', userId: 'user-2', platform: Platform.DOGADO, accountType: AccountType.INTERNAL, email: 'deepak.trivedi@dogado.de', status: AccountStatus.ACTIVE, createdDate: '22/08/2021' },
  { id: 'acc-5', userId: 'user-2', platform: Platform.GMAIL, accountType: AccountType.GUEST, email: 'deepak.t.guest@gmail.com', status: AccountStatus.DISABLED, createdDate: '10/01/2022' },
];

const MOCK_VENDORS: Vendor[] = [
    { id: 'v-1', name: 'Apple', website: 'https://apple.com', contactName: 'Business Support', email: 'business@apple.com' },
    { id: 'v-2', name: 'Dell', website: 'https://dell.com', contactName: 'Sales Rep', email: 'sales@dell.com' },
    { id: 'v-3', name: 'Microsoft', website: 'https://microsoft.com', contactName: 'Licensing Team', email: 'licenses@microsoft.com' },
    { id: 'v-4', name: 'Lenovo', website: 'https://lenovo.com' },
    { id: 'v-5', name: 'Logitech', website: 'https://logitech.com' },
    { id: 'v-6', name: 'OpenAI', website: 'https://openai.com' },
    { id: 'v-7', name: 'Perplexity', website: 'https://perplexity.ai' },
    { id: 'v-8', name: 'TechSmith', website: 'https://techsmith.com' },
];

const INITIAL_REPO_ITEMS: RepoItem[] = [
  {
    id: 'repo-1',
    title: 'ChatGPT',
    assetType: 'ExternalLicense',
    prefix: 'GPT',
    configuration: '<p>Standard Enterprise Subscription</p>',
    description: 'ChatGPT has diverse use cases...',
    totalCount: 5,
    created: '2025-06-11T16:43:00Z',
    modified: '2025-07-30T10:34:00Z',
    author: { id: 'user-1', displayName: 'Kamal Kishore', email: 'kamal.kishore@hochhuth-consulting.de' },
    editor: { id: 'user-1', displayName: 'Kamal Kishore', email: 'kamal.kishore@hochhuth-consulting.de' },
    vendorName: 'OpenAI'
  },
  {
    id: 'repo-pex',
    title: 'Perplexity',
    assetType: 'ExternalLicense',
    prefix: 'PPX',
    configuration: '<p>Standard Subscription</p>',
    description: "Perplexity AI can be used for a wide range of tasks...",
    totalCount: 18,
    created: '2025-06-11T16:43:00Z',
    modified: '2025-07-30T10:34:00Z',
    author: { id: 'user-1', displayName: 'Kamal Kishore', email: 'kamal.kishore@hochhuth-consulting.de' },
    editor: { id: 'user-1', displayName: 'Kamal Kishore', email: 'kamal.kishore@hochhuth-consulting.de' },
    vendorName: 'Perplexity'
  },
  {
    id: 'repo-snap17',
    title: 'Snap17',
    assetType: 'ExternalLicense',
    prefix: 'S17',
    configuration: '<p>Screen capture tool</p>',
    description: 'Professional screen capturing...',
    totalCount: 4,
    created: '2025-06-11T16:43:00Z',
    modified: '2025-07-30T10:34:00Z',
    author: { id: 'user-1', displayName: 'Kamal Kishore', email: 'kamal.kishore@hochhuth-consulting.de' },
    editor: { id: 'user-1', displayName: 'Kamal Kishore', email: 'kamal.kishore@hochhuth-consulting.de' },
    vendorName: 'TechSmith'
  },
  {
    id: 'repo-mbp',
    title: 'MacBook',
    assetType: 'Hardware',
    prefix: 'MM',
    configuration: '<p>M2 Pro, 16GB RAM, 512GB SSD</p>',
    description: 'High performance laptop',
    totalCount: 22,
    created: '2025-01-15T09:00:00Z',
    modified: '2025-02-20T14:20:00Z',
    author: { id: 'user-1', displayName: 'Kamal Kishore', email: 'kamal.kishore@hochhuth-consulting.de' },
    editor: { id: 'user-1', displayName: 'Kamal Kishore', email: 'kamal.kishore@hochhuth-consulting.de' },
    vendorName: 'Apple'
  },
  {
    id: 'repo-sha',
    title: 'Headphones',
    assetType: 'Hardware',
    prefix: 'SHA',
    configuration: '<p>Noise cancelling</p>',
    description: 'Standard issue headphones',
    totalCount: 30,
    created: '2025-01-15T09:00:00Z',
    modified: '2025-02-20T14:20:00Z',
    author: { id: 'user-1', displayName: 'Kamal Kishore', email: 'kamal.kishore@hochhuth-consulting.de' },
    editor: { id: 'user-1', displayName: 'Kamal Kishore', email: 'kamal.kishore@hochhuth-consulting.de' },
    vendorName: 'Logitech'
  }
];

// Correctly exporting missing functions
export const getMockUsers = (): User[] => {
    const departmentCounts: Record<string, number> = {
        'General': 86,
        'SPFX': 19,
        'Management': 14,
        'QA': 5,
        'SPFx': 3
    };

    const users: User[] = [];
    let userIndex = 0;

    Object.entries(departmentCounts).forEach(([dept, count]) => {
        for (let i = 0; i < count; i++) {
            const raw = MOCK_USERS_RAW[userIndex % MOCK_USERS_RAW.length];
            
            // Handle specific named users at the start to match "New Joiners"
            let userData: User;
            if (userIndex === 0) {
                userData = { ...CURRENT_USER, department: dept };
            } else {
                userData = {
                    id: `gen-user-${userIndex}`,
                    fullName: userIndex < MOCK_USERS_RAW.length ? raw.displayName : `User ${userIndex}`,
                    firstName: userIndex < MOCK_USERS_RAW.length ? raw.displayName.split(' ')[0] : `User`,
                    lastName: userIndex < MOCK_USERS_RAW.length ? raw.displayName.split(' ').slice(1).join(' ') : `${userIndex}`,
                    email: userIndex < MOCK_USERS_RAW.length ? raw.email : `user${userIndex}@example.com`,
                    avatarUrl: `https://i.pravatar.cc/150?u=${userIndex}`,
                    role: 'user',
                    isVerified: Math.random() > 0.5,
                    jobTitle: userIndex < 4 ? 'Team Member' : 'Junior Developer',
                    department: dept,
                    organization: 'Smalsus Infolabs',
                    dateOfJoining: userIndex < 4 ? (userIndex === 0 ? '2022-05-15' : '2023-01-10') : '2023-05-20',
                    dateOfExit: null,
                    businessPhone: '',
                    mobileNo: '',
                    address: '',
                    city: '',
                    postalCode: '',
                    linkedin: '',
                    twitter: '',
                    userType: 'Internal',
                    extension: '',
                    permissionGroups: [],
                    principalName: userIndex < MOCK_USERS_RAW.length ? raw.email : `user${userIndex}@example.com`,
                    userStatus: 'Active',
                    userTypeDetail: 'Member',
                    createdDate: '2023-01-10',
                    modifiedDate: '2024-01-01',
                    createdBy: 'Admin',
                    modifiedBy: 'Admin',
                    site: ['SMALSUS'],
                    typeOfContact: ['Employee'],
                    platformAccounts: []
                };
            }
            users.push(userData);
            userIndex++;
        }
    });

    return users;
};

export const getMockVendors = (): Vendor[] => MOCK_VENDORS;

export const getMockAssetFamilies = (): AssetFamily[] => {
    return INITIAL_REPO_ITEMS.map(item => {
        if (item.assetType === 'ExternalLicense') {
            const family: SoftwareProfile = {
                id: item.id,
                assetType: AssetType.LICENSE,
                name: item.title,
                productCode: item.prefix,
                category: 'External',
                vendor: item.vendorName || 'Unknown',
                description: item.description,
                createdDate: item.created,
                lastModifiedDate: item.modified,
                responsibleUser: CURRENT_USER,
                variants: [
                    { id: `var-${item.id}-1`, name: 'Standard', licenseType: LicenseType.SUBSCRIPTION, cost: 20 },
                    { id: `var-${item.id}-2`, name: 'Enterprise', licenseType: LicenseType.SUBSCRIPTION, cost: 60 }
                ],
                assignmentModel: 'Multiple'
            };
            return family;
        } else {
            const family: HardwareProduct = {
                id: item.id,
                assetType: AssetType.HARDWARE,
                name: item.title,
                productCode: item.prefix,
                category: 'Laptop',
                manufacturer: item.vendorName || 'Unknown',
                createdDate: item.created,
                lastModifiedDate: item.modified,
                description: item.description,
                assignmentModel: 'Single'
            };
            return family;
        }
    });
};

export const getMockAssets = (): Asset[] => {
    const families = getMockAssetFamilies();
    const users = getMockUsers();
    const assets: Asset[] = [];
    
    families.forEach(fam => {
        for (let i = 1; i <= 2; i++) {
            const isLicense = fam.assetType === AssetType.LICENSE;
            const asset: Asset = {
                id: `${fam.id}-inst-${i}`,
                assetId: `${fam.productCode}-${String(i).padStart(4, '0')}`,
                familyId: fam.id,
                title: `${fam.name} ${i}`,
                status: AssetStatus.ACTIVE,
                purchaseDate: '2024-02-15',
                cost: isLicense ? 150 : 1500,
                created: '2024-02-15',
                modified: '2024-02-15',
                createdBy: 'Admin',
                modifiedBy: 'Admin',
                assetType: fam.assetType,
                assignedUser: !isLicense && i === 1 ? users[0] : null,
                assignedUsers: isLicense && i === 1 ? [users[0], users[1]] : [],
                variantType: isLicense ? 'Standard' : undefined,
                serialNumber: !isLicense ? `S/N-${fam.productCode}-${i}XYZ` : undefined,
            };
            assets.push(asset);
        }
    });
    return assets;
};

export const getMockRequests = (): Request[] => {
    const users = getMockUsers();
    return [
        {
            id: 'req-1',
            type: 'Software',
            item: 'Perplexity Pro',
            requestedBy: users[2],
            status: RequestStatus.PENDING,
            requestDate: '2024-05-22',
            notes: 'Needed for research automation'
        },
        {
            id: 'req-2',
            type: 'Hardware',
            item: 'MacBook Pro M2',
            requestedBy: users[3],
            status: RequestStatus.APPROVED,
            requestDate: '2024-05-20',
            notes: 'Replacement for damaged unit'
        }
    ];
};
