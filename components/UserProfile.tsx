
import React, { useState, useMemo } from 'react';
import { User, Asset, AccountStatus, Platform, AssetFamily, AssetType, SoftwareProfile, HardwareProduct } from '../types';
import { CheckCircle, Phone, Mail, MapPin, Building, Voicemail, User as UserIcon, Linkedin, Twitter, Plus, FileText, Briefcase, Trash2, KeyRound, Tv, Clock, History } from 'lucide-react';
import { CustomEditIcon } from '../App';
import { formatDisplayDate } from '../utils';

type RequestCategory = 'Microsoft' | 'External' | 'Hardware';
interface UserProfileProps {
  user: User;
  userAssets: Asset[];
  assetFamilies: AssetFamily[];
  onEditProfile: () => void;
  onNewRequest: (category: RequestCategory) => void;
  onQuickRequest: (assetId: string) => void;
}

const InfoItem: React.FC<{ icon: React.ElementType, label: string, value: string | React.ReactNode, fullWidth?: boolean }> = ({ icon: Icon, label, value, fullWidth = false }) => (
  <div className={`bg-slate-50 rounded-lg p-4 flex items-start gap-4 ${fullWidth ? 'col-span-1 sm:col-span-2' : ''}`}>
    <div className="bg-white rounded-full p-2 shadow-sm">
      <Icon className="h-5 w-5 text-siteblue" />
    </div>
    <div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-sm text-slate-800 font-semibold">{value || '-'}</p>
    </div>
  </div>
);

const PlatformAccountsTab: React.FC<{ user: User }> = ({ user }) => {
    const platformAccounts = user.platformAccounts || [];
    const getPlatformIcon = (platform: Platform) => {
        switch(platform) {
            case Platform.SHAREPOINT: return <Briefcase className="h-5 w-5 text-blue-600" />;
            case Platform.GMAIL: return <Mail className="h-5 w-5 text-red-600" />;
            case Platform.DOGADO: return <Mail className="h-5 w-5 text-orange-500" />;
            default: return <Briefcase className="h-5 w-5 text-slate-500" />;
        }
    }

    return (
        <div className="bg-white rounded-lg">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Briefcase className="h-6 w-6 text-slate-600"/>
                    <h3 className="text-xl font-semibold text-slate-800">Platform Accounts</h3>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-siteblue rounded-md shadow-sm hover:opacity-90"> <Plus size={16} /> Add Account </button>
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50"><tr><th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform</th><th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th><th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th><th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th><th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th><th scope="col" className="relative px-4 py-3"><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {platformAccounts.map(account => (
                            <tr key={account.id}>
                                <td className="px-4 py-3 whitespace-nowrap"><div className="flex items-center gap-3">{getPlatformIcon(account.platform)}<span className="text-sm font-medium text-slate-800">{account.platform}</span></div></td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{account.email}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{account.accountType}</td>
                                <td className="px-4 py-3 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${account.status === AccountStatus.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{account.status}</span></td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{formatDisplayDate(account.createdDate)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium"><div className="flex items-center justify-end gap-2"><button className="p-1 text-slate-500 hover:text-siteblue rounded-full hover:bg-slate-100"><CustomEditIcon size={16} /></button><button className="p-1 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100"><Trash2 size={16} /></button></div></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {platformAccounts.length === 0 && <div className="text-center py-12 text-slate-500"><p>No platform accounts assigned.</p></div>}
            </div>
        </div>
    );
};

