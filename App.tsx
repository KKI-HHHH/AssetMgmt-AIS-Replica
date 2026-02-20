
import React, { useState, useEffect, useMemo } from 'react';
import { Asset, User, ColumnDef, AssetType, AssetStatus, Request, RequestStatus, AssetFamily, SoftwareProfile, Config, Task, TaskStatus, Vendor, AssignmentHistory } from './types';
import { getMockAssets, getMockUsers, getMockRequests, getMockAssetFamilies, getMockVendors } from './services/mockData';
import DataTable from './components/DataTable';
import UserProfile from './components/UserProfile';
import AssetFormModal from './components/AssetFormModal';
import EditProfileModal from './components/EditProfileModal';
import RequestAssetModal from './components/RequestAssetModal';
import AssetProfile from './components/AssetProfile';
import AdminDashboard from './components/AdminDashboard';
import TaskModal from './components/TaskModal';
import { ImportType } from './components/DataImportModal';
import { formatDisplayDate } from './utils';
import { Plus, FileText, Package, UserCheck, PackageOpen, Clock, Users, Tv, KeyRound, ArrowRight, User as UserIcon, ThumbsUp, ThumbsDown, Check, X, Folder, Layers, LineChart, Settings, LayoutDashboard, FileSpreadsheet, Monitor, UserSquare2, ClipboardList, BarChart3, ShieldAlert, List, ChevronDown, LogOut, Briefcase, UserPlus, AlertCircle, TrendingUp, CheckSquare, ListTodo, Search } from 'lucide-react';

// Custom Edit Icon based on user provided SVG (Edit Document/File style)
export const CustomEditIcon: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 2048 2048"
    className={className}
    fill="currentColor"
  >
    <path d="M2048 128v640h-128V640H128v1024h640v128H0V128h2048zm-128 128H128v256h1792V256zm-72 640q42 0 78 15t64 42t42 63t16 78q0 39-15 76t-43 65l-717 719l-377 94l94-377l717-718q28-28 65-42t76-15zm51 249q21-21 21-51q0-31-20-50t-52-20q-14 0-27 4t-23 15l-692 694l-34 135l135-34l692-693z"/>
  </svg>
);

type View = 'dashboard' | 'licenses' | 'hardware' | 'users' | 'requests' | 'reports' | 'admin';
type ModalMode = 'family' | 'instance';
type RequestCategory = 'Microsoft' | 'External' | 'Hardware';

