
import { CompleteProfileForm } from '@/components/auth/complete-profile-form';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Wrapper component to handle Suspense boundary for useSearchParams
function CompleteProfileFormWrapper() {
    return <CompleteProfileForm />;
}

export default function CompleteProfilePage() {
  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-start min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
        <Suspense fallback={
            <div className="flex justify-center items-center h-40 w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span>در حال بارگذاری فرم...</span>
            </div>
        }>
           <CompleteProfileFormWrapper />
        </Suspense>
    </div>
  );
}
