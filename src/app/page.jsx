// app/page.js - Landing Page
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <h1 className="text-2xl font-bold text-indigo-900">HostelCare</h1>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-indigo-900 leading-tight mb-6">
              Hostel Management & Complaint Resolution Portal
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              A streamlined platform for hostel residents to submit complaints and for wardens to efficiently manage and resolve issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login?role=student">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto">
                  Student Login
                </Button>
              </Link>
              <Link href="/login?role=admin">
                <Button size="lg" variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 w-full sm:w-auto">
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
            <Image 
              src="/hostel-illustration.svg" 
              alt="Hostel illustration" 
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}