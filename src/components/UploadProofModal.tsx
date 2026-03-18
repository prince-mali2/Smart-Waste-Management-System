import React, { useState, useRef } from 'react';
import { X, Upload, Camera, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { toast } from 'react-hot-toast';

interface UploadProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (imageUrl: string) => Promise<void>;
  report: any;
}

export const UploadProofModal: React.FC<UploadProofModalProps> = ({ isOpen, onClose, onSubmit, report }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      toast.error('Please upload a proof image');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(image);
      toast.success('Task completed successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting proof:', error);
      toast.error('Failed to submit proof image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl overflow-hidden shadow-2xl border-none">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Complete Task</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Upload proof of collection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before Image */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Before Cleaning</label>
              <div className="aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                {report.beforeImage ? (
                  <img 
                    src={report.beforeImage} 
                    alt="Before" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/waste/400/300';
                    }}
                  />
                ) : (
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                )}
              </div>
            </div>

            {/* After Image (Upload) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">After Cleaning (Proof)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`aspect-video rounded-xl overflow-hidden border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2
                  ${image ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-300 dark:border-gray-700 hover:border-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-900'}
                `}
              >
                {image ? (
                  <img src={image} alt="After" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                      <Camera className="h-6 w-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Click to upload</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                    </div>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>
          </div>

          {!image && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-sm border border-amber-100 dark:border-amber-900/30">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Proof image is required to mark this task as completed.
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700" 
            disabled={!image || loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" /> Complete Task
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};
