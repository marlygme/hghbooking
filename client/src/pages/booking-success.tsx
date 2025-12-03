import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Mail, Clock, ArrowLeft } from "lucide-react";

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          
          <h1 className="text-2xl font-semibold mb-2" data-testid="text-success-title">
            Request Submitted!
          </h1>
          
          <p className="text-muted-foreground mb-6" data-testid="text-success-message">
            Thank you for your booking request. We've received your details and will review them shortly.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
              <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-left">
                Check your email for a confirmation of your request
              </p>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
              <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-left">
                We'll respond within 24 hours with approval or next steps
              </p>
            </div>
          </div>

          <Link href="/">
            <Button variant="outline" className="w-full" data-testid="button-return-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
