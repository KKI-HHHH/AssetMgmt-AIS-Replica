
import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Plus, Trash2, Search, User as UserIcon, Check, DollarSign, ShieldCheck, Clock, Edit2, RefreshCw, Globe, ChevronRight, KeyRound, Layers, Monitor, FileText, Lock, Unlock, History, MessageSquare } from 'lucide-react';
import { Asset, User, AssetType, AssetStatus, LicenseType, AssetFamily, SoftwareProfile, LicenseVariant, HardwareProduct, ComplianceStatus, HardwareCondition, Config, TabDefinition, Vendor, AssignmentHistory } from '../types';
import { formatDetailedDate } from '../utils';

type ModalMode = 'family' | 'instance';

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveFamily: (family: AssetFamily) => void;
  onSaveAsset: (asset: Asset) => void;
  family: AssetFamily | null;
  asset: Asset | null;
  mode: ModalMode;
  assetType: AssetType;
  allUsers: User[];
  allAssets: Asset[];
  config: Config;
  vendors?: Vendor[];
}

const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch (e) { return ''; }
};

const FormRadioGroup: React.FC<{ label: string; name: string; value?: string; options: { value: string; label: string }[]; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; }> = ({ label, name, value, options, onChange, required=false }) => (
  <div>
    <label className="block text-sm font-medium text-textblack mb-2">{label}{required && <span className="text-warningorange">*</span>}</label>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <label key={option.value} className="relative">
          <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={onChange} required={required} className="sr-only peer" />
          <span className={`block px-4 py-2 text-sm border rounded cursor-pointer transition-colors ${value === option.value ? 'bg-siteblue text-white border-siteblue' : 'bg-white border-bordergrey text-textblack hover:bg-rowgrey'}`}>{option.label}</span>
        </label>
      ))}
    </div>
  </div>
);

