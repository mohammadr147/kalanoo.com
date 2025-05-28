import { PhoneAuthForm } from '@/components/auth/phone-auth-form';

export default function AuthPage() {
  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
      {/* Adjust min-height calculation based on your actual header/footer heights if needed */}
      <PhoneAuthForm />
    </div>
  );
}

// Define CSS variables for header/footer height in globals.css or use Tailwind config
// Example in globals.css:
// :root {
//   --header-height: 56px; /* Adjust based on your Header component */
//   --footer-height: 96px; /* Adjust based on your Footer component */
// }
