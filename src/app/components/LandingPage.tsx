import Link from 'next/link';
import React from 'react';
import { FileText, Zap, Users } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background">
      <header className="flex flex-col items-center">
        <h1 className="text-6xl font-extrabold tracking-tighter text-primary md:text-7xl lg:text-8xl">
          Noted
        </h1>
        <p className="max-w-2xl mt-4 text-lg text-foreground  md:text-xl">
          The ultimate marketplace for university notes. Buy high-quality summaries, sell your own, and ace your exams with peer-powered knowledge.
        </p>
        <Link href="/dashboard">
          <span className="inline-block px-8 py-4 mt-8 text-lg font-semibold text-primary-foreground transition-transform transform bg-primary rounded-full cursor-pointer hover:bg-primary/90 hover:scale-105">
            Explore Notes
          </span>
        </Link>
      </header>

      <section className="grid max-w-4xl gap-8 mt-20 md:grid-cols-3">
        <div className="flex flex-col items-center p-6 bg-card border border-border rounded-lg">
          <FileText className="w-10 h-10 mb-4 text-primary" />
          <h3 className="text-xl font-bold">Quality Content</h3>
          <p className="mt-2 text-muted-foreground">
            Find verified, top-rated notes from the best students in your courses.
          </p>
        </div>
        <div className="flex flex-col items-center p-6 bg-card border border-border rounded-lg">
          <Zap className="w-10 h-10 mb-4 text-primary" />
          <h3 className="text-xl font-bold">Instant Access</h3>
          <p className="mt-2 text-muted-foreground">
            Get the study materials you need, right when you need them. Instantly downloadable.
          </p>
        </div>
        <div className="flex flex-col items-center p-6 bg-card border border-border rounded-lg">
          <Users className="w-10 h-10 mb-4 text-primary" />
          <h3 className="text-xl font-bold">By Students, For Students</h3>
          <p className="mt-2 text-muted-foreground">
            Join a community dedicated to collaborative learning and academic success.
          </p>
        </div>
      </section>
    </div>
  );
};
