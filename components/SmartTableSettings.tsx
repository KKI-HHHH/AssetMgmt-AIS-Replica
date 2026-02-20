
import React, { useState, useEffect } from 'react';
import { X, RotateCcw, FileSpreadsheet, Printer, Maximize2, ArrowUpDown, LogIn } from 'lucide-react';
import { CustomEditIcon } from '../App';

export interface SmartTableColumnConfig {
  id: string;
  title: string;
  isVisible: boolean;
  width: number;
  order: number;
}

export interface SmartTableViewSettings {
  showHeader: boolean;
  showColumnFilter: boolean;
  showAdvancedSearch: boolean;
  tableHeight: 'Flexible' | 'Fixed';
}

interface SmartTableSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  columns: SmartTableColumnConfig[];
  viewSettings: SmartTableViewSettings;
  onApply: (columnConfig: SmartTableColumnConfig[], viewSettings: SmartTableViewSettings) => void;
}

// Provided classic pencil icon for this specific view
const PencilIcon: React.FC<{ size?: number; className?: string }> = ({ size = 12, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 2048 2048"
    className={className}
    fill="currentColor"
  >
    <path d="M2048 335q0 66-25 128t-73 110L633 1890L0 2048l158-633L1475 98q48-48 110-73t128-25q69 0 130 26t106 72t72 107t27 130zM326 1428q106 35 182 111t112 183L1701 640l-293-293L326 1428zm-150 444l329-82q-10-46-32-87t-55-73t-73-54t-87-33l-82 329zM1792 549q25-25 48-47t41-46t28-53t11-67q0-43-16-80t-45-66t-66-45t-81-17q-38 0-66 10t-53 29t-47 41t-47 48l293 293z"/>
  </svg>
);

// Teams logo SVG
const TeamsIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor"
  >
    <path d="M12.5 13.5v-3.5c0-.83.67-1.5 1.5-1.5h3c.83 0 1.5.67 1.5 1.5v3.5c0 .83-.67 1.5-1.5 1.5h-3c-.83 0-1.5-.67-1.5-1.5zm.5 8.5c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-4.5c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1V22zm-7.5-6.5v-4c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-3c-1.1 0-2-.9-2-2zm.5 8.5c0 .83.67 1.5 1.5 1.5h4c.83 0 1.5-.67 1.5-1.5v-5c0-.83-.67-1.5-1.5-1.5h-4c-.83 0-1.5.67-1.5 1.5V22zm-.5-18c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5zm11 1.5c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"/>
  </svg>
);

/**
 * Enhanced InfoIcon with custom white-background tooltip
 */