const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, cssVar: string, subtext?: string, onClick?: () => void }> = ({ icon: Icon, title, value, cssVar, subtext, onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white p-5 rounded shadow-sm flex items-start justify-between border border-bordergrey hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer hover:border-siteblue/40' : ''}`}
  >
    <div>
      <p className="text-disabledgrey text-sm font-medium mb-1">{title}</p>
      <p className="text-2xl font-bold text-textblack">{value}</p>
      {subtext && <p className="text-xs text-disabledgrey mt-1">{subtext}</p>}
    </div>
    <div className="p-3 rounded" style={{ backgroundColor: `color-mix(in srgb, var(${cssVar}), transparent 90%)` }}>
      <Icon className="h-6 w-6" style={{ color: `var(${cssVar})` }} />
    </div>
  </div>
);

const UserSwitcher: React.FC<{ users: User[], currentUser: User | null, onSwitch: (user: User) => void }> = ({ users, currentUser, onSwitch }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-3 py-2 bg-white hover:bg-rowgrey rounded transition-colors border border-bordergrey"
            >
                <div className="w-8 h-8 rounded-full bg-rowgrey flex items-center justify-center overflow-hidden">
                    {currentUser ? <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="w-full h-full object-cover"/> : <UserIcon size={18} className="text-disabledgrey"/>}
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-textblack">{currentUser?.fullName || 'Select User'}</p>
                    <p className="text-[10px] text-disabledgrey uppercase tracking-wide">{currentUser?.role || 'Guest'}</p>
                </div>
                <ChevronDown size={14} className="text-disabledgrey" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded shadow-lg border border-bordergrey py-2 z-50">
                    <div className="px-4 py-2 border-b border-bordergrey text-xs font-semibold text-disabledgrey uppercase tracking-wider mb-1">
                        Switch Account (Mock)
                    </div>
                    <div className="grid grid-cols-2 max-h-[400px] overflow-y-auto">
                        {users.map(user => (
                            <button 
                                key={user.id}
                                onClick={() => { onSwitch(user); setIsOpen(false); }}
                                className={`text-left px-4 py-2 flex items-center gap-2 hover:bg-rowgrey transition-colors border-b border-transparent ${currentUser?.id === user.id ? 'bg-siteblue/10' : ''}`}
                            >
                                <img src={user.avatarUrl} alt={user.fullName} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className={`text-xs font-medium truncate ${currentUser?.id === user.id ? 'text-siteblue' : 'text-textblack'}`}>{user.fullName}</p>
                                </div>
                                {currentUser?.id === user.id && <Check size={12} className="ml-auto text-siteblue flex-shrink-0"/>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const GlobalSearch: React.FC<{ users: User[], assets: Asset[], families: AssetFamily[], onSelect: (type: 'user' | 'asset' | 'family', item: any) => void }> = ({ users, assets, families, onSelect }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredResults = useMemo(() => {
        if (!query) return { users: [], assets: [], families: [] };
        const q = query.toLowerCase();
        return {
            users: users.filter(u => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)).slice(0, 3),
            assets: assets.filter(a => a.title.toLowerCase().includes(q) || a.assetId.toLowerCase().includes(q)).slice(0, 3),
            families: families.filter(f => f.name.toLowerCase().includes(q)).slice(0, 3)
        }
    }, [query, users, assets, families]);

    const hasResults = filteredResults.users.length > 0 || filteredResults.assets.length > 0 || filteredResults.families.length > 0;

    return (
        <div className="relative w-full max-w-md mx-auto hidden lg:block">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-disabledgrey pointer-events-none"/>
                <input 
                    type="text" 
                    placeholder="Search users, assets, products..." 
                    value={query}
                    onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-bordergrey rounded text-sm transition-all outline-none"
                />
            </div>
            {isOpen && query && hasResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded shadow-xl border border-bordergrey py-2 z-50 overflow-hidden">
                    {filteredResults.users.length > 0 && (
                        <div>
                            <div className="px-4 py-1.5 text-xs font-semibold text-disabledgrey uppercase tracking-wide bg-rowgrey">Users</div>
                            {filteredResults.users.map(u => (
                                // Use onSelect prop instead of undefined handleUserClick
                                <button key={u.id} onMouseDown={() => onSelect('user', u)} className="w-full text-left px-4 py-2 hover:bg-siteblue/10 flex items-center gap-3">
                                    <img src={u.avatarUrl} className="w-6 h-6 rounded-full" />
                                    <span className="text-sm text-textblack">{u.fullName}</span>
                                </button>
                            ))}
                        </div>
                    )}
                    {filteredResults.assets.length > 0 && (
                        <div>
                            <div className="px-4 py-1.5 text-xs font-semibold text-disabledgrey uppercase tracking-wide bg-rowgrey border-t border-bordergrey">Assets</div>
                            {filteredResults.assets.map(a => (
                                // Use onSelect prop instead of undefined handleEditAsset
                                <button key={a.id} onMouseDown={() => onSelect('asset', a)} className="w-full text-left px-4 py-2 hover:bg-siteblue/10">
                                    <p className="text-sm text-textblack font-medium">{a.title}</p>
                                    <p className="text-xs text-disabledgrey font-mono">{a.assetId}</p>
                                </button>
                            ))}
                        </div>
                    )}
                    {filteredResults.families.length > 0 && (
                        <div>
                            <div className="px-4 py-1.5 text-xs font-semibold text-disabledgrey uppercase tracking-wide bg-rowgrey border-t border-bordergrey">Products</div>
                            {filteredResults.families.map(f => (
                                // Use onSelect prop instead of undefined handleFamilyClick
                                <button key={f.id} onMouseDown={() => onSelect('family', f)} className="w-full text-left px-4 py-2 hover:bg-siteblue/10">
                                    <p className="text-sm text-textblack font-medium">{f.name}</p>
                                    <p className="text-xs text-disabledgrey">{f.assetType}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [assetFamilies, setAssetFamilies] = useState<AssetFamily[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  
  const [config, setConfig] = useState<Config>({
    softwareCategories: ['Microsoft', 'External'],
    hardwareCategories: ['Laptop', 'Monitor', 'Keyboard', 'Mac Mini', 'Accessory'],
    sites: ['HR', 'GMBH', 'SMALSUS'],
    departments: ['General', 'SPFX', 'Management', 'QA', 'SPFx', 'Cloud Services'],
    idConfiguration: [
        { id: 'sec-1', type: 'attribute', value: 'prefix', label: 'Prefix', length: 4, uppercase: true },
        { id: 'sec-3', type: 'attribute', value: 'productCode', label: 'Product Code', length: 4, uppercase: true },
        { id: 'sec-5', type: 'attribute', value: 'version', label: 'Version Code', length: 3, uppercase: true },
        { id: 'sec-7', type: 'sequence', value: 'sequence', label: 'Sequence', length: 4, paddingChar: '0' },
    ],
    idSeparator: '-',
    assetTypes: [
        { id: 'at-1', name: 'License', prefix: 'LIC' },
        { id: 'at-2', name: 'Hardware', prefix: 'HW' },
        { id: 'at-3', name: 'Platform Accounts', prefix: 'ACC' },
    ],
    modalLayouts: {
        licenseFamily: {
            tabs: [
                { 
                    id: 'profile', 
                    label: 'Profile Information', 
                    sections: [
                        { id: 'sec-ident', title: 'Identity', columns: 2, fields: ['name', 'productCode', 'vendor', 'assignmentModel'] },
                        { id: 'sec-class', title: 'Classification', columns: 2, fields: ['category', 'description'] }
                    ]
                },
                { 
                    id: 'variants', 
                    label: 'Variants', 
                    sections: [
                        { id: 'sec-var', title: 'Tier Configuration', columns: 1, fields: ['variants'] }
                    ]
                }
            ]
        },
        hardwareFamily: {
            tabs: [
                { 
                    id: 'profile', 
                    label: 'General Details', 
                    sections: [
                        { id: 'sec-hw-ident', title: 'Identity', columns: 2, fields: ['name', 'productCode', 'modelNumber', 'manufacturer', 'assignmentModel'] },
                        { id: 'sec-hw-class', title: 'Classification', columns: 2, fields: ['category', 'description'] }
                    ]
                }
            ]
        },
        licenseInstance: {
            tabs: [
                { 
                    id: 'general', 
                    label: 'General Details', 
                    sections: [
                        { id: 'sec-li-gen', title: 'Core Info', columns: 2, fields: ['title', 'assetId', 'status', 'variantType', 'licenseKey', 'email'] }
                    ]
                },
                { 
                    id: 'assignment', 
                    label: 'Assignments', 
                    sections: [
                        { id: 'sec-li-assign', title: 'Ownership & Active Users', columns: 2, fields: ['assignedUsers', 'activeUsers'] }
                    ]
                },
                { 
                    id: 'financials', 
                    label: 'Financials & Compliance', 
                    sections: [
                        { id: 'sec-li-fin', title: 'Costing', columns: 1, fields: ['currencyTool'] },
                        { id: 'sec-li-dates', title: 'Dates & Status', columns: 2, fields: ['purchaseDate', 'renewalDate', 'complianceStatus'] }
                    ]
                },
                {
                    id: 'history',
                    label: 'History',
                    sections: [
                        { id: 'sec-li-hist', title: 'Assignment & Usage Log', columns: 1, fields: ['assignmentHistory'] }
                    ]
                }
            ]
        },
        hardwareInstance: {
            tabs: [
                { 
                    id: 'general', 
                    label: 'General Details', 
                    sections: [
                        { id: 'sec-hi-gen', title: 'Core Info', columns: 2, fields: ['title', 'assetId', 'status', 'serialNumber', 'macAddress', 'location', 'condition'] }
                    ]
                },
                { 
                    id: 'assignment', 
                    label: 'Assignments', 
                    sections: [
                        { id: 'sec-hi-assign', title: 'Ownership & Active Users', columns: 2, fields: ['assignedUser', 'activeUsers'] }
                    ]
                },
                { 
                    id: 'financials', 
                    label: 'Financials & Dates', 
                    sections: [
                        { id: 'sec-hi-fin', title: 'Costing', columns: 1, fields: ['currencyTool'] },
                        { id: 'sec-hi-dates', title: 'Dates', columns: 2, fields: ['purchaseDate', 'warrantyExpiryDate'] }
                    ]
                },
                {
                    id: 'history',
                    label: 'History',
                    sections: [
                        { id: 'sec-li-hist', title: 'Assignment & Usage Log', columns: 1, fields: ['assignmentHistory'] }
                    ]
                }
            ]
        },
        userProfile: {
            tabs: [
                {
                    id: 'basic',
                    label: 'Basic Information',
                    sections: [
                        { id: 'sec-u-gen', title: 'General', columns: 3, fields: ['firstName', 'lastName', 'suffix', 'jobTitle', 'department', 'site', 'typeOfContact'] },
                        { id: 'sec-u-soc', title: 'Social Media Accounts', columns: 2, fields: ['linkedin', 'twitter', 'facebook', 'instagram'] },
                        { id: 'sec-u-con', title: 'Contacts', columns: 2, fields: ['businessPhone', 'mobileNo', 'email', 'nonPersonalEmail', 'homePhone', 'skype', 'address', 'city'] },
                        { id: 'sec-u-com', title: 'Comments', columns: 1, fields: ['notes'] }
                    ]
                },
                {
                    id: 'image',
                    label: 'Image Information',
                    sections: [
                        { id: 'sec-u-img', title: 'Avatar', columns: 1, fields: ['avatarUpload'] }
                    ]
                }
            ]
        }
    }
  });
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('instance');
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [editingFamily, setEditingFamily] = useState<AssetFamily | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestingUser, setRequestingUser] = useState<User | null>(null);
  const [requestCategory, setRequestCategory] = useState<RequestCategory | null>(null);
  
  // Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [requestForTask, setRequestForTask] = useState<Request | null>(null);

  const [activeView, setActiveView] = useState<View>('dashboard');
  const [assetViewMode, setAssetViewMode] = useState<'families' | 'items'>('items');

  useEffect(() => {
    const mockUsers = getMockUsers();
    setUsers(mockUsers);
    setAssetFamilies(getMockAssetFamilies());
    setAssets(getMockAssets());
    setRequests(getMockRequests());
    setVendors(getMockVendors());
    
    // Set default user (Admin)
    if (mockUsers.length > 0) {
        setCurrentUser(mockUsers[0]);
    }
  }, []);

  // Update view mode when switching users to avoid restricted views
  useEffect(() => {
      if (currentUser && currentUser.role !== 'admin') {
          if (['users', 'admin', 'reports'].includes(activeView)) {
              setActiveView('dashboard');
          }
          // Normal users default to Item view
          setAssetViewMode('items');
      }
  }, [currentUser, activeView]);

  const isAdmin = currentUser?.role === 'admin';
  const adminUsers = useMemo(() => users.filter(u => u.role === 'admin'), [users]);

  const handleNavigation = (view: View) => {
    setActiveView(view);
    setSelectedUser(null);
    setSelectedFamilyId(null);
    // Admins default to Items view as per request, with toggle available
    if (view === 'licenses' || view === 'hardware') {
        setAssetViewMode('items');
    }
  };

  const handleUserClick = (user: User) => {
    // Only admins can view other profiles
    if (isAdmin || user.id === currentUser?.id) {
        setSelectedUser(user);
        setSelectedFamilyId(null);
    }
  };
  
  const handleFamilyClick = (family: AssetFamily) => {
    setSelectedFamilyId(family.id);
    setSelectedUser(null);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    setSelectedFamilyId(null);
  };

  const handleSaveFamily = (family: AssetFamily) => {
     if (editingFamily) {
      setAssetFamilies(assetFamilies.map(f => f.id === family.id ? { ...family, lastModifiedDate: new Date().toISOString() } : f));
    } else {
      const productCode = family.name.substring(0, 4).toUpperCase();
      const newFamily = { ...family, id: `fam-${new Date().toISOString()}`, productCode, createdDate: new Date().toISOString(), lastModifiedDate: new Date().toISOString() };
      setAssetFamilies([...assetFamilies, newFamily as AssetFamily]);
    }
    closeAssetModal();
  };
  
  const handleBulkCreate = (family: AssetFamily, variantName: string, quantity: number, commonData: Partial<Asset>) => {
    const newAssets: Asset[] = [];
    const familyPrefix = family.assetType === AssetType.LICENSE ? 'SOFT' : 'HARD';
    const productCode = (family as any).productCode || 'GEN';
    const familyInstances = assets.filter(a => a.familyId === family.id);
    let sequenceStart = familyInstances.length + 1;

    for (let i = 0; i < quantity; i++) {
      const sequenceNumber = String(sequenceStart + i).padStart(4, '0');
      const assetId = `${familyPrefix}-${productCode}-${sequenceNumber}`;
      const newAsset: Asset = {
          purchaseDate: new Date().toISOString().split('T')[0],
          cost: 0,
          ...commonData,
          id: `inst-${new Date().getTime() + i}`,
          assetId,
          familyId: family.id,
          title: `${family.name} ${sequenceStart + i}`,
          status: AssetStatus.AVAILABLE,
          assetType: family.assetType,
          variantType: variantName,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          createdBy: 'Admin (Bulk)',
          modifiedBy: 'Admin (Bulk)',
      };
      newAssets.push(newAsset);
    }
    setAssets(prev => [...prev, ...newAssets]);
  };

  const handleSaveAsset = (asset: Asset) => {
    let finalAsset = { ...asset };
    const today = new Date().toISOString().split('T')[0];
    let newHistoryEntries: AssignmentHistory[] = [];
    
    // Assignment History Logic
    if (editingAsset) {
        const oldUser = editingAsset.assignedUser;
        const newUser = asset.assignedUser;
        const oldUsers = editingAsset.assignedUsers || [];
        const newUsers = asset.assignedUsers || [];

        if (oldUser?.id !== newUser?.id) {
            if (oldUser) {
                newHistoryEntries.push({
                    id: `hist-${Date.now()}-1`,
                    assetId: asset.assetId,
                    assetName: asset.title,
                    date: today,
                    type: 'Reassigned',
                    assignedFrom: oldUser.fullName,
                    assignedTo: newUser?.fullName || 'Unassigned',
                    notes: `Reassigned from ${oldUser.fullName} to ${newUser ? newUser.fullName : 'Inventory'}`
                });
            } else if (newUser) {
                 newHistoryEntries.push({
                    id: `hist-${Date.now()}-1`,
                    assetId: asset.assetId,
                    assetName: asset.title,
                    date: today,
                    type: 'Assigned',
                    assignedTo: newUser.fullName,
                    notes: `Assigned to ${newUser.fullName}`
                });
            }
        }

        const oldIds = oldUsers.map(u => u.id).sort().join(',');
        const newIds = newUsers.map(u => u.id).sort().join(',');
        if (oldIds !== newIds && newUsers.length > 0) { 
             newHistoryEntries.push({
                    id: `hist-${Date.now()}-2`,
                    assetId: asset.assetId,
                    assetName: asset.title,
                    date: today,
                    type: 'Reassigned',
                    notes: `License assignment updated. Now assigned to ${newUsers.length} users.`
                });
        }

        const oldActive = (editingAsset.activeUsers || []).map(u => u.id).sort().join(',');
        const newActive = (asset.activeUsers || []).map(u => u.id).sort().join(',');
        
        if (oldActive !== newActive) {
            const added = (asset.activeUsers || []).filter(u => !editingAsset.activeUsers?.some(old => old.id === u.id));
            const removed = (editingAsset.activeUsers || []).filter(u => !asset.activeUsers?.some(newU => newU.id === u.id));
            
            const changes = [];
            if (added.length) changes.push(`Added: ${added.map(u => u.fullName).join(', ')}`);
            if (removed.length) changes.push(`Removed: ${removed.map(u => u.fullName).join(', ')}`);
            
            newHistoryEntries.push({
                id: `hist-usage-${Date.now()}`,
                assetId: asset.assetId,
                assetName: asset.title,
                date: today,
                type: 'Usage Update',
                notes: `Active users updated. ${changes.join('; ')}`
            });
        }

        if (newHistoryEntries.length > 0) {
            finalAsset.assignmentHistory = [...(finalAsset.assignmentHistory || []), ...newHistoryEntries];
        }
        
        finalAsset = { ...finalAsset, modified: new Date().toISOString(), modifiedBy: 'Admin' };
        setAssets(assets.map(a => a.id === asset.id ? finalAsset : a));
    } else {
      const family = assetFamilies.find(f => f.id === asset.familyId);
      const familyPrefix = family?.assetType === AssetType.LICENSE ? 'SOFT' : 'HARD';
      const productCode = (family as any)?.productCode || 'GEN';
      const sequenceNumber = String(assets.filter(a => a.familyId === asset.familyId).length + 1).padStart(4, '0');
      const assetId = `${familyPrefix}-${productCode}-${sequenceNumber}`;

      const newAsset = { ...asset, id: `inst-${new Date().toISOString()}`, assetId: asset.assetId || assetId, created: new Date().toISOString(), modified: new Date().toISOString(), createdBy: 'Admin', modifiedBy: 'Admin' };
      
      if (newAsset.assignedUser || (newAsset.assignedUsers && newAsset.assignedUsers.length > 0)) {
           newHistoryEntries.push({
                id: `hist-${Date.now()}`,
                assetId: newAsset.assetId,
                assetName: newAsset.title,
                date: new Date().toISOString().split('T')[0],
                type: 'Assigned',
                assignedTo: newAsset.assignedUser?.fullName || 'Multiple Users',
                notes: 'Initial Assignment'
           });
      }
      
      if (newAsset.activeUsers && newAsset.activeUsers.length > 0) {
           newHistoryEntries.push({
                id: `hist-usage-${Date.now()}`,
                assetId: newAsset.assetId,
                assetName: newAsset.title,
                date: new Date().toISOString().split('T')[0],
                type: 'Usage Update',
                notes: `Initial active users: ${newAsset.activeUsers.map(u => u.fullName).join(', ')}`
           });
      }

      newAsset.assignmentHistory = newHistoryEntries;
      setAssets([...assets, newAsset as Asset]);
    }
    closeAssetModal();
  };
  
  // Define handleGlobalSearchSelect to handle search results
  const handleGlobalSearchSelect = (type: 'user' | 'asset' | 'family', item: any) => {
    if (type === 'user') handleUserClick(item);
    else if (type === 'asset') handleEditAsset(item);
    else if (type === 'family') handleFamilyClick(item);
  };

  const handleDataImport = (type: ImportType, data: any[]) => {
      if (type === 'users') {
          const newUsers: User[] = data.map((row, index) => ({
              id: Math.max(...users.map(u => Number(u.id) || 0), 0) + index + 1,
              fullName: row.fullName || 'Unknown',
              email: row.email,
              firstName: row.fullName?.split(' ')[0] || '',
              lastName: row.fullName?.split(' ').slice(1).join(' ') || '',
              avatarUrl: `https://i.pravatar.cc/150?u=${Math.random()}`,
              role: 'user', 
              isVerified: false,
              jobTitle: row.jobTitle || 'Staff',
              department: row.department || 'General',
              organization: 'Company',
              dateOfJoining: new Date().toISOString().split('T')[0],
              dateOfExit: null,
              businessPhone: row.businessPhone || '',
              mobileNo: '',
              address: row.location || '',
              city: '',
              postalCode: '',
              linkedin: '',
              twitter: '',
              userType: 'Internal',
              extension: '',
              permissionGroups: [],
              principalName: row.email,
              userStatus: 'Active',
              userTypeDetail: 'Member',
              createdDate: new Date().toISOString(),
              modifiedDate: new Date().toISOString(),
              createdBy: 'Import',
              modifiedBy: 'Import',
              site: row.location ? [row.location] : [],
              typeOfContact: ['Employee'],
              platformAccounts: []
          }));
          const existingEmails = new Set(users.map(u => u.email.toLowerCase()));
          const filteredNewUsers = newUsers.filter(u => !existingEmails.has(u.email.toLowerCase()));
          setUsers(prev => [...prev, ...filteredNewUsers]);
          alert(`Imported ${filteredNewUsers.length} new users.`);
      } else {
          const isHardware = type === 'hardware';
          const assetType = isHardware ? AssetType.HARDWARE : AssetType.LICENSE;
          let updatedFamilies = [...assetFamilies];
          const newAssets: Asset[] = [];
          data.forEach((row, index) => {
             const familyName = row.familyName || (isHardware ? 'Imported Hardware' : 'Imported Software');
             let family = updatedFamilies.find(f => f.name.toLowerCase() === familyName.toLowerCase() && f.assetType === assetType);
             if (!family) {
                 const newFamilyId = `fam-imp-${Date.now()}-${index}`;
                 const newFamily: any = {
                     id: newFamilyId,
                     assetType,
                     name: familyName,
                     productCode: familyName.substring(0, 3).toUpperCase(),
                     category: isHardware ? 'Accessory' : 'External',
                     vendor: row.manufacturer || 'Unknown',
                     manufacturer: row.manufacturer || 'Unknown',
                     description: 'Imported via Excel',
                     createdDate: new Date().toISOString(),
                     lastModifiedDate: new Date().toISOString(),
                     variants: !isHardware ? [{ id: `var-${Date.now()}`, name: 'Standard', licenseType: 'Subscription', cost: 0 }] : undefined,
                     responsibleUser: currentUser,
                     assignmentModel: isHardware ? 'Single' : 'Multiple'
                 };
                 updatedFamilies.push(newFamily);
                 family = newFamily;
             }
             let assignedUser = null;
             let assignedUsers: User[] = [];
             if (row.assignedUserEmail) {
                 const foundUser = users.find(u => u.email.toLowerCase() === row.assignedUserEmail.toLowerCase());
                 if (foundUser) { assignedUser = foundUser; assignedUsers = [foundUser]; }
             }
             const prefix = isHardware ? 'HARD' : 'SOFT';
             const code = (family as any).productCode || 'IMP';
             const seq = String(assets.length + newAssets.length + 1).padStart(4, '0');
             const assetId = `${prefix}-${code}-${seq}`;
             const newAsset: Asset = {
                 id: `inst-imp-${Date.now()}-${index}`,
                 assetId,
                 familyId: family!.id,
                 title: row.title || `${family!.name} ${seq}`,
                 assetType,
                 status: row.status || AssetStatus.AVAILABLE,
                 purchaseDate: row.purchaseDate || new Date().toISOString().split('T')[0],
                 cost: row.cost || 0,
                 created: new Date().toISOString(),
                 modified: new Date().toISOString(),
                 createdBy: 'Import',
                 modifiedBy: 'Import',
                 serialNumber: row.serialNumber,
                 modelNumber: row.modelNumber,
                 manufacturer: row.manufacturer,
                 location: row.location,
                 assignedUser,
                 licenseKey: row.licenseKey,
                 renewalDate: row.renewalDate,
                 variantType: row.variantType || 'Standard',
                 assignedUsers: assignedUsers.length > 0 ? assignedUsers : undefined,
                 email: row.assignedUserEmail 
             };
             newAssets.push(newAsset);
          });
          setAssetFamilies(updatedFamilies);
          setAssets(prev => [...prev, ...newAssets]);
          alert(`Imported ${newAssets.length} assets.`);
      }
  };

  const closeAssetModal = () => {
    setIsAssetModalOpen(false);
    setEditingAsset(null);
    setEditingFamily(null);
  };
  
  const closeRequestModal = () => {
    setIsRequestModalOpen(false);
    setRequestingUser(null);
    setRequestCategory(null);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setModalMode('instance');
    setIsAssetModalOpen(true);
  };
  
  const handleEditFamily = (family: AssetFamily) => {
    setEditingFamily(family);
    setModalMode('family');
    setIsAssetModalOpen(true);
  }

  const handleAddFamily = () => {
      setEditingFamily(null);
      setModalMode('family');
      setIsAssetModalOpen(true);
  }

  const handleAddInstance = (family: AssetFamily) => {
    setEditingAsset(null);
    setEditingFamily(family); 
    setModalMode('instance');
    setIsAssetModalOpen(true);
  }

  const handleSaveUser = (user: User) => {
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    setUsers(updatedUsers);
    
    setAssets(prevAssets => prevAssets.map(asset => {
        if (asset.assetType === AssetType.LICENSE && asset.assignedUsers?.some(u => u.id === user.id)) {
            return { ...asset, assignedUsers: asset.assignedUsers.map(u => u.id === user.id ? user : u) };
        }
        if (asset.assetType === AssetType.HARDWARE && asset.assignedUser?.id === user.id) {
            return { ...asset, assignedUser: user };
        }
        return asset;
    }));

    if (selectedUser?.id === user.id) setSelectedUser(user);
    if (currentUser?.id === user.id) setCurrentUser(user);
    setIsProfileModalOpen(false);
  };

  const handleSubmitRequest = (familyId: string, notes: string) => {
    const family = assetFamilies.find(f => f.id === familyId);
    const user = requestingUser;

    if (!family || !user) {
        closeRequestModal();
        return;
    }

    const newRequest: Request = {
        id: `req-${new Date().getTime()}`,
        type: family.assetType === AssetType.HARDWARE ? 'Hardware' : 'Software',
        item: family.name,
        requestedBy: user,
        status: RequestStatus.PENDING,
        requestDate: new Date().toLocaleDateString('en-CA'),
        notes: notes,
        familyId: family.id
    };

    setRequests(prev => [newRequest, ...prev]);
    closeRequestModal();
  };
  
  const handleNewRequest = (category: RequestCategory) => {
    setRequestingUser(currentUser); 
    setRequestCategory(category);
    setIsRequestModalOpen(true);
  };

  const handleQuickRequest = (assetId: string) => {};
  
  const handleCreateTask = (request: Request) => {
      setRequestForTask(request);
      setIsTaskModalOpen(true);
  };

  const handleRequestAction = (requestId: string, newStatus: RequestStatus) => {
    if (newStatus === RequestStatus.APPROVED) {
        const req = requests.find(r => r.id === requestId);
        if (req) {
            handleCreateTask(req);
        }
    } else {
        setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
    }
  };

  const handleTaskSubmit = (newTask: Task) => {
      setTasks(prev => [newTask, ...prev]);
      setRequests(prev => prev.map(r => r.id === newTask.requestId ? { ...r, status: RequestStatus.IN_PROGRESS, linkedTaskId: newTask.id } : r));
      setIsTaskModalOpen(false);
      setRequestForTask(null);
  };

  const visibleAssets = useMemo(() => {
      if (isAdmin) return assets;
      return assets.filter(a => 
          (a.assignedUser?.id === currentUser?.id) || 
          (a.assignedUsers?.some(u => u.id === currentUser?.id))
      );
  }, [assets, currentUser, isAdmin]);

  const visibleRequests = useMemo(() => {
      if (isAdmin) return requests;
      return requests.filter(r => r.requestedBy.id === currentUser?.id);
  }, [requests, currentUser, isAdmin]);

  const userColumns: ColumnDef<User>[] = [
    { 
      accessorKey: 'fullName', 
      header: 'Name', 
      width: 250, 
      cell: ({ row }) => ( 
        <button onClick={() => handleUserClick(row.original)} className="flex items-center gap-3 text-left w-full group"> 
          <img src={row.original.avatarUrl} alt={row.original.fullName} className="w-7 h-7 rounded-full object-cover mr-[10px]" /> 
          <span className="font-semibold text-siteblue group-hover:underline truncate">{row.original.fullName}</span> 
        </button> 
      ) 
    },
    { accessorKey: 'email', header: 'Email', width: 250 }, 
    { accessorKey: 'jobTitle', header: 'Job Title', width: 200 }, 
    { accessorKey: 'department', header: 'Department', width: 200 },
    { accessorKey: 'assets', header: 'Assigned Assets', width: 120, cell: ({row}) => {
        const count = assets.filter(a => a.assignedUser?.id === row.original.id || a.assignedUsers?.some(u => u.id === row.original.id)).length;
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-siteblue/10 text-siteblue">{count}</span>
    }},
    { 
      accessorKey: 'userStatus', 
      header: 'Status', 
      width: 100, 
      cell: ({row}) => {
        const isActive = row.original.userStatus.toLowerCase().includes('active');
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isActive ? 'bg-successgreen text-white' : 'bg-disabledgrey text-white'}`}>
            {isActive ? 'active' : 'inactive'}
          </span>
        );
      }
    },
    { accessorKey: 'view', header: '', width: 120, cell: ({ row }) => ( <button onClick={() => handleUserClick(row.original)} className="flex items-center gap-2 text-sm font-medium text-siteblue hover:underline whitespace-nowrap"> View Profile <ArrowRight size={14} className="flex-shrink-0" /> </button> ) }
  ];
  
  const requestColumns: ColumnDef<Request>[] = [
    { accessorKey: 'item', header: 'Item', width: 300, cell: ({ row }) => ( <div> <p className="font-medium text-textblack">{row.original.item}</p> <p className="text-xs text-disabledgrey">{row.original.type}</p> </div> ) },
    { accessorKey: 'requestedBy.fullName', header: 'Requested By', width: 200, cell: ({ row }) => ( <button disabled={!isAdmin} onClick={() => handleUserClick(row.original.requestedBy)} className={`flex items-center gap-2 text-left w-full group ${!isAdmin ? 'cursor-default' : ''}`}> <img src={row.original.requestedBy.avatarUrl} alt={row.original.requestedBy.fullName} className="w-6 h-6 rounded-full" /> <span className={`font-medium text-sm truncate ${isAdmin ? 'text-siteblue group-hover:underline' : 'text-textblack'}`}>{row.original.requestedBy.fullName}</span> </button> ) },
    { accessorKey: 'requestDate', header: 'Request Date', width: 150 },
    { accessorKey: 'status', header: 'Status', width: 180, cell: ({ row }) => { 
        const status = row.original.status; 
        const colorClasses = { [RequestStatus.PENDING]: 'bg-highlightyellow text-textblack', [RequestStatus.APPROVED]: 'bg-successgreen text-white', [RequestStatus.REJECTED]: 'bg-dangerred text-white', [RequestStatus.FULFILLED]: 'bg-siteblue text-white', [RequestStatus.IN_PROGRESS]: 'bg-siteblue/40 text-textblack' };
        const linkedTask = row.original.linkedTaskId ? tasks.find(t => t.id === row.original.linkedTaskId) : null;

        return (
            <div className="flex flex-col items-start gap-1">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses[status]}`}>{status}</span>
                {status === RequestStatus.IN_PROGRESS && linkedTask && (
                    <div className="flex items-center gap-1.5 bg-rowgrey border border-bordergrey px-2 py-0.5 rounded text-[10px] text-disabledgrey mt-1">
                        <ListTodo size={12} className="text-siteblue"/>
                        <span className="font-medium">Task: {linkedTask.assignedTo?.fullName || 'Unassigned'}</span>
                    </div>
                )}
            </div>
        );
    } },
    { accessorKey: 'actions', header: 'Actions', width: 120, cell: ({ row }) => (isAdmin && row.original.status === RequestStatus.PENDING) ? ( <div className="flex items-center gap-2"> <button onClick={() => handleRequestAction(row.original.id, RequestStatus.APPROVED)} className="p-1.5 text-successgreen bg-white border border-successgreen/20 rounded hover:bg-successgreen/10" title="Approve & Create Task"><Check size={16} /></button> <button onClick={() => handleRequestAction(row.original.id, RequestStatus.REJECTED)} className="p-1.5 text-dangerred bg-white border border-dangerred/20 rounded hover:bg-dangerred/10" title="Reject"><X size={16} /></button> </div> ) : null, },
  ];
  
  const assetInstanceColumns: ColumnDef<Asset>[] = [
    { accessorKey: 'assetId', header: 'Asset ID', width: 140, cell: ({row}) => <span className="font-mono text-xs text-disabledgrey">{row.original.assetId}</span> },
    { accessorKey: 'title', header: 'Title', width: 200, cell: ({row}) => <span className="font-medium text-textblack">{row.original.title}</span> },
    { accessorKey: 'familyId', header: 'Product/Family', width: 180, cell: ({row}) => {
        const fam = assetFamilies.find(f => f.id === row.original.familyId);
        return <span className="text-sm text-textblack">{fam?.name || '-'}</span>
    }},
    { accessorKey: 'assignedUser', header: 'Assigned To', width: 200, cell: ({row}) => {
        const users = row.original.assignedUsers && row.original.assignedUsers.length > 0 
            ? row.original.assignedUsers 
            : (row.original.assignedUser ? [row.original.assignedUser] : []);
        
        if (users.length === 0) return <span className="text-disabledgrey text-sm">-</span>;
        
        return (
            <div className="flex flex-col gap-1">
                {users.map(u => (
                    <button key={u.id} disabled={!isAdmin} onClick={(e) => { e.stopPropagation(); handleUserClick(u); }} className={`text-sm text-left truncate ${isAdmin ? 'text-siteblue hover:underline' : 'text-textblack cursor-default'}`}>
                        {u.fullName}
                    </button>
                ))}
            </div>
        );
    }},
    { accessorKey: 'activeUsers', header: 'Active Users', width: 120, cell: ({row}) => {
        const count = row.original.activeUsers?.length || 0;
        return (
            <div className="flex items-center gap-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${count > 0 ? 'bg-siteblue text-white' : 'bg-rowgrey text-disabledgrey'}`}>{count}</span>
            </div>
        );
    }},
    { accessorKey: 'status', header: 'Status', width: 120, cell: ({row}) => (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full bg-opacity-80
            ${row.original.status === AssetStatus.ACTIVE ? 'bg-successgreen text-white' : ''}
            ${row.original.status === AssetStatus.AVAILABLE || row.original.status === AssetStatus.STORAGE ? 'bg-sitebluelight text-siteblue' : ''}
            ${row.original.status === AssetStatus.EXPIRED || row.original.status === AssetStatus.RETIRED ? 'bg-warningorange text-white' : ''}
            ${row.original.status === AssetStatus.IN_REPAIR || row.original.status === AssetStatus.PENDING ? 'bg-highlightyellow text-textblack' : ''}
            ${row.original.status === AssetStatus.INACTIVE ? 'bg-disabledgrey text-white' : ''}
        `}>
            {row.original.status}
        </span>
    )},
    { accessorKey: 'purchaseDate', header: 'Purchase Date', width: 140, cell: ({row}) => <span className="text-sm text-textblack">{formatDisplayDate(row.original.purchaseDate)}</span> },
    { accessorKey: 'cost', header: 'Cost', width: 100, cell: ({row}) => <span className="text-sm text-textblack">{isAdmin ? (row.original.cost ? `$${row.original.cost}` : '-') : '***'}</span> },
    { accessorKey: 'actions', header: '', width: 60, cell: ({ row }) => isAdmin && (
        <div className="text-center">
             <button onClick={() => handleEditAsset(row.original)} className="p-1 text-siteblue hover:opacity-80 rounded-full hover:bg-rowgrey"><CustomEditIcon size={16} /></button>
        </div>
    )},
];

  const dashboardStats = useMemo(() => {
    if (isAdmin) {
        const total = assets.length; 
        const totalUsers = users.length;
        const pendingRequests = requests.filter(r => r.status === RequestStatus.PENDING).length;
        const now = new Date(); 
        const thirtyDaysFromNow = new Date(); 
        thirtyDaysFromNow.setDate(now.getDate() + 30);
        const expiringSoon = assets.filter(asset => { 
            if (asset.renewalDate) { 
                try { const expiry = new Date(asset.renewalDate); return expiry > now && expiry <= thirtyDaysFromNow; } catch (e) { return false; } 
            } 
            return false; 
        }).length;

        // Calculate unique active users (users with assigned assets)
        const activeIds = new Set<string | number>();
        assets.forEach(asset => {
            if (asset.assignedUser) activeIds.add(asset.assignedUser.id);
            if (asset.assignedUsers) {
                asset.assignedUsers.forEach(u => activeIds.add(u.id));
            }
        });
        const activeUsers = activeIds.size;

        return { total, totalUsers, activeUsers, pendingRequests, expiringSoon };
    } else {
        const myAssets = visibleAssets.length;
        const myRequests = visibleRequests.length;
        const myLicenses = visibleAssets.filter(a => a.assetType === AssetType.LICENSE).length;
        const myHardware = visibleAssets.filter(a => a.assetType === AssetType.HARDWARE).length;
        return { myAssets, myRequests, myLicenses, myHardware };
    }
  }, [assets, visibleAssets, visibleRequests, isAdmin, users, requests]);
  
  const assetTypeCounts = useMemo(() => ({ licenses: assetFamilies.filter(a => a.assetType === AssetType.LICENSE).length, hardware: assetFamilies.filter(a => a.assetType === AssetType.HARDWARE).length }), [assetFamilies]);
  
  const departmentStats = useMemo(() => {
      const depts: Record<string, number> = {};
      users.forEach(u => {
          const d = u.department || 'Unassigned';
          depts[d] = (depts[d] || 0) + 1;
      });
      // Sort by count descending to match image's primary list
      return Object.entries(depts).sort((a,b) => b[1] - a[1]).slice(0, 5);
  }, [users]);

  const familiesWithCounts = useMemo(() => {
    return assetFamilies.map(family => {
      const instances = assets.filter(a => a.familyId === family.id);
      const assignedCount = instances.filter(i => (i.assignedUser || (i.assignedUsers && i.assignedUsers.length > 0))).length;
      return { ...family, total: instances.length, assigned: assignedCount, available: instances.length - assignedCount };
    });
  }, [assetFamilies, assets]);

  const assetFamilyColumns: ColumnDef<AssetFamily & { total: number; assigned: number; available: number; }>[] = [
    { accessorKey: 'name', header: 'Name', width: 250, cell: ({ row }) => isAdmin ? <button onClick={() => handleFamilyClick(row.original)} className="font-semibold text-siteblue hover:underline">{row.original.name}</button> : <span className="font-semibold text-textblack">{row.original.name}</span> },
    { accessorKey: 'category', header: 'Category', width: 200 },
    { accessorKey: 'vendor', header: 'Vendor/Manufacturer', width: 200, cell: ({row}) => <span>{(row.original as any).vendor || (row.original as any).manufacturer}</span> },
    { accessorKey: 'total', header: 'Total Units', width: 120, cell: ({row}) => <div className="font-mono text-right pr-2">{row.original.total}</div> },
    { accessorKey: 'assigned', header: 'Assigned', width: 120, cell: ({row}) => <div className="font-mono text-right pr-2">{row.original.assigned}</div> },
    { accessorKey: 'available', header: 'Available', width: 120, cell: ({row}) => <div className="font-mono text-successgreen font-bold text-right pr-2">{row.original.available}</div> },
    { accessorKey: 'actions', header: '', width: 60, cell: ({ row }) => isAdmin && <div className="text-center"><button onClick={() => handleEditFamily(row.original)} className="p-1 text-siteblue hover:opacity-80 rounded-full hover:bg-rowgrey"><CustomEditIcon size={16} /></button></div> },
  ];

  const filteredFamilies = useMemo(() => {
    if (activeView === 'licenses') return familiesWithCounts.filter(f => f.assetType === AssetType.LICENSE);
    if (activeView === 'hardware') return familiesWithCounts.filter(f => f.assetType === AssetType.HARDWARE);
    return [];
  }, [familiesWithCounts, activeView]);
  
  const addButton = useMemo(() => {
    const config = {
      licenses: { text: 'Add License Profile', icon: KeyRound },
      hardware: { text: 'Add Hardware Product', icon: Tv },
      users: { text: 'Add Team Member', icon: UserPlus },
    };
    if ((activeView !== 'licenses' && activeView !== 'hardware' && activeView !== 'users') || !isAdmin) return null;
    const { text, icon: Icon } = (config as any)[activeView];
    
    const handleClick = () => {
        if (activeView === 'users') {
            // Not implemented in mock but logic would go here
            alert("Open Add User form");
        } else {
            setEditingFamily(null); 
            setModalMode('family'); 
            setIsAssetModalOpen(true);
        }
    };
    
    return ( <button onClick={handleClick} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-siteblue rounded shadow-sm hover:opacity-90 transition-opacity"> <Icon size={16} /> {text} </button> );
  }, [activeView, isAdmin]);

  const NavItem = ({ view, label, icon: Icon }: { view: View, label: string, icon: React.ElementType }) => (
    <button 
      onClick={() => handleNavigation(view)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeView === view ? 'border-siteblue text-siteblue' : 'border-transparent text-textblack hover:text-siteblue hover:bg-rowgrey'}`}
    >
      <Icon size={18} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  const renderContent = () => {
    if (selectedUser) {
        const userAssets = assets.filter(asset => 
            (asset.assignedUser?.id === selectedUser.id) || 
            (asset.assignedUsers?.some(u => u.id === selectedUser.id))
        );
        return (
             <div className="max-w-7xl mx-auto">
                <button onClick={handleBackToList} className="mb-4 px-4 py-2 text-sm font-medium text-textblack bg-white border border-bordergrey rounded shadow-sm hover:bg-rowgrey"> &larr; Back to List </button>
                <UserProfile user={selectedUser} userAssets={userAssets} assetFamilies={assetFamilies} onEditProfile={() => setIsProfileModalOpen(true)} onNewRequest={handleNewRequest} onQuickRequest={handleQuickRequest} />
             </div>
        );
    }
    
    if (selectedFamilyId && isAdmin) {
        const family = assetFamilies.find(f => f.id === selectedFamilyId);
        if (!family) return <div>Family not found</div>;
        return (
          <AssetProfile 
                family={family} 
                allAssets={assets} 
                onBack={handleBackToList} 
                onEditAsset={handleEditAsset} 
                onUserClick={handleUserClick} 
                onAddInstance={handleAddInstance} 
                onEditFamily={handleEditFamily}
                onBulkCreate={handleBulkCreate} 
            />
        );
    }

    switch(activeView) {
        case 'dashboard': return (
            <div className="space-y-8 max-w-7xl mx-auto">
              {isAdmin ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"> 
                        <StatCard icon={Users} title="Total Team" value={dashboardStats.totalUsers!} cssVar="--SiteBlue" subtext="Active Members" onClick={() => handleNavigation('users')} />
                        <StatCard icon={UserIcon} title="Active Users" value={dashboardStats.activeUsers!} cssVar="--SuccessGreen" subtext="Currently Active" onClick={() => handleNavigation('users')} />
                        <StatCard icon={Package} title="Assets Managed" value={dashboardStats.total!} cssVar="--SuccessGreen" subtext="Hardware & Licenses" onClick={() => handleNavigation('licenses')} />
                        <StatCard icon={ShieldAlert} title="Pending Actions" value={dashboardStats.pendingRequests!} cssVar="--WarningOrange" subtext="Requests needing approval" onClick={() => handleNavigation('requests')} />
                        <StatCard icon={Clock} title="Attention Needed" value={dashboardStats.expiringSoon!} cssVar="--DangerRed" subtext="Expiring in 30 days" onClick={() => handleNavigation('licenses')} /> 
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-bordergrey rounded shadow-sm hover:bg-rowgrey text-sm font-medium text-textblack whitespace-nowrap">
                            <UserPlus size={16} className="text-siteblue"/> Add Team Member
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-bordergrey rounded shadow-sm hover:bg-rowgrey text-sm font-medium text-textblack whitespace-nowrap" onClick={() => { setEditingFamily(null); setModalMode('family'); setIsAssetModalOpen(true); }}>
                            <PackageOpen size={16} className="text-successgreen"/> Procure New Asset
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            <div className="bg-white rounded shadow-sm border border-bordergrey overflow-hidden">
                                <div className="p-5 border-b border-bordergrey flex justify-between items-center">
                                    <h2 className="text-base font-bold text-siteblue flex items-center gap-2">
                                        <AlertCircle size={18} className="text-warningorange" /> Action Center
                                    </h2>
                                    <span className="text-xs font-medium text-disabledgrey">{requests.filter(r => r.status === 'Pending').length} Pending</span>
                                </div>
                                <div className="divide-y divide-bordergrey">
                                    {requests.filter(r => r.status === 'Pending').slice(0, 5).map(req => (
                                        <div key={req.id} className="p-4 flex items-center justify-between hover:bg-rowgrey transition-colors">
                                            <div className="flex items-center gap-3">
                                                <img src={req.requestedBy.avatarUrl} className="w-10 h-10 rounded-full border border-bordergrey" alt={req.requestedBy.fullName}/>
                                                <div>
                                                    <p className="text-sm font-medium text-textblack">{req.requestedBy.fullName}</p>
                                                    <p className="text-xs text-disabledgrey">Requested: <span className="font-medium text-textblack">{req.item}</span></p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleRequestAction(req.id, RequestStatus.APPROVED)} className="p-1.5 text-successgreen bg-white border border-successgreen/20 rounded hover:bg-successgreen/10" title="Approve & Create Task"><Check size={16}/></button>
                                                <button onClick={() => handleRequestAction(req.id, RequestStatus.REJECTED)} className="p-1.5 text-dangerred bg-white border border-dangerred/20 rounded hover:bg-dangerred/10" title="Reject"><X size={16}/></button>
                                            </div>
                                        </div>
                                    ))}
                                    {requests.filter(r => r.status === 'Pending').length === 0 && (
                                        <div className="p-8 text-center text-disabledgrey text-sm">
                                            <Check size={24} className="mx-auto mb-2 opacity-50"/>
                                            All caught up! No pending actions.
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => handleNavigation('requests')} className="w-full py-3 text-xs font-medium text-siteblue hover:bg-rowgrey border-t border-bordergrey text-center">
                                    View All Requests &rarr;
                                </button>
                            </div>

                            <div className="bg-white rounded shadow-sm border border-bordergrey p-6">
                                <h3 className="font-semibold text-textblack mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-siteblue"/> Asset Utilization</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-textblack">Licenses Assigned</span>
                                            <span className="font-medium text-textblack">{Math.round((assets.filter(a => a.assetType === AssetType.LICENSE && a.assignedUsers?.length).length / assets.filter(a => a.assetType === AssetType.LICENSE).length) * 100 || 0)}%</span>
                                        </div>
                                        <div className="h-2 bg-rowgrey rounded-full overflow-hidden">
                                            <div className="h-full bg-siteblue rounded-full" style={{ width: `${(assets.filter(a => a.assetType === AssetType.LICENSE && a.assignedUsers?.length).length / assets.filter(a => a.assetType === AssetType.LICENSE).length) * 100}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-textblack">Hardware Assigned</span>
                                            <span className="font-medium text-textblack">{Math.round((assets.filter(a => a.assetType === AssetType.HARDWARE && a.assignedUser).length / assets.filter(a => a.assetType === AssetType.HARDWARE).length) * 100 || 0)}%</span>
                                        </div>
                                        <div className="h-2 bg-rowgrey rounded-full overflow-hidden">
                                            <div className="h-full bg-successgreen rounded-full" style={{ width: `${(assets.filter(a => a.assetType === AssetType.HARDWARE && a.assignedUser).length / assets.filter(a => a.assetType === AssetType.HARDWARE).length) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-8 pt-6 border-t border-bordergrey">
                                    <div className="grid grid-cols-2">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-textblack">{assetTypeCounts.licenses}</p>
                                            <p className="text-[10px] font-semibold text-disabledgrey uppercase tracking-wider">License Types</p>
                                        </div>
                                        <div className="text-center border-l border-bordergrey">
                                            <p className="text-2xl font-bold text-textblack">{assetTypeCounts.hardware}</p>
                                            <p className="text-[10px] font-semibold text-disabledgrey uppercase tracking-wider">Hardware Types</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-white rounded shadow-sm border border-bordergrey p-6">
                                <h3 className="font-semibold text-textblack mb-4 flex items-center gap-2"><Briefcase size={18} className="text-siteblue"/> Department Distribution</h3>
                                <div className="space-y-3">
                                    {departmentStats.map(([dept, count]) => (
                                        <div key={dept} className="group">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-medium text-textblack">{dept}</span>
                                                <span className="text-disabledgrey">{count} Members</span>
                                            </div>
                                            <div className="h-1.5 bg-rowgrey rounded-full overflow-hidden group-hover:bg-bordergrey transition-colors">
                                                <div className="h-full bg-siteblue rounded-full" style={{ width: `${(count / users.length) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded shadow-sm border border-bordergrey overflow-hidden">
                                <div className="p-5 border-b border-bordergrey">
                                    <h2 className="text-base font-bold text-siteblue">New Joiners</h2>
                                </div>
                                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {users.slice(0, 4).map(user => {
                                        const joinedDate = formatDisplayDate(user.dateOfJoining);
                                        
                                        return (
                                            <div key={user.id} onClick={() => handleUserClick(user)} className="flex items-center gap-4 p-4 rounded border border-bordergrey hover:border-siteblue hover:bg-siteblue/5 cursor-pointer transition-all bg-white shadow-sm">
                                                <img src={user.avatarUrl} className="w-12 h-12 rounded-full border border-bordergrey object-cover" alt={user.fullName}/>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-bold text-textblack truncate">{user.fullName}</p>
                                                    {user.jobTitle && <p className="text-xs text-disabledgrey truncate">{user.jobTitle}</p>}
                                                    {joinedDate && <p className="text-[11px] font-semibold text-successgreen mt-1">Joined: {joinedDate}</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button onClick={() => handleNavigation('users')} className="w-full py-3 text-xs font-medium text-siteblue hover:bg-rowgrey border-t border-bordergrey text-center flex items-center justify-center gap-1">
                                    View Full Team Directory &rarr;
                                </button>
                            </div>
                        </div>
                    </div>
                  </>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> 
                    <StatCard icon={Package} title="My Total Assets" value={dashboardStats.myAssets!} cssVar="--SiteBlue" onClick={() => { handleNavigation('licenses'); setAssetViewMode('items'); }} /> 
                    <StatCard icon={KeyRound} title="My Licenses" value={dashboardStats.myLicenses!} cssVar="--SuccessGreen" onClick={() => { handleNavigation('licenses'); setAssetViewMode('items'); }} /> 
                    <StatCard icon={Tv} title="My Hardware" value={dashboardStats.myHardware!} cssVar="--WarningOrange" onClick={() => { handleNavigation('hardware'); setAssetViewMode('items'); }} /> 
                    <StatCard icon={ClipboardList} title="My Active Requests" value={dashboardStats.myRequests!} cssVar="--SiteBlue" onClick={() => handleNavigation('requests')} /> 
                    
                    <div className="lg:col-span-4 bg-white p-6 rounded shadow-sm mt-4 border border-bordergrey">
                        <h3 className="text-lg font-semibold text-textblack mb-4">My Quick Actions</h3>
                        <div className="flex gap-4">
                            <button onClick={() => handleNewRequest('Hardware')} className="flex items-center gap-3 p-4 bg-white rounded border border-bordergrey hover:bg-rowgrey hover:border-siteblue transition-all">
                                <div className="p-2 bg-rowgrey rounded-full shadow-sm text-siteblue"><Tv size={20}/></div>
                                <span className="font-medium text-textblack">Request Hardware</span>
                            </button>
                            <button onClick={() => handleNewRequest('Microsoft')} className="flex items-center gap-3 p-4 bg-white rounded border border-bordergrey hover:bg-rowgrey hover:border-siteblue transition-all">
                                <div className="p-2 bg-rowgrey rounded-full shadow-sm text-siteblue"><KeyRound size={20}/></div>
                                <span className="font-medium text-textblack">Request License</span>
                            </button>
                        </div>
                    </div>
                  </div>
              )}
            </div>
        );
        case 'licenses': 
        case 'hardware': 
            const isHardware = activeView === 'hardware';
            const currentType = isHardware ? AssetType.HARDWARE : AssetType.LICENSE;
            const familiesData = filteredFamilies;
            const itemsData = visibleAssets.filter(a => a.assetType === currentType);

            return (
                <div className="max-w-7xl mx-auto space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 rounded shadow-sm border border-bordergrey gap-4">
                        <div className="flex bg-rowgrey p-1 rounded">
                             <button
                                onClick={() => setAssetViewMode('items')}
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors ${assetViewMode === 'items' ? 'bg-white text-siteblue shadow-sm' : 'text-textblack hover:text-siteblue'}`}
                             >
                                <List size={16} /> {isAdmin ? 'Individual Items' : 'My Items'}
                             </button>
                             {isAdmin && (
                                 <button
                                    onClick={() => setAssetViewMode('families')}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors ${assetViewMode === 'families' ? 'bg-white text-siteblue shadow-sm' : 'text-textblack hover:text-siteblue'}`}
                                 >
                                    <Layers size={16} /> Asset Families
                                 </button>
                             )}
                        </div>
                        {addButton}
                    </div>

                    {assetViewMode === 'families' && isAdmin ? (
                        <DataTable 
                            columns={assetFamilyColumns} 
                            data={familiesData} 
                        />
                    ) : (
                        <DataTable 
                            columns={assetInstanceColumns} 
                            data={itemsData} 
                        />
                    )}
                </div>
            );
        case 'users': return isAdmin ? (
            <div className="max-w-7xl mx-auto space-y-4">
                <div className="flex justify-end bg-white p-3 rounded shadow-sm border border-bordergrey">
                    {addButton}
                </div>
                <DataTable columns={userColumns} data={users} />
            </div>
        ) : null;
        case 'requests': return <div className="max-w-7xl mx-auto"><DataTable columns={requestColumns} data={visibleRequests} /></div>;
        case 'admin': return isAdmin ? <div className="max-w-7xl mx-auto">
            <AdminDashboard 
                config={config} 
                onUpdateConfig={setConfig} 
                users={users} 
                assets={assets} 
                families={assetFamilies} 
                vendors={vendors}
                onUpdateVendors={setVendors}
                onImportData={handleDataImport} 
                onNavigateToFamily={handleFamilyClick}
                onEditFamily={handleEditFamily}
                onAddFamily={handleAddFamily}
            />
        </div> : null;
        default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-bggrey flex flex-col">
       <header className="bg-white border-b border-bordergrey sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-8">
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => handleNavigation('dashboard')}>
                        <LayoutDashboard className="h-8 w-8 text-siteblue" />
                    </div>
                    <nav className="hidden md:flex space-x-1">
                        <NavItem view="dashboard" label="Dashboard" icon={LayoutDashboard} />
                        <NavItem view="licenses" label="Licenses" icon={FileSpreadsheet} />
                        <NavItem view="hardware" label="Hardware" icon={Monitor} />
                        {isAdmin && <NavItem view="users" label="Users" icon={UserSquare2} />}
                        <NavItem view="requests" label="Requests" icon={ClipboardList} />
                        {isAdmin && <NavItem view="admin" label="Admin" icon={ShieldAlert} />}
                    </nav>
                </div>
                <div className="flex-grow mx-4">
                    <GlobalSearch users={users} assets={assets} families={assetFamilies} onSelect={handleGlobalSearchSelect} />
                </div>
                <div className="flex items-center gap-4">
                    <UserSwitcher users={users} currentUser={currentUser} onSwitch={setCurrentUser} />
                </div>
            </div>
        </div>
       </header>

       <main className="flex-grow p-4 sm:p-6 lg:p-8">
            {renderContent()} 
       </main>
        
        {isAssetModalOpen && isAdmin && (
            <AssetFormModal 
                isOpen={isAssetModalOpen} 
                onClose={closeAssetModal} 
                onSaveFamily={handleSaveFamily} 
                onSaveAsset={handleSaveAsset} 
                family={editingFamily} 
                asset={editingAsset} 
                mode={modalMode} 
                assetType={ 
                    editingFamily ? editingFamily.assetType : 
                    editingAsset ? editingAsset.assetType :
                    (activeView === 'hardware' ? AssetType.HARDWARE : AssetType.LICENSE) 
                } 
                allUsers={users} 
                allAssets={assets} 
                config={config} 
                vendors={vendors}
            />
        )}
        
         {isProfileModalOpen && selectedUser && <EditProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} onSave={handleSaveUser} user={selectedUser} config={config} />}
         {isRequestModalOpen && requestingUser && <RequestAssetModal isOpen={isRequestModalOpen} onClose={closeRequestModal} onSubmit={handleSubmitRequest} user={requestingUser} assetFamilies={assetFamilies} category={requestCategory} />}
         {isTaskModalOpen && requestForTask && <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} request={requestForTask} adminUsers={adminUsers} onCreateTask={handleTaskSubmit} />}
    </div>
  );
};

export default App;
