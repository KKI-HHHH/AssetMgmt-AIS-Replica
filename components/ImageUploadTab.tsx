import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';

interface ImageUploadTabProps {
  currentAvatar: string | undefined;
  onAvatarChange: (newUrl: string | undefined) => void;
  contactName: string;
}

const logoImages = [
    'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?q=80&w=2069&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1529612453803-b038531649c5?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1611162616805-6a406b2a1a1a?q=80&w=1974&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1548345680-f5475ea5df84?q=80&w=2073&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=1889&auto=format&fit=crop',
];

const coverImages = [
    'https://images.unsplash.com/photo-1549492423-400259a5e5a4?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1473187983305-f61531474237?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506259996624-9f2f5e7b3b9b?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1444044205806-38f376274260?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1533109721025-d1ae7de64092?q=80&w=1887&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1496902526517-c0f2cb8fdb6a?q=80&w=2070&auto=format&fit=crop',
];

const generalImages = [
    'https://images.unsplash.com/photo-1551887373-3c5bd21ffd05?q=80&w=1925&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502920514358-906c5555a69e?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516048015710-7a3b4c86be43?q=80&w=1887&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509223103693-5e7836798094?q=80&w=2069&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1887&auto=format&fit=crop',
];

const NavButton: React.FC<{ active?: boolean; onClick: () => void; children: React.ReactNode; isVertical?: boolean;}> = ({ active, onClick, children, isVertical }) => (
    <button
        type="button"
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md ${
            active
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
        } ${isVertical ? 'w-full text-left' : ''}`}
    >
        {children}
    </button>
);

const ImageUploadTab: React.FC<ImageUploadTabProps> = ({ currentAvatar, onAvatarChange, contactName }) => {
    const [imageCategory, setImageCategory] = useState('Logos');
    const [imageSourceTab, setImageSourceTab] = useState('existing');

    const activeGallery = useMemo(() => {
        switch (imageCategory) {
            case 'Logos': return logoImages;
            case 'Covers': return coverImages;
            case 'Images': return generalImages;
            default: return [];
        }
    }, [imageCategory]);

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full">
            {/* Left Panel */}
            <div className="w-full md:w-1/3 lg:w-1/4 space-y-4">
                <div className="space-y-1">
                    <NavButton onClick={() => setImageCategory('Logos')} active={imageCategory === 'Logos'} isVertical>Logos</NavButton>
                    <NavButton onClick={() => setImageCategory('Covers')} active={imageCategory === 'Covers'} isVertical>Covers</NavButton>
                    <NavButton onClick={() => setImageCategory('Images')} active={imageCategory === 'Images'} isVertical>Images</NavButton>
                </div>
                {currentAvatar && (
                    <div className="p-2 border bg-white rounded-lg shadow-sm">
                        <img src={currentAvatar} alt="Current selection" className="w-full h-auto object-cover rounded-md aspect-square" />
                         <button 
                            type="button" 
                            onClick={() => onAvatarChange(undefined)} 
                            className="w-full mt-2 flex items-center justify-center gap-2 text-sm text-red-600 hover:bg-red-50 rounded-md py-2">
                            <X size={16} />
                            Clear Image
                        </button>
                    </div>
                )}
            </div>

            {/* Right Panel */}
            <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div>
                        <label htmlFor="imageUrl" className="block text-xs font-medium text-gray-500">Image-Url</label>
                        <input 
                            type="text" 
                            id="imageUrl" 
                            name="imageUrl" 
                            value={currentAvatar || ''} 
                            onChange={(e) => onAvatarChange(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                        />
                    </div>
                    <div>
                        <label htmlFor="altText" className="block text-xs font-medium text-gray-500">Selected image alternate text</label>
                        <input 
                            type="text" 
                            id="altText" 
                            name="altText" 
                            value={contactName} 
                            readOnly
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-50" 
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 p-1 bg-gray-200 rounded-lg mb-4">
                     <NavButton onClick={() => setImageSourceTab('existing')} active={imageSourceTab === 'existing'}>
                        Choose from existing ({activeGallery.length})
                     </NavButton>
                     <NavButton onClick={() => setImageSourceTab('upload')} active={imageSourceTab === 'upload'}>
                        Upload
                     </NavButton>
                </div>

                {imageSourceTab === 'existing' && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {activeGallery.map((imgSrc, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => onAvatarChange(imgSrc)}
                                className={`aspect-square rounded-lg overflow-hidden focus:outline-none transition-all duration-200 ${currentAvatar === imgSrc ? 'ring-2 ring-offset-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'}`}
                            >
                                <img src={imgSrc} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}

                 {imageSourceTab === 'upload' && (
                    <div className="flex items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500">Upload functionality is not yet available.</p>
                    </div>
                 )}
            </div>
        </div>
    );
};

export default ImageUploadTab;