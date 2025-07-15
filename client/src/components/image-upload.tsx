import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  maxSize?: number;
  className?: string;
  endpoint?: string; // Allow specifying custom upload endpoint
}

export function ImageUpload({
  value,
  onChange,
  label = "Upload Image",
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  className = "",
  endpoint = "/api/upload/logo"
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Please select an image smaller than ${Math.round(maxSize / 1024 / 1024)}MB`,
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      onChange(result.fileUrl);
      
      toast({
        title: "Upload successful",
        description: "Your image has been uploaded successfully",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>Profile Image</Label>
      
      {value ? (
        <div className="relative">
          <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src={value} 
                alt="Uploaded image" 
                className="w-16 h-16 object-cover rounded-md"
                onError={(e) => {
                  // If image fails to load, show fallback
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Image uploaded</p>
                <p className="text-xs text-gray-500">Click to change or remove</p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={triggerFileSelect}
                disabled={isUploading}
              >
                Change
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={triggerFileSelect}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            {isUploading ? 'Uploading...' : 'Click to upload an image'}
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF up to {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}