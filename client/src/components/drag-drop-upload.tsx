import { useState, useCallback } from 'react';
import { Upload, X, Image, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DragDropUploadProps {
  onFileSelect: (file: File) => void;
  onUrlChange?: (url: string) => void;
  currentUrl?: string;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  placeholder?: string;
}

export function DragDropUpload({
  onFileSelect,
  onUrlChange,
  currentUrl = '',
  accept = 'image/*',
  maxSize = 5,
  className,
  placeholder = 'Drop your logo here or click to browse'
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [useUrlInput, setUseUrlInput] = useState(!!currentUrl);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please upload an image file (PNG, JPG, GIF, etc.)';
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    
    return null;
  };

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);

      // Upload to server
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onFileSelect(file);
      
      // If we have a URL callback, update it with the uploaded URL
      if (onUrlChange && data.url) {
        onUrlChange(data.url);
      }
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  if (useUrlInput) {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Company Logo URL</label>
          <button
            type="button"
            onClick={() => setUseUrlInput(false)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Switch to file upload
          </button>
        </div>
        <input
          type="url"
          value={currentUrl}
          onChange={(e) => onUrlChange?.(e.target.value)}
          placeholder="https://your-logo-url.com/logo.png"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-sm text-gray-500">
          Upload your logo to a service like Imgur, Cloudinary, or your website and paste the URL here
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Company Logo</label>
        <button
          type="button"
          onClick={() => setUseUrlInput(true)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Use URL instead
        </button>
      </div>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400',
          error && 'border-red-300 bg-red-50'
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-2">
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className={cn(
                'h-8 w-8',
                error ? 'text-red-400' : 'text-gray-400'
              )} />
              <div className="text-center">
                <p className="text-sm text-gray-600">{placeholder}</p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to {maxSize}MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {currentUrl && (
        <div className="flex items-center space-x-2 text-green-600">
          <Image className="h-4 w-4" />
          <p className="text-sm">Logo uploaded successfully</p>
        </div>
      )}
    </div>
  );
}