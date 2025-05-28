
'use client'; // This page uses client components for dialogs
import { Suspense, useState, useCallback } from 'react';
import { Loader2, Image as ImageIcon, PlusCircle } from 'lucide-react'; // Use ImageIcon alias
import { Button } from '@/components/ui/button';
import { BannerListAdmin } from '@/components/admin/banner-list-admin';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BannerForm } from '@/components/admin/banner-form'; // Import the form


export default function AdminBannersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Key to trigger re-fetch in BannerListAdmin

  const handleFormSubmitSuccess = useCallback(() => {
    setIsCreateDialogOpen(false); // Close the dialog
    setRefreshKey(prevKey => prevKey + 1); // Increment key to trigger refresh
  }, []);


  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">مدیریت بنرها و اسلایدر</h1>
        </div>
         <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
           <DialogTrigger asChild>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <PlusCircle className="ml-2 h-4 w-4" />
                  افزودن بنر جدید
              </Button>
           </DialogTrigger>
           <DialogContent className="sm:max-w-[700px]"> {/* Adjusted width for better form display */}
              <DialogHeader>
                 <DialogTitle>افزودن بنر جدید</DialogTitle>
                 <DialogDescription>
                    اطلاعات بنر جدید را برای نمایش در اسلایدر صفحه اصلی وارد کنید.
                 </DialogDescription>
              </DialogHeader>
              <BannerForm
                  mode="create"
                  onFormSubmitSuccess={handleFormSubmitSuccess}
                  onCancel={() => setIsCreateDialogOpen(false)}
              />
           </DialogContent>
         </Dialog>
      </div>

      <Suspense fallback={
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <BannerListAdmin key={refreshKey} /> {/* Pass key to force re-render and re-fetch */}
      </Suspense>
    </div>
  );
}


    