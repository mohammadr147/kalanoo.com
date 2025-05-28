
import { fetchInfoPageBySlug } from '@/app/actions'; // Action to fetch page content
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { notFound } from 'next/navigation';

interface InfoPageProps {
  params: { slug: string };
}

export default async function InfoPage({ params }: InfoPageProps) {
  const { slug } = params;
  const result = await fetchInfoPageBySlug(slug);

  if (!result.success || !result.page) {
     // If the page is explicitly marked as inactive or not found
     if (result.error === 'صفحه یافت نشد یا غیرفعال است.') {
        notFound(); // Trigger Next.js 404 page
     }
     // For other errors (like DB connection), show an error message
    return (
       <div className="container mx-auto px-4 py-12">
           <Alert variant="destructive">
             <Info className="h-4 w-4" />
             <AlertTitle>خطا</AlertTitle>
             <AlertDescription>{result.error || 'خطا در بارگذاری صفحه.'}</AlertDescription>
           </Alert>
       </div>
    );
  }

  const { page } = result;

  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold mb-4">{page.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Render HTML content safely. Consider using a sanitizer if content comes from untrusted sources */}
          <div
             className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none dark:prose-invert" // Basic Tailwind prose styling
             dangerouslySetInnerHTML={{ __html: page.content || '' }}
           />
        </CardContent>
      </Card>
    </div>
  );
}

// Optional: Generate Metadata dynamically
export async function generateMetadata({ params }: InfoPageProps) {
    const { slug } = params;
    const result = await fetchInfoPageBySlug(slug);

    if (result.success && result.page) {
        return {
            title: `${result.page.meta_title || result.page.title} | کالانو`,
            description: result.page.meta_description || `اطلاعات صفحه ${result.page.title} در فروشگاه کالانو`,
        };
    } else {
        return {
             title: 'صفحه یافت نشد | کالانو',
             description: 'صفحه مورد نظر یافت نشد.',
        }
    }
}
