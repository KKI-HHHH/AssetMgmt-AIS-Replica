
import React, { useState } from 'react';
import { Plus, Database, List, Hash, Upload, Download, Eye, Save, ExternalLink, Sliders, RefreshCw, Trash2, Building, Wrench, BarChart3 } from 'lucide-react';
import { Asset, User, AssetFamily, Config, AssetType, IdSection, IdSectionType, SoftwareProfile, HardwareProduct, Vendor } from '../types';
import DataImportModal, { ImportType } from './DataImportModal';
import DataTable from './DataTable';
import ModalSettingsEditor from './ModalSettingsEditor';
import { CustomEditIcon } from '../App';

interface AdminDashboardProps {
  config: Config;
  onUpdateConfig: (newConfig: Config) => void;
  users: User[];
  assets: Asset[];
  families: AssetFamily[];
  vendors: Vendor[];
  onUpdateVendors: (vendors: Vendor[]) => void;
  onImportData?: (type: ImportType, data: any[]) => void;
  onNavigateToFamily?: (family: AssetFamily) => void;
  onEditFamily?: (family: AssetFamily) => void;
  onAddFamily?: () => void;
}

const DEFAULT_ID_CONFIG: IdSection[] = [
    { id: 'def-1', type: 'attribute', value: 'prefix', label: 'Prefix', length: 4, uppercase: true },
    { id: 'def-3', type: 'attribute', value: 'productCode', label: 'Product Code', length: 4, uppercase: true },
    { id: 'def-5', type: 'attribute', value: 'version', label: 'Version Code', length: 3, uppercase: true },
    { id: 'def-7', type: 'sequence', value: 'sequence', label: 'Sequence', length: 4, paddingChar: '0' },
];

