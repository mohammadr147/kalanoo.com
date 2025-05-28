
'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button, buttonVariants } from '@/components/ui/button';
import { Upload, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CheckImageUploadProps {
  onImageSelect: (base64DataUrl: string | null) => void;
  initialPreviewUrl?: string | null;
  disabled?: boolean;
  fieldDescription?: string;
}

export function CheckImageUpload({
  onImageSelect,
  initialPreviewUrl,
  disabled,
  fieldDescription = "تصویر خوانا از روی چک بارگذاری شود."
}: CheckImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreviewUrl || null);
  const { toast } = useToast();

  useEffect(() => {
    // Update preview if initialPreviewUrl changes from parent
    setPreviewUrl(initialPreviewUrl || null);
  }, [initialPreviewUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB size limit
        toast({
          title: "حجم فایل زیاد است",
          description: "لطفاً تصویری با حجم کمتر از ۲ مگابایت انتخاب کنید.",
          variant: "destructive",
        });
        // Reset file input
        event.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64DataUrl = reader.result as string;
        setPreviewUrl(base64DataUrl);
        onImageSelect(base64DataUrl);
      };
      reader.onerror = () => {
        toast({
          title: "خطا در خواندن فایل",
          description: "مشکلی در پردازش تصویر انتخاب شده رخ داد.",
          variant: "destructive",
        });
         onImageSelect(null);
      };
      reader.readAsDataURL(file);
    } else {
      // No file selected or selection cancelled
      // If there was a preview from initial prop, don't clear it unless explicitly removed
      // If it was a user-selected preview, it's fine to clear on new selection cancel
      if (previewUrl && previewUrl !== initialPreviewUrl) {
        // setPreviewUrl(null); // Optional: clear preview if selection is cancelled
      }
      // onImageSelect(null); // Do not automatically send null if selection is just cancelled
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageSelect(null);
    // Reset the file input visually if possible (though direct reset is tricky)
    const input = document.getElementById('check-image-upload-input') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Input
        id="check-image-upload-input"
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        onChange={handleFileChange}
        className="hidden" // Hide default input
        disabled={disabled}
      />
      <Label
        htmlFor="check-image-upload-input"
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'cursor-pointer w-full flex items-center gap-2 justify-center',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Upload className="ml-2 h-4 w-4" />
        {previewUrl ? 'تغییر تصویر چک' : 'انتخاب تصویر چک *'}
      </Label>
      {fieldDescription && <p className="text-xs text-muted-foreground">{fieldDescription}</p>}
      {previewUrl && (
        <div className="mt-2 p-2 border rounded-md relative w-fit mx-auto">
          <Image
            src={previewUrl}
            alt="پیش نمایش تصویر چک"
            width={200}
            height={100} // Adjust aspect ratio as needed
            className="rounded object-contain"
            data-ai-hint="check image preview"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 bg-destructive/80 hover:bg-destructive text-destructive-foreground rounded-full"
            onClick={handleRemoveImage}
            disabled={disabled}
            aria-label="حذف تصویر"
          >
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
