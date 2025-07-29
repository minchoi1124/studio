import ReflectionForm from '@/components/reflection-form';

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-headline text-accent">
            Weekly Reflection Template 
          </h1>
          {/* <p className="text-muted-foreground mt-2">
            Weekly reflection writing companion
          </p> */}
        </div>
        <ReflectionForm />
      </div>
    </main>
  );
}