const FormInput: React.FC<{ label: string; name: string; value?: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean; placeholder?: string, step?: string, readOnly?: boolean }> = ({ label, name, value, onChange, type = 'text', required = false, placeholder, step, readOnly=false }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-textblack mb-1">{label} {required && <span className="text-warningorange">*</span>}</label>
      <div className="relative">
          {type === 'number' && name === 'cost' && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-disabledgrey"><DollarSign size={14}/></div>}
          <input 
            type={type} 
            name={name} 
            id={name} 
            value={value || ''} 
            onChange={onChange} 
            required={required} 
            placeholder={placeholder} 
            step={step} 
            readOnly={readOnly} 
            className={`block w-full rounded border-bordergrey shadow-sm focus:border-siteblue focus:ring-siteblue sm:text-sm min-h-[30px] py-1.5 px-3 ${readOnly ? 'bg-rowgrey cursor-not-allowed' : ''} ${type === 'number' && name === 'cost' ? 'pl-8' : ''}`} 
          />
      </div>
    </div>
);

const FormSelect: React.FC<{ label: string; name: string; value?: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; required?: boolean; children: React.ReactNode; }> = ({ label, name, value, onChange, required = false, children }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-textblack mb-1">{label} {required && <span className="text-warningorange">*</span>}</label>
      <select 
        name={name} 
        id={name} 
        value={value || ''} 
        onChange={onChange} 
        required={required} 
        className="block w-full rounded border-bordergrey shadow-sm focus:border-siteblue focus:ring-siteblue sm:text-sm min-h-[30px] py-1.5 px-3"
      >
        {children}
      </select>
    </div>
);

const FormDateInput: React.FC<{ label: string; name: string; value?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean; children?: React.ReactNode }> = ({ label, name, value, onChange, required = false, children }) => (
    <div className="relative">
      <label htmlFor={name} className="block text-sm font-medium text-textblack mb-1">{label} {required && <span className="text-warningorange">*</span>}</label>
      <div className="relative flex items-center gap-2">
        <div className="relative flex-grow">
            <input 
              type="date" 
              name={name} 
              id={name} 
              value={value || ''} 
              onChange={onChange} 
              required={required} 
              className="block w-full rounded border-bordergrey shadow-sm focus:border-siteblue focus:ring-siteblue sm:text-sm min-h-[30px] py-1.5 px-3 pr-10" 
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-disabledgrey pointer-events-none" />
        </div>
        {children}
      </div>
    </div>
);

const UserPicker: React.FC<{ users: User[]; selectedUserIds: (number | string)[]; onChange: (userIds: (number | string)[]) => void; multiple?: boolean; label?: string; }> = ({ users, selectedUserIds, onChange, multiple = false, label }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const filteredUsers = useMemo(() => users.filter(u => u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())), [users, searchTerm]);
    const handleSelect = (userId: number | string) => {
        if (multiple) {
            onChange(selectedUserIds.includes(userId) ? selectedUserIds.filter(id => id !== userId) : [...selectedUserIds, userId]);
        } else {
            onChange(selectedUserIds.includes(userId) ? [] : [userId]);
            setIsOpen(false);
        }
    };
    const selectedUsers = users.filter(u => selectedUserIds.includes(u.id));

    return (
        <div>
            {label && <label className="block text-sm font-medium text-textblack mb-1">{label}</label>}
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedUsers.map(u => (
                    <div key={u.id} className="flex items-center gap-1 bg-siteblue/10 text-siteblue px-2 py-1 rounded-full text-sm border border-siteblue/20">
                        <img src={u.avatarUrl} className="w-4 h-4 rounded-full"/> <span>{u.fullName}</span>
                        <button type="button" onClick={() => handleSelect(u.id)} className="hover:opacity-70"><X size={14}/></button>
                    </div>
                ))}
                <button type="button" onClick={() => setIsOpen(!isOpen)} className="text-sm text-siteblue hover:underline font-medium px-2 py-1 rounded hover:bg-rowgrey flex items-center gap-1">
                    <Plus size={14}/> {selectedUsers.length > 0 ? 'Add More' : 'Select User'}
                </button>
            </div>
            {isOpen && (
                <div className="border border-bordergrey rounded overflow-hidden bg-white shadow-lg relative z-10 w-full max-w-sm">
                    <div className="p-2 border-b border-bordergrey bg-rowgrey relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-disabledgrey" />
                        <input type="text" autoFocus value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search users..." className="w-full pl-8 pr-2 py-1.5 text-sm border border-bordergrey rounded focus:border-siteblue outline-none" />
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-bordergrey">
                        {filteredUsers.map(user => {
                            const isSelected = selectedUserIds.includes(user.id);
                            return (
                                <div key={user.id} onClick={() => handleSelect(user.id)} className={`flex items-center p-2 cursor-pointer hover:bg-rowgrey ${isSelected ? 'bg-siteblue/5' : ''}`}>
                                    <img src={user.avatarUrl} alt={user.fullName} className="w-8 h-8 rounded-full mr-3" />
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${isSelected ? 'text-siteblue' : 'text-textblack'}`}>{user.fullName}</p>
                                    </div>
                                    {isSelected && <Check size={14} className="text-siteblue"/>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const AssetFormModal: React.FC<AssetFormModalProps> = ({ isOpen, onClose, onSaveFamily, onSaveAsset, family, asset, mode, assetType, allUsers, allAssets, config, vendors = [] }) => {
  const [formData, setFormData] = useState<Partial<Asset & AssetFamily>>({});
  const [activeTab, setActiveTab] = useState(''); 
  const [currentTabs, setCurrentTabs] = useState<TabDefinition[]>([]);
  const [showAssignmentPopup, setShowAssignmentPopup] = useState(false);
  const [isAssetIdLocked, setIsAssetIdLocked] = useState(true);

  useEffect(() => {
    if (isOpen) {
        let contextKey: any = mode === 'family' ? (assetType === AssetType.LICENSE ? 'licenseFamily' : 'hardwareFamily') : (assetType === AssetType.LICENSE ? 'licenseInstance' : 'hardwareInstance');
        const layout = config.modalLayouts?.[contextKey] || { tabs: [] };
        setCurrentTabs(layout.tabs);
        if (layout.tabs.length > 0) setActiveTab(layout.tabs[0].id);
        if (mode === 'family') {
            setFormData(family ? { ...family } : { assetType, assignmentModel: assetType === AssetType.LICENSE ? 'Multiple' : 'Single' });
        } else {
            if (asset) setFormData({ ...asset, purchaseDate: formatDateForInput(asset.purchaseDate), renewalDate: formatDateForInput(asset.renewalDate), warrantyExpiryDate: formatDateForInput(asset.warrantyExpiryDate) });
            else if (family) {
                const familyPrefix = family.assetType === AssetType.LICENSE ? 'SOFT' : 'HARD';
                const productCode = (family as any).productCode || 'GEN';
                const sequenceNumber = String(allAssets.filter(a => a.familyId === family.id).length + 1).padStart(4, '0');
                setFormData({ familyId: family.id, assetType: family.assetType, status: AssetStatus.AVAILABLE, purchaseDate: new Date().toISOString().split('T')[0], assetId: `${familyPrefix}-${productCode}-${sequenceNumber}`, title: `${family.name} ${sequenceNumber.replace(/^0+/, '')}` });
            }
        }
    }
  }, [family, asset, mode, assetType, isOpen, allAssets, config.modalLayouts]);

  const handleChange = (e: any) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handleUserSelectionChange = (userIds: any[]) => {
      const selectedUsers = allUsers.filter(u => userIds.includes(u.id));
      const model = family?.assignmentModel || (assetType === AssetType.LICENSE ? 'Multiple' : 'Single');
      setFormData(prev => model === 'Multiple' ? ({ ...prev, assignedUsers: selectedUsers }) : ({ ...prev, assignedUser: selectedUsers[0] || null }));
      if (showAssignmentPopup && model === 'Single') setShowAssignmentPopup(false);
  };

  const renderField = (fieldKey: string) => {
      switch(fieldKey) {
          case 'name': return <FormInput label="Name" name="name" value={(formData as any).name} onChange={handleChange} required />;
          case 'productCode': return <FormInput label="Product Code" name="productCode" value={(formData as any).productCode} onChange={handleChange} required />;
          case 'vendor': 
          case 'manufacturer': return <FormSelect label={fieldKey === 'vendor' ? 'Vendor' : 'Manufacturer'} name={fieldKey} value={(formData as any)[fieldKey]} onChange={handleChange}><option value="">Select...</option>{vendors.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}</FormSelect>;
          case 'status': return <FormSelect label="Status" name="status" value={formData.status} onChange={handleChange} required>{Object.values(AssetStatus).map(s => <option key={s} value={s}>{s}</option>)}</FormSelect>;
          case 'purchaseDate': return <FormDateInput label="Purchase Date" name="purchaseDate" value={formatDateForInput(formData.purchaseDate)} onChange={handleChange} />;
          case 'assetId': return (
              <div>
                  <label className="block text-sm font-medium text-textblack mb-1">Asset ID</label>
                  <div className="flex gap-2">
                      <input 
                        type="text" 
                        name="assetId" 
                        value={formData.assetId} 
                        onChange={handleChange} 
                        readOnly={isAssetIdLocked} 
                        className={`block w-full rounded border-bordergrey shadow-sm sm:text-sm min-h-[30px] py-1.5 px-3 ${isAssetIdLocked ? 'bg-rowgrey text-disabledgrey' : 'focus:ring-siteblue focus:border-siteblue'}`} 
                      />
                      <button type="button" onClick={() => setIsAssetIdLocked(!isAssetIdLocked)} className={`p-2 rounded border min-h-[30px] flex items-center justify-center ${isAssetIdLocked ? 'bg-white border-bordergrey text-disabledgrey hover:bg-rowgrey' : 'bg-warningorange/10 border-warningorange text-warningorange'}`}>{isAssetIdLocked ? <Lock size={16}/> : <Unlock size={16}/>}</button>
                  </div>
              </div>
          );
          case 'assignedUser': 
          case 'assignedUsers': return <UserPicker users={allUsers} selectedUserIds={(assetType === AssetType.LICENSE ? formData.assignedUsers?.map(u => u.id) : [formData.assignedUser?.id]).filter(Boolean) as any} onChange={handleUserSelectionChange} multiple={assetType === AssetType.LICENSE} label="Assignment" />;
          default: return null;
      }
  };

  const createdDate = formatDetailedDate(formData.created || (formData as any).createdDate);
  const modifiedDate = formatDetailedDate(formData.modified || (formData as any).modifiedDate);
  const createdBy = formData.createdBy || 'System';
  const modifiedBy = formData.modifiedBy || 'System';

  return (
    <div className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-colors ${isOpen ? 'bg-black/40 backdrop-blur-sm' : 'pointer-events-none'}`} onClick={onClose}>
      <div className={`bg-bggrey w-full max-w-4xl rounded shadow-2xl flex flex-col h-[80vh] overflow-hidden`} onClick={e => e.stopPropagation()}>
        <form onSubmit={(e) => { e.preventDefault(); if(mode === 'family') onSaveFamily(formData as any); else onSaveAsset(formData as any); }} className="flex flex-col h-full">
            <header className="p-6 border-b border-bordergrey bg-white flex justify-between items-start">
                <div><h2 className="text-2xl font-bold text-siteblue">{mode === 'family' ? 'Asset Family' : 'Asset Instance'}</h2><p className="text-sm font-mono text-disabledgrey uppercase">{formData.assetId || 'New Entry'}</p></div>
                <button type="button" onClick={onClose} className="p-1 rounded-full text-disabledgrey hover:text-textblack hover:bg-rowgrey"><X size={24} /></button>
            </header>
            <div className="border-b border-bordergrey px-8 bg-white flex gap-6 overflow-x-auto">
                {currentTabs.map(tab => (
                    <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id ? 'border-siteblue text-siteblue' : 'border-transparent text-disabledgrey hover:text-textblack'}`}>{tab.label}</button>
                ))}
            </div>
            <main className="p-8 overflow-y-auto flex-grow bg-white">
                <div className="space-y-6">
                    {currentTabs.find(t => t.id === activeTab)?.sections.map(section => (
                        <section key={section.id} className="bg-bggrey/50 p-6 rounded border border-bordergrey">
                            <h3 className="text-lg font-semibold text-textblack mb-4 border-b border-bordergrey pb-2">{section.title}</h3>
                            <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${section.columns || 1}, minmax(0, 1fr))` }}>
                                {section.fields.map(fieldKey => <React.Fragment key={fieldKey}>{renderField(fieldKey)}</React.Fragment>)}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
            <footer className="p-4 bg-[rgb(248,249,250)] border-t border-bordergrey flex justify-between items-start flex-shrink-0">
                <div className="text-xs text-slate-500 leading-relaxed">
                    <div>Created {createdDate} By {createdBy}</div>
                    <div>Last modified {modifiedDate} By {modifiedBy}</div>
                    <button type="button" className="text-siteblue flex items-center gap-1.5 hover:underline mt-2">
                        <Trash2 size={14} /> Delete this item
                    </button>
                </div>
                <div className="flex items-center gap-4 h-full py-1">
                    <button type="button" className="text-siteblue text-xs hover:underline font-medium">Open out-of-the-box form</button>
                    <div className="flex gap-3">
                        <button type="submit" className="px-6 py-2 bg-siteblue text-white rounded border border-siteblue text-sm font-semibold hover:opacity-90 shadow-sm">Save</button>
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded text-sm font-semibold hover:bg-slate-50 shadow-sm">Cancel</button>
                    </div>
                </div>
            </footer>
        </form>
      </div>
    </div>
  );
};

export default AssetFormModal;
