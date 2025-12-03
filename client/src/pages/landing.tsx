import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Calendar, ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section - Full screen with gradient overlay */}
      <div className="relative flex-1 min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background gradient simulating futsal pitch */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-secondary" />
        
        {/* Pitch line decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-white rounded-full" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-white" />
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-px bg-white" />
          <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 h-24 border-4 border-white rounded-b-full border-t-0" />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-24 border-4 border-white rounded-t-full border-b-0" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm mb-6">
            <MapPin className="w-4 h-4" />
            <span>110 Elizabeth Street, Richmond</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
            Book Your
            <br />
            <span className="text-white/90">Futsal Pitch</span>
          </h1>
          
          <p className="text-white/80 text-lg md:text-xl mb-8 leading-relaxed">
            Reserve a 5-a-side court or the entire pitch for your next game, training session, or tournament.
          </p>
          
          <Link href="/book">
            <Button 
              size="lg" 
              className="bg-white text-primary font-semibold px-8 py-6 text-lg"
              data-testid="button-start-booking"
            >
              Start Booking
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-background py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Choose Your Space"
              description="Select a single 5-a-side court or book the entire pitch for larger groups."
              step={1}
            />
            <FeatureCard
              icon={<Calendar className="w-6 h-6" />}
              title="Pick Date & Time"
              description="Browse available slots and choose the perfect time for your session."
              step={2}
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6" />}
              title="Get Confirmed"
              description="Submit your request and receive confirmation via email within 24 hours."
              step={3}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t py-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground text-sm">
            110 Elizabeth Street Futsal Pitch
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Richmond, Victoria
          </p>
          <div className="mt-4">
            <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Admin Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  step 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  step: number;
}) {
  return (
    <div className="relative text-center p-6">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
        {step}
      </div>
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary mt-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2" data-testid={`text-feature-title-${step}`}>{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed" data-testid={`text-feature-desc-${step}`}>{description}</p>
    </div>
  );
}