const HistoryTab: React.FC<{ user: User }> = ({ user }) => {
    const history = user.history || [];

    return (
        <div className="bg-white rounded-lg">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <History className="h-6 w-6 text-slate-600"/>
                    <h3 className="text-xl font-semibold text-slate-800">Assignment History</h3>
                </div>
            </div>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Action</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Asset Name</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Asset ID</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Notes</th></tr></thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {history.map(item => (
                            <tr key={item.id}>
                                <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{formatDisplayDate(item.date)}</td>
                                <td className="px-4 py-3 whitespace-nowrap"><span className={`px-2 py-0.5 text-xs font-medium rounded-full ${item.type === 'Assigned' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.type}</span></td>
                                <td className="px-4 py-3 text-sm font-medium text-slate-800">{item.assetName}</td>
                                <td className="px-4 py-3 text-sm text-slate-500 font-mono">{item.assetId}</td>
                                <td className="px-4 py-3 text-sm text-slate-500">{item.notes || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {history.length === 0 && <div className="text-center py-12 text-slate-500"><p>No history available.</p></div>}
            </div>
        </div>
    );
};

const AssignedAssetsTab: React.FC<{ assets: Asset[]; families: AssetFamily[]; onNewRequest: (category: RequestCategory) => void;}> = ({ assets, families, onNewRequest }) => {
    const assetsWithFamily = useMemo(() => assets.map(asset => {
        const family = families.find(f => f.id === asset.familyId);
        return {...asset, family };
    }), [assets, families]);
    
    const licenses = useMemo(() => assetsWithFamily.filter(a => a.assetType === AssetType.LICENSE), [assetsWithFamily]);
    const hardware = useMemo(() => assetsWithFamily.filter(a => a.assetType === AssetType.HARDWARE), [assetsWithFamily]);

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-lg">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <KeyRound className="h-6 w-6 text-slate-600"/>
                        <h3 className="text-xl font-semibold text-slate-800">Assigned Licenses</h3>
                    </div>
                    <button onClick={() => onNewRequest('External')} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-siteblue rounded-md shadow-sm hover:opacity-90"> <Plus size={16} /> Request License </button>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Software Name</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Variant</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Asset-ID</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Email/Username</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Renewal Date</th></tr></thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {licenses.map(asset => (
                                <tr key={asset.id}>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{asset.family?.name || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{asset.variantType}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600 font-mono">{asset.assetId}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{asset.email || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{formatDisplayDate(asset.renewalDate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {licenses.length === 0 && <div className="text-center py-12 text-slate-500"><p>No licenses assigned.</p></div>}
                </div>
            </div>
            
             <div className="bg-white rounded-lg">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Tv className="h-6 w-6 text-slate-600"/>
                        <h3 className="text-xl font-semibold text-slate-800">Assigned Hardware</h3>
                    </div>
                    <button onClick={() => onNewRequest('Hardware')} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-siteblue rounded-md shadow-sm hover:opacity-90"> <Plus size={16} /> Request Hardware </button>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Hardware Name</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Asset-ID</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Serial Number</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Warranty Status</th></tr></thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {hardware.map(asset => (
                                <tr key={asset.id}>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{asset.family?.name || '-'}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600 font-mono">{asset.assetId}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{asset.serialNumber}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{formatDisplayDate(asset.warrantyExpiryDate)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {hardware.length === 0 && <div className="text-center py-12 text-slate-500"><p>No hardware assigned.</p></div>}
                </div>
            </div>
        </div>
    );
};

const UserProfile: React.FC<UserProfileProps> = ({ user, userAssets, assetFamilies, onEditProfile, onNewRequest, onQuickRequest }) => {
  const [activeTab, setActiveTab] = useState('general');

  // Guard against null/undefined user
  if (!user) return <div className="p-8 text-center text-slate-500">User profile not found.</div>;

  const renderGeneralInfo = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <section><h3 className="text-lg font-semibold text-slate-800 mb-4">Contact Information</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><InfoItem icon={Phone} label="Business Phone" value={user.businessPhone} /><InfoItem icon={Phone} label="Mobile No" value={user.mobileNo} /><InfoItem icon={Mail} label="Official Email" value={<a href={`mailto:${user.email}`} className="text-siteblue hover:underline">{user.email}</a>} fullWidth />{user.nonPersonalEmail && <InfoItem icon={Mail} label="Non-Personal Email" value={<a href={`mailto:${user.nonPersonalEmail}`} className="text-siteblue hover:underline">{user.nonPersonalEmail}</a>} fullWidth />}</div></section>
        <section><h3 className="text-lg font-semibold text-slate-800 mb-4">Address Information</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><InfoItem icon={MapPin} label="Address" value={user.address} fullWidth /><InfoItem icon={Building} label="City" value={user.city} /><InfoItem icon={Mail} label="Postal Code" value={user.postalCode} /></div></section>
        {user.notes && <section><h3 className="text-lg font-semibold text-slate-800 mb-4">Notes</h3><div className="bg-slate-50 rounded-lg p-4 flex items-start gap-4"><div className="bg-white rounded-full p-2 shadow-sm"><FileText className="h-5 w-5 text-siteblue" /></div><p className="text-sm text-slate-700 whitespace-pre-wrap">{user.notes}</p></div></section>}
      </div>
      <div className="lg:col-span-1 space-y-8">
        <section className="bg-slate-100 rounded-xl p-6"><h3 className="text-base font-bold text-slate-800 mb-4">Social Media</h3><div className="space-y-4">{user.linkedin ? <a href={`https://linkedin.com/in/${user.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-siteblue hover:underline"><Linkedin className="h-5 w-5" /><span>{user.linkedin}</span></a> : <span className="text-sm text-slate-400">No LinkedIn</span>}{user.twitter ? <a href={`https://twitter.com/${user.twitter.startsWith('@') ? user.twitter.substring(1) : user.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-siteblue hover:underline"><Twitter className="h-5 w-5" /><span>{user.twitter}</span></a> : <span className="text-sm text-slate-400">No Twitter</span>}</div></section>
        <section className="bg-slate-100 rounded-xl p-6"><h3 className="text-base font-bold text-slate-800 mb-4">Additional Information</h3><div className="space-y-4"><div className="flex items-start gap-3"><UserIcon className="h-5 w-5 text-slate-500 mt-0.5" /><div><p className="text-xs text-slate-500">User Type</p><p className="text-sm font-semibold text-slate-800">{user.userType || '-'}</p></div></div><div className="flex items-start gap-3"><Voicemail className="h-5 w-5 text-slate-500 mt-0.5" /><div><p className="text-xs text-slate-500">Extension</p><p className="text-sm font-semibold text-slate-800">{user.extension || '-'}</p></div></div><div className="flex items-start gap-3"><Clock className="h-5 w-5 text-slate-500 mt-0.5" /><div><p className="text-xs text-slate-500">Total Assets</p><p className="text-sm font-semibold text-slate-800">{userAssets.length}</p></div></div></div></section>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralInfo();
      case 'accounts': return <PlatformAccountsTab user={user} />;
      case 'assets': return <AssignedAssetsTab assets={userAssets} families={assetFamilies} onNewRequest={onNewRequest} />;
      case 'history': return <HistoryTab user={user} />;
      default: return renderGeneralInfo();
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <header className="bg-slate-50 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative flex-shrink-0">
                 <img src={user.avatarUrl || 'https://i.pravatar.cc/150'} alt={user.fullName} className="w-24 h-24 rounded-full border-4 border-white ring-2 ring-slate-200 object-cover"/>
                 {user.isVerified && <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 border-2 border-slate-50"><CheckCircle className="h-4 w-4 text-white" /></div>}
            </div>
          <div className="flex-grow text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">{user.fullName || 'Unknown User'}</h2>
            <p className="text-md text-slate-500 mt-1">{user.jobTitle || 'No Title'}</p>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm text-slate-600"><div><span className="font-semibold">Staff ID:</span> -</div><div><span className="font-semibold">Department:</span> {user.department || '-'}</div><div><span className="font-semibold">Organization:</span> {user.organization || '-'}</div><div><span className="font-semibold">Date of Joining:</span> {formatDisplayDate(user.dateOfJoining)}</div><div><span className="font-semibold">Date of Exit:</span>{user.dateOfExit ? formatDisplayDate(user.dateOfExit) : <span className="ml-1">-</span>}</div></div>
          </div>
          <button onClick={onEditProfile} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-siteblue rounded-md shadow-sm hover:opacity-90"><CustomEditIcon size={16} />Edit Profile</button>
        </div>
      </header>
      <div className="p-6 sm:p-8 border-t border-slate-200">
        <div className="border-b border-slate-200 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {[
              { id: 'general', label: 'General Info' },
              { id: 'accounts', label: 'Platform Accounts' },
              { id: 'assets', label: 'Assigned Assets' },
              { id: 'history', label: 'History' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-siteblue text-siteblue'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="pt-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