const InfoIconSmall: React.FC<{ tooltip?: string }> = ({ tooltip }) => {
  if (!tooltip) return (
    <span className="w-3.5 h-3.5 rounded-full border border-slate-400 text-slate-500 flex items-center justify-center text-[8px] font-serif italic inline-block flex-shrink-0">
      i
    </span>
  );

  return (
    <div className="relative group inline-block">
      <span className="w-3.5 h-3.5 rounded-full border border-slate-400 text-slate-500 flex items-center justify-center text-[8px] font-serif italic cursor-help flex-shrink-0 hover:border-siteblue hover:text-siteblue transition-colors">
        i
      </span>
      {/* Custom Tooltip with White Background and Border */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white text-slate-700 text-[11px] leading-relaxed rounded border border-slate-200 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[9999] w-64 text-center">
        {tooltip}
        {/* Tooltip Arrow - White with border mimic */}
        <div className="absolute top-full left-1/2 -translate-x-1/2">
          <div className="border-x-6 border-x-transparent border-t-6 border-t-slate-200"></div>
          <div className="absolute top-[-1px] left-0 border-x-6 border-x-transparent border-t-6 border-t-white"></div>
        </div>
      </div>
    </div>
  );
};

const SmartTableSettings: React.FC<SmartTableSettingsProps> = ({ 
  isOpen, 
  onClose, 
  columns, 
  viewSettings,
  onApply
}) => {
  const [localColumns, setLocalColumns] = useState<SmartTableColumnConfig[]>([]);
  
  // Settings State
  const [showHeader, setShowHeader] = useState(true);
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(true);
  const [tableHeight, setTableHeight] = useState<'Flexible' | 'Fixed'>('Flexible');

  useEffect(() => {
    if (isOpen) {
      // Initialize with current settings
      setShowHeader(viewSettings.showHeader);
      setShowColumnFilter(viewSettings.showColumnFilter);
      setShowAdvancedSearch(viewSettings.showAdvancedSearch);
      setTableHeight(viewSettings.tableHeight);

      // Initialize columns
      setLocalColumns([...columns].sort((a, b) => a.order - b.order));
    }
  }, [isOpen, columns, viewSettings]);

  if (!isOpen) return null;

  const handleToggleColumn = (id: string) => {
    setLocalColumns(prev => prev.map(c => c.id === id ? { ...c, isVisible: !c.isVisible } : c));
  };

  const handleWidthChange = (id: string, width: number) => {
    setLocalColumns(prev => prev.map(c => c.id === id ? { ...c, width } : c));
  };

  const handleOrderChange = (id: string, order: number) => {
     setLocalColumns(prev => prev.map(c => c.id === id ? { ...c, order } : c));
  };

  const handleApply = () => {
    const newViewSettings: SmartTableViewSettings = {
      showHeader,
      showColumnFilter,
      showAdvancedSearch,
      tableHeight,
    };
    // Ensure order is sequential for safety before applying, though pure sort key usage is fine
    const sortedColumns = [...localColumns].sort((a, b) => a.order - b.order);
    onApply(sortedColumns, newViewSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[1px]" onClick={onClose}>
      <div className="bg-white w-full max-w-[1000px] shadow-2xl rounded-sm border border-slate-200 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
           <h2 className="text-lg font-semibold text-siteblue">Asset Management - SmartTable Settings</h2>
           <div className="flex items-center gap-4 text-xs text-slate-600">
              <button className="text-siteblue hover:underline">Default Settings</button>
              <button className="text-siteblue hover:underline">Restore default table</button>
              <InfoIconSmall tooltip="General table configuration settings." />
              <button onClick={onClose}><X className="w-5 h-5 text-slate-500 hover:text-slate-700"/></button>
           </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto bg-white flex-1">
            {/* Customized Setting Section */}
            <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-800 mb-2">Customized Setting</h4>
                <div className="border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8 pt-2">
                        {/* Table Header Controls */}
                        <div>
                            <div className="font-semibold text-xs text-slate-700 mb-2">Table Header</div>
                            <div className="flex flex-wrap gap-4 mb-2">
                                <label className="flex items-center gap-1 text-xs cursor-pointer select-none text-slate-700 whitespace-nowrap">
                                    <input type="checkbox" checked={showHeader} onChange={e => setShowHeader(e.target.checked)} className="accent-siteblue rounded w-4 h-4 mr-1"/> 
                                    <span>Show Header</span> <InfoIconSmall tooltip="Show or hide the main table toolbar." />
                                </label>
                                <label className="flex items-center gap-1 text-xs cursor-pointer select-none text-slate-700 whitespace-nowrap">
                                    <input type="checkbox" checked={showColumnFilter} onChange={e => setShowColumnFilter(e.target.checked)} className="accent-siteblue rounded w-4 h-4 mr-1"/> 
                                    <span>Show Column Filter</span>
                                </label>
                            </div>
                            <label className="flex items-center gap-1 text-xs cursor-pointer select-none text-slate-700 whitespace-nowrap">
                                <input type="checkbox" checked={showAdvancedSearch} onChange={e => setShowAdvancedSearch(e.target.checked)} className="accent-siteblue rounded w-4 h-4 mr-1"/> 
                                <span>Show Advanced Search</span>
                            </label>
                        </div>

                        {/* Table Height */}
                        <div>
                            <div className="font-semibold text-xs text-slate-700 mb-2">Table Height</div>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-1 text-xs cursor-pointer select-none text-slate-700 whitespace-nowrap">
                                    <input type="radio" checked={tableHeight === 'Flexible'} onChange={() => setTableHeight('Flexible')} name="height" className="accent-siteblue w-4 h-4 mr-1"/> 
                                    Flexible
                                </label>
                                <label className="flex items-center gap-1 text-xs cursor-pointer select-none text-slate-700 whitespace-nowrap">
                                    <input type="radio" checked={tableHeight === 'Fixed'} onChange={() => setTableHeight('Fixed')} name="height" className="accent-siteblue w-4 h-4 mr-1"/> 
                                    Fixed
                                </label>
                            </div>
                        </div>

                        {/* Table Header Icons Section */}
                        <div>
                            <div className="font-semibold text-xs text-slate-700 mb-2">Table Header Icons</div>
                            <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-white w-fit shadow-sm">
                                <div className="p-1.5 border-r border-slate-200 bg-white"><TeamsIcon className="w-4 h-4 text-slate-500"/></div>
                                <div className="p-1.5 border-r border-slate-200 bg-white"><LogIn className="w-4 h-4 text-slate-500 rotate-180"/></div>
                                <div className="p-1.5 border-r border-slate-200 bg-slate-50"><FileSpreadsheet className="w-4 h-4 text-siteblue"/></div>
                                <div className="p-1.5 border-r border-slate-200 bg-slate-50"><Printer className="w-4 h-4 text-siteblue"/></div>
                                <div className="p-1.5 border-r border-slate-200 bg-slate-50"><Maximize2 className="w-4 h-4 text-siteblue"/></div>
                                <div className="p-1.5 border-r border-slate-200 bg-white"><PencilIcon size={16} className="text-slate-500"/></div>
                                <div className="p-1.5 bg-slate-50"><ArrowUpDown className="w-4 h-4 text-siteblue"/></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Column Settings Section */}
            <div>
                <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-1">
                    Column Settings <InfoIconSmall tooltip="Manage the visibility, width and display order of the table columns." />
                </h4>
                
                <div className="border border-slate-200 rounded-sm">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-2 w-1/2">
                                  <div className="flex items-center gap-1 whitespace-nowrap">
                                    Columns <InfoIconSmall tooltip="Default settings are stored in centralized database the changes done here will be only for current user on this table it will not impact anyone else. For centralized changes suggestions contact admin." />
                                  </div>
                                </th>
                                <th className="px-4 py-2 w-1/4">
                                  <div className="flex items-center gap-1 whitespace-nowrap">
                                    Column Width <InfoIconSmall tooltip="Enter the column width of the particular item. Note: the width of some items can’t be changed (those items has grey background)." />
                                  </div>
                                </th>
                                <th className="px-4 py-2 w-1/4">
                                  <div className="flex items-center gap-1 whitespace-nowrap">
                                    Column Ordering <InfoIconSmall tooltip="To change the column order drag and drop the items." />
                                  </div>
                                </th>
                            </tr>
                        </thead>
                    </table>
                    <div className="max-h-[300px] overflow-y-auto">
                        <table className="w-full text-left text-xs">
                            <tbody className="divide-y divide-slate-100">
                                {localColumns.map((col) => (
                                    <tr key={col.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-2 w-1/2">
                                            <label className="flex items-center gap-2 cursor-pointer select-none whitespace-nowrap">
                                                <input 
                                                    type="checkbox" 
                                                    checked={col.isVisible} 
                                                    onChange={() => handleToggleColumn(col.id)}
                                                    className="accent-siteblue rounded w-4 h-4"
                                                />
                                                <span className={col.isVisible ? 'text-slate-800 font-medium' : 'text-slate-400'}>{col.title}</span>
                                                <PencilIcon className="inline-block ml-1 cursor-pointer hover:text-siteblue text-slate-400" />
                                            </label>
                                        </td>
                                        <td className="px-4 py-2 w-1/4">
                                            <div className="flex items-center gap-2 whitespace-nowrap">
                                                <input 
                                                    type="number" 
                                                    value={col.width} 
                                                    onChange={(e) => handleWidthChange(col.id, parseInt(e.target.value))}
                                                    className="w-16 border border-slate-300 rounded-sm px-1 py-0.5 text-center outline-none focus:border-siteblue" 
                                                />
                                                <div className="bg-slate-200 px-3 py-0.5 rounded-sm text-slate-600 font-mono text-[10px] min-w-[30px] text-center">{col.width}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2 w-1/4">
                                            <div className="flex items-center justify-between pr-4 whitespace-nowrap">
                                                <input 
                                                    type="number" 
                                                    value={col.order} 
                                                    onChange={(e) => handleOrderChange(col.id, parseInt(e.target.value))}
                                                    className="w-12 border border-slate-300 rounded-sm px-1 py-0.5 text-center outline-none focus:border-siteblue" 
                                                />
                                                <span className="font-bold text-slate-800">{col.order}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-[rgb(248,249,250)] flex justify-between items-center">
             <div className="text-xs text-disabledgrey"></div>
             <div className="flex gap-3">
                <button onClick={onClose} className="px-4 py-1.5 border border-bordergrey bg-white text-textblack rounded hover:bg-rowgrey transition-colors text-sm font-semibold">Cancel</button>
                <button onClick={handleApply} className="px-4 py-1.5 bg-siteblue text-white rounded hover:opacity-90 transition-opacity text-sm font-semibold shadow-sm">Apply</button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default SmartTableSettings;
