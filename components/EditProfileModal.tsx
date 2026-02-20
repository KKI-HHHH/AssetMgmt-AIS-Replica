
import React, { useState, useEffect, useCallback } from 'react';
import { X, Trash2 } from 'lucide-react';
import { User, Config } from '../types';
import ImageUploadTab from './ImageUploadTab';
import { formatDetailedDate } from '../utils';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  user: User | null;
  config: Config;
}

const FormInput: React.FC<{ label: string; name: string; value?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }> = ({ label, name, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
        <input 
          type="text" 
          id={name} 
          name={name} 
          value={value || ''} 
          onChange={onChange} 
          placeholder={placeholder}
          className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-siteblue focus:border-siteblue sm:text-sm" />
    </div>
);

const FormSelect: React.FC<{ label: string; name: string; value?: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode }> = ({ label, name, value, onChange, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
        <select 
          id={name} 
          name={name} 
          value={value || ''} 
          onChange={onChange} 
          className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-siteblue focus:border-siteblue sm:text-sm"
        >
            {children}
        </select>
    </div>
);

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSave, user, config }) => {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [activeTab, setActiveTab] = useState('');
  
  const layout = config.modalLayouts?.userProfile || { tabs: [] };

  useEffect(() => {
    if (user && isOpen) {
      setFormData(user);
      if (layout.tabs && layout.tabs.length > 0) {
          setActiveTab(layout.tabs[0].id);
      }
    }
  }, [user, isOpen, layout]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSiteChange = (site: string) => {
    const currentSites = formData.site || [];
    const newSites = currentSites.includes(site)
        ? currentSites.filter(s => s !== site)
        : [...currentSites, site];
    setFormData(prev => ({ ...prev, site: newSites }));
  };
  
  const handleAvatarChange = useCallback((newAvatarUrl: string | undefined) => {
    setFormData(prev => ({...prev, avatarUrl: newAvatarUrl}));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const finalData = {
        ...user,
        ...formData,
        fullName: `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
        modifiedDate: new Date().toISOString(),
        modifiedBy: 'Admin',
    } as User;
    onSave(finalData);
  };

  const renderField = (fieldKey: string) => {
      switch(fieldKey) {
          case 'firstName': return <FormInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />;
          case 'lastName': return <FormInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />;
          case 'suffix': return <FormInput label="Suffix" name="suffix" value={formData.suffix} onChange={handleChange} />;
          case 'jobTitle': return <FormInput label="Job Title" name="jobTitle" value={formData.jobTitle} onChange={handleChange} />;
          case 'department': return <FormSelect label="Department" name="department" value={formData.department} onChange={handleChange}><option value="">Select Department</option>{config.departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}</FormSelect>;
          
          case 'site': return (
              <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-slate-700">Site</label>
                  <div className="flex flex-wrap items-center gap-6 mt-2">
                      {config.sites.map(site => (
                          <label key={site} className="flex items-center space-x-2 text-sm font-medium">
                              <input type="checkbox" checked={formData.site?.includes(site)} onChange={() => handleSiteChange(site)} className="accent-siteblue h-4 w-4 rounded border-gray-300"/>
                              <span>{site}</span>
                          </label>
                      ))}
                  </div>
              </div>
          );
          
          case 'typeOfContact': return (
              <div>
                  <label className="block text-sm font-medium text-slate-700">Type Of Contact</label>
                  <div className="mt-1 w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 bg-slate-50 min-h-[40px]">
                      {formData.typeOfContact?.map(t => (
                          <span key={t} className="inline-block bg-siteblue/10 text-siteblue text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{t}</span>
                      ))}
                  </div>
              </div>
          );

          case 'linkedin': return <FormInput label="LinkedIn" name="linkedin" value={formData.linkedin} onChange={handleChange} />;
          case 'twitter': return <FormInput label="Twitter" name="twitter" value={formData.twitter} onChange={handleChange} />;
          case 'facebook': return <FormInput label="Facebook" name="facebook" value={formData.facebook} onChange={handleChange} />;
          case 'instagram': return <FormInput label="Instagram" name="instagram" value={formData.instagram} onChange={handleChange} />;
          
          case 'businessPhone': return <FormInput label="Business Phone" name="businessPhone" value={formData.businessPhone} onChange={handleChange} />;
          case 'mobileNo': return <FormInput label="Mobile No." name="mobileNo" value={formData.mobileNo} onChange={handleChange} />;
          case 'email': return <FormInput label="Email" name="email" value={formData.email} onChange={handleChange} />;
          case 'nonPersonalEmail': return <FormInput label="Non-Personal Email" name="nonPersonalEmail" value={formData.nonPersonalEmail} onChange={handleChange} />;
          case 'homePhone': return <FormInput label="Home Phone" name="homePhone" value={formData.homePhone} onChange={handleChange} />;
          case 'skype': return <FormInput label="Skype" name="skype" value={formData.skype} onChange={handleChange} />;
          case 'address': return <div className="md:col-span-2"><FormInput label="Address" name="address" value={formData.address} onChange={handleChange} /></div>;
          case 'city': return <FormInput label="City" name="city" value={formData.city} onChange={handleChange} />;
          
          case 'notes': return <div className="md:col-span-full"><label className="block text-sm font-medium text-slate-700">Comments</label><textarea id="notes" name="notes" value={formData.notes || ''} onChange={handleChange} rows={4} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-siteblue focus:border-siteblue sm:text-sm" /></div>;
          
          case 'avatarUpload': return (
              <ImageUploadTab 
                  currentAvatar={formData.avatarUrl}
                  onAvatarChange={handleAvatarChange}
                  contactName={formData.fullName || ''}
              />
          );

          default: return null;
      }
  }

  return (
    <div className={`fixed inset-0 z-50 flex justify-center items-center p-4 transition-colors duration-300 ${isOpen ? 'bg-black/50' : 'bg-transparent pointer-events-none'}`} onClick={onClose}>
      <div 
        className={`bg-slate-100 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
        onClick={e => e.stopPropagation()}
      >
        {user && (
          <>
            <header className="p-6 border-b border-slate-200 bg-white flex justify-between items-center flex-shrink-0 rounded-t-lg">
              <h2 className="text-xl font-bold text-siteblue">Edit Contact - {user.fullName}</h2>
              <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-800"><X size={24} /></button>
            </header>

            <div className="px-6 border-b bg-white flex-shrink-0">
              <div className="flex space-x-6 overflow-x-auto">
                {layout.tabs?.map(tab => (
                    <button 
                        key={tab.id}
                        type="button" 
                        onClick={() => setActiveTab(tab.id)} 
                        className={`py-3 px-1 text-sm font-medium whitespace-nowrap ${activeTab === tab.id ? 'text-siteblue border-b-2 border-siteblue' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {tab.label.toUpperCase()}
                    </button>
                ))}
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
              <main className="flex-grow overflow-y-auto p-8 space-y-6">
                {layout.tabs?.map(tab => {
                    if (tab.id !== activeTab) return null;
                    return (
                        <div key={tab.id} className="space-y-6">
                            {tab.sections?.map(section => (
                                <Section key={section.id} title={section.title}>
                                    <div className={`grid gap-6`} style={{ gridTemplateColumns: `repeat(${section.columns || 1}, minmax(0, 1fr))` }}>
                                        {section.fields?.map(fieldKey => (
                                            <React.Fragment key={fieldKey}>
                                                {renderField(fieldKey)}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </Section>
                            ))}
                        </div>
                    );
                })}
              </main>
              <footer className="p-4 bg-[rgb(248,249,250)] border-t border-slate-200 flex-shrink-0 rounded-b-lg">
                <div className="flex justify-between items-start">
                  <div className="text-xs text-slate-500 leading-relaxed">
                    <div>Created {formatDetailedDate(user.createdDate)} By {user.createdBy}</div>
                    <div>Last modified {formatDetailedDate(user.modifiedDate)} By {user.modifiedBy}</div>
                    <button type="button" className="text-siteblue flex items-center gap-1.5 hover:underline mt-2">
                        <Trash2 size={14} /> Delete this item
                    </button>
                  </div>
                  <div className="flex items-center gap-4 py-1">
                    <button type="button" className="text-siteblue text-xs hover:underline font-medium">Open out-of-the-box form</button>
                    <div className="flex items-center space-x-3">
                      <button type="submit" className="px-6 py-2 bg-siteblue text-white rounded border border-siteblue text-sm font-semibold hover:opacity-90 shadow-sm">Save</button>
                      <button type="button" onClick={onClose} className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded text-sm font-semibold hover:bg-slate-50 shadow-sm">Cancel</button>
                    </div>
                  </div>
                </div>
              </footer>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 border rounded-lg shadow-sm">
        <h3 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-3 mb-6">{title}</h3>
        {children}
    </div>
);

export default EditProfileModal;
