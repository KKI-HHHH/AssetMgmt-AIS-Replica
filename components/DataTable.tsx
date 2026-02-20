
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ColumnDef } from '../types';
import { Search, ArrowUpDown, ChevronDown, Settings, ChevronsUpDown, Printer, Maximize2, FileX, Check } from 'lucide-react';
import SmartTableSettings, { SmartTableColumnConfig, SmartTableViewSettings } from './SmartTableSettings';

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  addButton?: React.ReactNode;
}

type SearchMode = 'All Words' | 'Any Words' | 'Exact Phrase';

const DataTable = <T extends { id: any }>({ columns, data, addButton }: DataTableProps<T>) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [sorting, setSorting] = useState<{ id: string; desc: boolean } | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('All Words');
  const [isSearchModeOpen, setIsSearchModeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [columnConfig, setColumnConfig] = useState<SmartTableColumnConfig[]>([]);
  const [viewSettings, setViewSettings] = useState<SmartTableViewSettings>({
    showHeader: true,
    showColumnFilter: true,
    showAdvancedSearch: true,
    tableHeight: 'Flexible'
  });

  useEffect(() => {
    if (columns.length === 0) return;
    setColumnConfig(prev => {
        const currentSortedIds = columns.map(c => c.accessorKey).sort().join(',');
        const prevSortedIds = prev.map(c => c.id).sort().join(',');
        if (prev.length === 0 || currentSortedIds !== prevSortedIds) {
             return columns.map((col, index) => ({
                id: col.accessorKey as string,
                title: col.header,
                isVisible: true,
                width: col.width || 150,
                order: index + 1
            }));
        }
        return prev;
    });
  }, [columns]);

  // Handle click outside for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSearchModeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApplySettings = (newConfig: SmartTableColumnConfig[], newViewSettings: SmartTableViewSettings) => {
      setColumnConfig(newConfig);
      setViewSettings(newViewSettings);
  };

  const activeColumns = useMemo(() => {
      if (columnConfig.length === 0) return columns;
      const visible = columnConfig.filter(c => c.isVisible);
      const sortedConfig = visible.sort((a, b) => a.order - b.order);
      return sortedConfig.map(conf => {
          const original = columns.find(c => c.accessorKey === conf.id);
          if (!original) return null;
          return { ...original, width: conf.width };
      }).filter(Boolean) as ColumnDef<T>[];
  }, [columnConfig, columns]);

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const filteredAndSortedData = useMemo(() => {
    let filteredData = data;
    if (globalFilter && viewSettings.showAdvancedSearch) {
      filteredData = filteredData.filter(row =>
        columns.some(column => {
          const value = String(getNestedValue(row, column.accessorKey as string)).toLowerCase();
          const filter = globalFilter.toLowerCase();
          
          if (searchMode === 'Exact Phrase') {
            return value === filter;
          } else if (searchMode === 'Any Words') {
            const words = filter.split(/\s+/);
            return words.some(word => value.includes(word));
          } else {
            // All Words
            const words = filter.split(/\s+/);
            return words.every(word => value.includes(word));
          }
        })
      );
    }
    if (viewSettings.showColumnFilter) {
        Object.entries(columnFilters).forEach(([key, value]) => {
        if (value) {
            filteredData = filteredData.filter(row => {
            const rowValue = getNestedValue(row, key as string);
            return String(rowValue).toLowerCase().includes(String(value).toLowerCase());
            });
        }
        });
    }
    if (sorting) {
      filteredData.sort((a, b) => {
        const aValue = getNestedValue(a, sorting.id);
        const bValue = getNestedValue(b, sorting.id);
        if (aValue < bValue) return sorting.desc ? 1 : -1;
        if (aValue > bValue) return sorting.desc ? -1 : 1;
        return 0;
      });
    }
    return filteredData;
  }, [data, globalFilter, columnFilters, sorting, columns, viewSettings, searchMode]);

  const handleColumnFilterChange = (accessorKey: string, value: string) => {
    setColumnFilters(prev => ({ ...prev, [accessorKey]: value }));
  };
  
  const handleSort = (accessorKey: string) => {
    setSorting(prev => {
      const isDesc = prev && prev.id === accessorKey && !prev.desc;
      return { id: accessorKey, desc: !!isDesc };
    });
  };

  const ToolbarIcon = ({ icon: Icon, onClick, title }: { icon: any, onClick?: () => void, title?: string }) => (
    <button 
      onClick={onClick}
      title={title}
      className="p-1.5 border border-bordergrey bg-white rounded-md text-textblack hover:bg-rowgrey transition-colors flex items-center justify-center shadow-sm"
    >
      <Icon size={18} />
    </button>
  );

  const SearchModeOption = ({ mode }: { mode: SearchMode }) => {
    const isActive = searchMode === mode;
    return (
      <button
        onClick={() => {
          setSearchMode(mode);
          setIsSearchModeOpen(false);
        }}
        className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
          isActive 
            ? 'bg-siteblue text-white font-semibold' 
            : 'text-textblack hover:bg-slate-50'
        }`}
      >
        <div className="w-5 flex items-center justify-center">
            {isActive && <Check size={16} />}
        </div>
        {mode}
      </button>
    );
  };

  return (
    <div className={`bg-white border border-bordergrey rounded shadow-sm flex flex-col ${viewSettings.tableHeight === 'Fixed' ? 'h-[600px]' : ''}`}>
      {viewSettings.showHeader && (
        <div className="px-4 py-2 bg-rowgrey border-b border-bordergrey flex items-center justify-between rounded-t flex-shrink-0">
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-textblack whitespace-nowrap">Showing {filteredAndSortedData.length} of {data.length}</span>
                
                {viewSettings.showAdvancedSearch && (
                    <div className="flex items-center gap-2">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="Search all"
                                value={globalFilter}
                                onChange={e => setGlobalFilter(e.target.value)}
                                className="w-64 pl-3 pr-10 py-1.5 border border-bordergrey rounded-md text-sm bg-white focus:outline-none focus:border-siteblue shadow-sm"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-disabledgrey group-focus-within:text-siteblue transition-colors" />
                        </div>
                        
                        <ToolbarIcon icon={Settings} />
                        
                        <div className="relative" ref={dropdownRef}>
                            <button 
                                onClick={() => setIsSearchModeOpen(!isSearchModeOpen)}
                                className="flex items-center gap-3 px-3 py-1.5 bg-white border border-bordergrey rounded-md text-sm font-medium text-textblack hover:bg-slate-50 shadow-sm min-w-[140px] transition-colors"
                            >
                                <span className="flex-1 text-left">{searchMode}</span>
                                <ChevronDown size={16} className={`text-siteblue transition-transform duration-200 ${isSearchModeOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {isSearchModeOpen && (
                                <div className="absolute top-full left-0 mt-1 w-[180px] bg-white border border-bordergrey rounded shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <SearchModeOption mode="All Words" />
                                    <SearchModeOption mode="Any Words" />
                                    <SearchModeOption mode="Exact Phrase" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                {addButton}
                <div className="h-6 w-px bg-bordergrey mx-1" />
                <div className="flex items-center gap-1.5">
                    <ToolbarIcon icon={FileX} title="Export to Excel" />
                    <ToolbarIcon icon={Printer} title="Print Table" />
                    <ToolbarIcon icon={Maximize2} title="Expand View" />
                    <ToolbarIcon icon={ArrowUpDown} title="Sorting" />
                    <ToolbarIcon 
                        icon={Settings} 
                        onClick={() => setIsSettingsOpen(true)} 
                        title="Column Settings" 
                    />
                </div>
            </div>
        </div>
      )}

      <div className={`overflow-x-auto ${viewSettings.tableHeight === 'Fixed' ? 'flex-1 overflow-y-auto' : ''}`}>
          <table className="min-w-full divide-y divide-bordergrey border-collapse">
            <thead className="bg-rowgrey sticky top-0 z-10 shadow-sm">
                <tr>
                    {activeColumns.map(column => (
                         <th key={column.accessorKey as string} style={{ width: column.width ? `${column.width}px` : 'auto' }} className="p-1 bg-rowgrey border-b border-bordergrey text-left align-middle">
                            {viewSettings.showColumnFilter ? (
                                <div className="relative flex items-center">
                                    <input
                                        type="text"
                                        placeholder={column.header}
                                        value={columnFilters[column.accessorKey as string] || ''}
                                        onChange={e => handleColumnFilterChange(column.accessorKey as string, e.target.value)}
                                        className="w-full text-sm border border-bordergrey rounded-sm py-[7px] px-1 font-normal text-textblack placeholder:text-disabledgrey focus:outline-none focus:border-siteblue bg-white"
                                    />
                                    <button onClick={() => handleSort(column.accessorKey as string)} className="absolute right-1 top-1/2 -translate-y-1/2 text-disabledgrey hover:text-siteblue"><ChevronsUpDown size={14} /></button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between cursor-pointer hover:bg-white p-2 rounded text-xs font-semibold text-textblack uppercase tracking-wider" onClick={() => handleSort(column.accessorKey as string)}>
                                    {column.header} <ChevronsUpDown size={14} className="text-disabledgrey" />
                                </div>
                            )}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-bordergrey">
              {filteredAndSortedData.map((row) => (
                <tr key={row.id} className="hover:bg-rowgrey transition-colors">
                  {activeColumns.map((column) => (
                    <td key={`${row.id}-${column.accessorKey as string}`} style={{ width: column.width ? `${column.width}px` : 'auto' }} className="px-2 py-2 text-sm text-textblack align-middle whitespace-nowrap">
                       {column.cell ? (
                         column.cell({ row: { original: row } })
                       ) : (
                        <div className="truncate" style={{ maxWidth: column.width ? `${column.width - 16}px` : '200px' }}>
                          {String(getNestedValue(row, column.accessorKey as string) ?? '')}
                        </div>
                       )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
      </div>

      <SmartTableSettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} columns={columnConfig} viewSettings={viewSettings} onApply={handleApplySettings}/>
    </div>
  );
};

export default DataTable;
