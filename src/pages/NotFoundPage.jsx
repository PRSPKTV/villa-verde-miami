import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="pt-32 pb-20 px-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <span className="font-data text-8xl font-bold text-verde-200 mb-4">404</span>
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-verde-800 mb-4">
        Page Not Found
      </h1>
      <p className="text-text-secondary font-body text-lg mb-8 max-w-md">
        Looks like this page has gone on vacation. Let us help you find your way back.
      </p>
      <Button to="/">Back to Home</Button>
    </div>
  );
}