const IdConfigEditor: React.FC<{ config: Config, onUpdateConfig: (newConfig: Config) => void }> = ({ config, onUpdateConfig }) => {
    const sections = config.idConfiguration || DEFAULT_ID_CONFIG;
    const globalSeparator = config.idSeparator || '-';
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    
    const updateSection = (id: string, updates: Partial<IdSection>) => {
        const newSections = sections.map(s => s.id === id ? { ...s, ...updates } : s);
        onUpdateConfig({ ...config, idConfiguration: newSections });
    };
    const updateSeparator = (separator: string) => {
        onUpdateConfig({ ...config, idSeparator: separator });
    };
    const addSection = (type: IdSectionType, value: string, label: string) => {
        const newSection: IdSection = {
            id: `sec-${Date.now()}`,
            type,
            value,
            label,
            length: type === 'static' ? undefined : 4,
            uppercase: true,
            paddingChar: type === 'sequence' ? '0' : undefined
        };
        onUpdateConfig({ ...config, idConfiguration: [...sections, newSection] });
        setIsAddMenuOpen(false);
    };
    const removeSection = (id: string) => {
        onUpdateConfig({ ...config, idConfiguration: sections.filter(s => s.id !== id) });
    };
    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newSections.length) {
            [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
            onUpdateConfig({ ...config, idConfiguration: newSections });
        }
    };
    const resetToDefault = () => {
        if(confirm("Are you sure you want to reset to the default ID configuration?")) {
            onUpdateConfig({ ...config, idConfiguration: DEFAULT_ID_CONFIG, idSeparator: '-' });
        }
    };
    const previewId = sections.map(section => {
        let val = '';
        switch (section.type) {
            case 'static': val = section.value; break;
            case 'attribute': val = 'ATTR'; break;
            case 'sequence': val = '0012'; break;
            case 'date': val = '2025'; break;
        }
        return val;
    }).join(globalSeparator);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-800">ID Configuration</h3>
                <button onClick={resetToDefault} className="text-sm text-slate-500 hover:text-siteblue"><RefreshCw size={14}/> Reset</button>
            </div>
            <div className="mb-6 flex gap-4 items-center">
                <label className="text-sm font-medium">Separator:</label>
                <select value={globalSeparator} onChange={(e) => updateSeparator(e.target.value)} className="border rounded p-1 focus:ring-siteblue focus:border-siteblue"><option value="-">-</option><option value="_">_</option><option value="/">/</option></select>
                <div className="text-sm bg-slate-100 px-3 py-1 rounded">Preview: <span className="font-mono font-bold">{previewId}</span></div>
            </div>
            <div className="space-y-2 mb-4">
                {sections.map((section, index) => (
                    <div key={section.id} className="flex items-center gap-3 p-3 border rounded-md bg-white">
                        <span className="text-xs font-bold text-slate-400 w-16">{section.type}</span>
                        <input value={section.label} onChange={(e) => updateSection(section.id, { label: e.target.value })} className="border-b border-transparent hover:border-slate-300 focus:border-siteblue outline-none text-sm font-medium" />
                        <div className="flex-grow"></div>
                        <button onClick={() => moveSection(index, 'up')} disabled={index===0} className="text-slate-400 hover:text-siteblue">↑</button>
                        <button onClick={() => moveSection(index, 'down')} disabled={index===sections.length-1} className="text-slate-400 hover:text-siteblue">↓</button>
                        <button onClick={() => removeSection(section.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                    </div>
                ))}
            </div>
            <button onClick={() => addSection('static', 'FIX', 'Fixed Text')} className="text-sm text-siteblue flex items-center gap-1 hover:underline"><Plus size={14}/> Add Section</button>
        </div>
    );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ config, onUpdateConfig, users, assets, families, vendors, onUpdateVendors, onImportData, onNavigateToFamily, onEditFamily, onAddFamily }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'picklists' | 'ids' | 'data' | 'modals' | 'reports'>('picklists');
    const [metadataSubTab, setMetadataSubTab] = useState<'types' | 'products' | 'sites' | 'departments' | 'vendors'>('types');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Helpers for simple lists
    const handleAddSimpleItem = (key: keyof Config, item: string) => {
        if (Array.isArray(config[key]) && !(config[key] as string[]).includes(item)) {
            onUpdateConfig({ ...config, [key]: [...(config[key] as string[]), item] });
        }
    };
    const handleRemoveSimpleItem = (key: keyof Config, item: string) => {
        if (Array.isArray(config[key])) {
            onUpdateConfig({ ...config, [key]: (config[key] as string[]).filter(i => i !== item) });
        }
    };

    const handleAddVendor = () => {
        const name = prompt("Vendor Name:");
        if (name) {
            const newVendor: Vendor = { id: `v-${Date.now()}`, name };
            onUpdateVendors([...vendors, newVendor]);
        }
    };

    const handleDeleteVendor = (id: string) => {
        if(confirm("Delete this vendor?")) {
            onUpdateVendors(vendors.filter(v => v.id !== id));
        }
    };

    // --- Data Transformation for DataTables ---
    const siteData = config.sites.map(s => ({ id: s, name: s }));
    const deptData = config.departments.map(d => ({ id: d, name: d }));
    const assetTypesData = config.assetTypes || [];

    const downloadData = () => {
        const data = { generatedAt: new Date().toISOString(), users, assets, families, vendors, config };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `backup.json`; a.click();
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 inline-flex gap-2 flex-wrap">
                <button onClick={() => setActiveTab('general')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'general' ? 'bg-siteblue/10 text-siteblue' : 'text-slate-600 hover:bg-slate-50'}`}><Wrench size={18} /> General Settings</button>
                <button onClick={() => setActiveTab('picklists')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'picklists' ? 'bg-siteblue/10 text-siteblue' : 'text-slate-600 hover:bg-slate-50'}`}><List size={18} /> Metadata Lists</button>
                <button onClick={() => setActiveTab('ids')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'ids' ? 'bg-siteblue/10 text-siteblue' : 'text-slate-600 hover:bg-slate-50'}`}><Hash size={18} /> ID Configuration</button>
                <button onClick={() => setActiveTab('modals')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'modals' ? 'bg-siteblue/10 text-siteblue' : 'text-slate-600 hover:bg-slate-50'}`}><Sliders size={18} /> Modal Settings</button>
                <button onClick={() => setActiveTab('data')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'data' ? 'bg-siteblue/10 text-siteblue' : 'text-slate-600 hover:bg-slate-50'}`}><Database size={18} /> Database Management</button>
                <button onClick={() => setActiveTab('reports')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeTab === 'reports' ? 'bg-siteblue/10 text-siteblue' : 'text-slate-600 hover:bg-slate-50'}`}><BarChart3 size={18} /> Reports & Analytics</button>
            </div>

            {activeTab === 'general' && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 max-w-3xl">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">General System Settings</h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center py-4 border-b border-slate-100">
                            <div>
                                <h4 className="font-medium text-slate-700">Default License Assignment Model</h4>
                                <p className="text-sm text-slate-500">Choose default behavior when creating new license products.</p>
                            </div>
                            <select className="border border-slate-300 rounded px-3 py-1 text-sm text-slate-700 focus:ring-siteblue focus:border-siteblue">
                                <option value="Multiple">Multiple Users (Shared)</option>
                                <option value="Single">Single User</option>
                            </select>
                        </div>
                        <div className="flex justify-between items-center py-4 border-b border-slate-100">
                            <div>
                                <h4 className="font-medium text-slate-700">Default Hardware Assignment Model</h4>
                                <p className="text-sm text-slate-500">Choose default behavior when creating new hardware products.</p>
                            </div>
                            <select className="border border-slate-300 rounded px-3 py-1 text-sm text-slate-700 focus:ring-siteblue focus:border-siteblue">
                                <option value="Single">Single User</option>
                                <option value="Multiple">Multiple Users (Shared)</option>
                            </select>
                        </div>
                        <div className="flex justify-between items-center py-4">
                            <div>
                                <h4 className="font-medium text-slate-700">Enable Usage Tracking</h4>
                                <p className="text-sm text-slate-500">Track active users for all assets regardless of assignment.</p>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" checked className="h-5 w-5 accent-siteblue rounded border-gray-300"/>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'picklists' && (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[700px]">
                    <div className="border-b border-slate-200 bg-slate-50 px-6">
                        <nav className="-mb-px flex space-x-6 overflow-x-auto">
                            <button onClick={() => setMetadataSubTab('types')} className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${metadataSubTab === 'types' ? 'border-siteblue text-siteblue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Asset Types</button>
                            <button onClick={() => setMetadataSubTab('products')} className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${metadataSubTab === 'products' ? 'border-siteblue text-siteblue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Products</button>
                            <button onClick={() => setMetadataSubTab('vendors')} className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${metadataSubTab === 'vendors' ? 'border-siteblue text-siteblue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Vendors</button>
                            <button onClick={() => setMetadataSubTab('sites')} className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${metadataSubTab === 'sites' ? 'border-siteblue text-siteblue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Sites</button>
                            <button onClick={() => setMetadataSubTab('departments')} className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${metadataSubTab === 'departments' ? 'border-siteblue text-siteblue' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Departments</button>
                        </nav>
                    </div>
                    
                    <div className="p-6 flex-grow overflow-hidden flex flex-col">
                        {metadataSubTab === 'types' && (
                            <DataTable 
                                columns={[
                                    { accessorKey: 'name', header: 'Type Name' },
                                    { accessorKey: 'prefix', header: 'ID Prefix' }
                                ]}
                                data={assetTypesData}
                                addButton={<button className="px-3 py-1.5 text-sm bg-siteblue text-white rounded shadow-sm hover:opacity-90" onClick={() => prompt('Feature not implemented in mock')}>+ Add Type</button>}
                            />
                        )}
                        {metadataSubTab === 'products' && (
                            <DataTable 
                                columns={[
                                    { accessorKey: 'name', header: 'Product Name', cell: ({row}) => <button onClick={() => onNavigateToFamily?.(row.original)} className="text-siteblue hover:underline flex items-center gap-1">{(row.original as any).name}<ExternalLink size={10}/></button> },
                                    { accessorKey: 'assetType', header: 'Type' },
                                    { accessorKey: 'productCode', header: 'Code' },
                                    { accessorKey: 'actions', header: '', width: 50, cell: ({row}) => <button onClick={() => onEditFamily?.(row.original)} className="text-siteblue hover:opacity-80"><CustomEditIcon size={16}/></button> }
                                ]}
                                data={families}
                                addButton={<button className="px-3 py-1.5 text-sm bg-siteblue text-white rounded shadow-sm hover:opacity-90" onClick={onAddFamily}>+ Add Product</button>}
                            />
                        )}
                        {metadataSubTab === 'vendors' && (
                            <DataTable 
                                columns={[
                                    { accessorKey: 'name', header: 'Vendor Name' },
                                    { accessorKey: 'contactName', header: 'Contact' },
                                    { accessorKey: 'email', header: 'Email' },
                                    { accessorKey: 'website', header: 'Website', cell: ({row}) => {
                                        const v = row.original as Vendor;
                                        return v.website ? <a href={v.website} target="_blank" rel="noreferrer" className="text-siteblue hover:underline truncate block w-40">{v.website}</a> : <span>-</span> 
                                    }},
                                    { accessorKey: 'actions', header: '', width: 50, cell: ({row}) => <button onClick={() => handleDeleteVendor(row.original.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button> }
                                ]}
                                data={vendors}
                                addButton={<button className="px-3 py-1.5 text-sm bg-siteblue text-white rounded shadow-sm hover:opacity-90" onClick={handleAddVendor}>+ Add Vendor</button>}
                            />
                        )}
                        {metadataSubTab === 'sites' && (
                            <DataTable 
                                columns={[
                                    { accessorKey: 'name', header: 'Site Name' },
                                    { accessorKey: 'actions', header: '', width: 50, cell: ({row}) => <button onClick={() => handleRemoveSimpleItem('sites', (row.original as any).name)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button> }
                                ]}
                                data={siteData}
                                addButton={<button className="px-3 py-1.5 text-sm bg-siteblue text-white rounded shadow-sm hover:opacity-90" onClick={() => { const s = prompt('New Site:'); if(s) handleAddSimpleItem('sites', s); }}>+ Add Site</button>}
                            />
                        )}
                        {metadataSubTab === 'departments' && (
                            <DataTable 
                                columns={[
                                    { accessorKey: 'name', header: 'Department Name' },
                                    { accessorKey: 'actions', header: '', width: 50, cell: ({row}) => <button onClick={() => handleRemoveSimpleItem('departments', (row.original as any).name)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button> }
                                ]}
                                data={deptData}
                                addButton={<button className="px-3 py-1.5 text-sm bg-siteblue text-white rounded shadow-sm hover:opacity-90" onClick={() => { const d = prompt('New Department:'); if(d) handleAddSimpleItem('departments', d); }}>+ Add Department</button>}
                            />
                        )}
                    </div>
                </div>
            )}
            
            {activeTab === 'modals' && (
                <div className="h-[700px]">
                    <ModalSettingsEditor config={config} onUpdateConfig={onUpdateConfig} />
                </div>
            )}
            
            {activeTab === 'ids' && <div className="h-[600px]"><IdConfigEditor config={config} onUpdateConfig={onUpdateConfig} /></div>}

            {activeTab === 'data' && (
                <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Database Management</h3>
                    <div className="flex gap-4">
                        <button onClick={downloadData} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-md hover:bg-slate-900"><Download size={18} /> Export JSON</button>
                        <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-siteblue text-white rounded-md hover:opacity-90"><Upload size={18} /> Import Excel</button>
                    </div>
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="bg-white p-10 rounded-lg shadow-sm text-center border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800">Reports & Analytics</h2>
                    <p className="mt-2 text-slate-500">This section is under construction. Dashboards for license utilization, hardware lifecycle, and cost analysis will be available here soon.</p>
                </div>
            )}
            
            {onImportData && <DataImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImport={onImportData} existingFamilies={families.map(f => ({ id: f.id, name: f.name, type: f.assetType }))} />}
        </div>
    );
};

export default AdminDashboard;
