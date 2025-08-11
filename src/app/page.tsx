import ReflectionForm from '@/components/reflection-form';
import Timer from '@/components/timer';

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-headline text-accent">
            Weekly Reflection Template
          </h1>
        </div>
        <div className="relative flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/3 xl:w-1/4">
            <div className="lg:sticky lg:top-8">
              <Timer />
            </div>
          </aside>
          <div className="flex-1">
            <ReflectionForm />
          </div>
        </div>
      </div>
    </main>
  );
}
