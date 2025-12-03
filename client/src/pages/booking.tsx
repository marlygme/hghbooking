import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  User, 
  Grid3X3, 
  Calendar as CalendarIcon, 
  ClipboardCheck,
  Users,
  Mail,
  Phone,
  Cake,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";
import type { InsertBookingRequest } from "@shared/schema";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  age: z.coerce.number().min(16, "Must be at least 16 years old").max(100, "Please enter a valid age"),
  reason: z.string().min(10, "Please provide more details about your booking reason"),
  estimatedAttendees: z.coerce.number().min(1, "At least 1 attendee required").max(50, "Maximum 50 attendees"),
  pitchType: z.enum(["single_court", "full_pitch"]),
  bookingDate: z.string().min(1, "Please select a date"),
  timeSlots: z.array(z.string()).min(1, "Please select at least one time slot"),
  frequency: z.enum(["one_off", "weekly", "fortnightly", "monthly"]),
});

type FormData = z.infer<typeof formSchema>;

const TIME_SLOTS = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", 
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
  "21:00", "21:30", "22:00"
];

const STEPS = [
  { id: 1, title: "Details", icon: User },
  { id: 2, title: "Pitch", icon: Grid3X3 },
  { id: 3, title: "Schedule", icon: CalendarIcon },
  { id: 4, title: "Review", icon: ClipboardCheck },
];

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      age: 18,
      reason: "",
      estimatedAttendees: 10,
      pitchType: "single_court",
      bookingDate: "",
      timeSlots: [],
      frequency: "one_off",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InsertBookingRequest) => {
      const response = await apiRequest("POST", "/api/bookings", data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Booking Request Submitted!",
        description: "We'll review your request and get back to you via email within 24 hours.",
      });
      setLocation("/booking-success");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit booking request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const validateStep = async (currentStep: number): Promise<boolean> => {
    switch (currentStep) {
      case 1:
        return await form.trigger(["name", "email", "phone", "age", "reason", "estimatedAttendees"]);
      case 2:
        return await form.trigger(["pitchType"]);
      case 3:
        return await form.trigger(["bookingDate", "timeSlots", "frequency"]);
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep(step);
    if (isValid) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = (data: FormData) => {
    submitMutation.mutate(data);
  };

  const values = form.watch();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <h1 className="font-semibold">Book a Pitch</h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-card border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      step > s.id
                        ? "bg-primary text-primary-foreground"
                        : step === s.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                    data-testid={`step-indicator-${s.id}`}
                  >
                    {step > s.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <s.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 font-medium ${
                      step >= s.id ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-12 md:w-24 h-0.5 mx-2 transition-colors ${
                      step > s.id ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-3xl mx-auto px-4 py-8">
          {/* Step 1: User Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">Your Details</h2>
                <p className="text-muted-foreground">Tell us about yourself and your booking needs</p>
              </div>

              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Smith" 
                          {...field} 
                          data-testid="input-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="john@example.com" 
                            {...field} 
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="tel" 
                            placeholder="0412 345 678" 
                            {...field} 
                            data-testid="input-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Cake className="w-4 h-4 text-muted-foreground" />
                          Age
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={16} 
                            max={100} 
                            {...field} 
                            data-testid="input-age"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimatedAttendees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          Estimated Attendees
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            max={50} 
                            {...field} 
                            data-testid="input-attendees"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        Reason for Booking
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your planned activity (e.g., casual game, training session, birthday party, corporate event...)"
                          className="resize-none"
                          rows={4}
                          {...field} 
                          data-testid="input-reason"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Step 2: Pitch Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">Select Your Pitch</h2>
                <p className="text-muted-foreground">Choose between a single court or the full pitch</p>
              </div>

              <FormField
                control={form.control}
                name="pitchType"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid md:grid-cols-2 gap-6"
                      >
                        <Label
                          htmlFor="single_court"
                          className="cursor-pointer"
                        >
                          <Card 
                            className={`hover-elevate transition-all ${
                              field.value === "single_court" 
                                ? "ring-2 ring-primary" 
                                : ""
                            }`}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <RadioGroupItem 
                                  value="single_court" 
                                  id="single_court"
                                  className="mt-1"
                                  data-testid="radio-single-court"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-lg">Single Court</h3>
                                    <Badge variant="secondary" className="text-xs">5-a-side</Badge>
                                  </div>
                                  
                                  {/* Court Diagram */}
                                  <div className="bg-primary/10 rounded-md p-4 mb-4">
                                    <div className="relative w-full aspect-[2/1] border-2 border-primary/30 rounded">
                                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-primary/30 rounded-full" />
                                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-12 border-2 border-l-0 border-primary/30" />
                                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-12 border-2 border-r-0 border-primary/30" />
                                    </div>
                                  </div>
                                  
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>Perfect for small groups</li>
                                    <li>Up to 12 players</li>
                                    <li>Standard 5-a-side dimensions</li>
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Label>

                        <Label
                          htmlFor="full_pitch"
                          className="cursor-pointer"
                        >
                          <Card 
                            className={`hover-elevate transition-all ${
                              field.value === "full_pitch" 
                                ? "ring-2 ring-primary" 
                                : ""
                            }`}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <RadioGroupItem 
                                  value="full_pitch" 
                                  id="full_pitch"
                                  className="mt-1"
                                  data-testid="radio-full-pitch"
                                />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-lg">Full Pitch</h3>
                                    <Badge variant="secondary" className="text-xs">10-a-side</Badge>
                                  </div>
                                  
                                  {/* Pitch Diagram */}
                                  <div className="bg-primary/10 rounded-md p-4 mb-4">
                                    <div className="relative w-full aspect-[2/1] border-2 border-primary/30 rounded">
                                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border-2 border-primary/30 rounded-full" />
                                      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-primary/30" />
                                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-16 border-2 border-l-0 border-primary/30" />
                                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-16 border-2 border-r-0 border-primary/30" />
                                    </div>
                                  </div>
                                  
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>Ideal for larger events</li>
                                    <li>Up to 30 players</li>
                                    <li>Full venue access</li>
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 3: Schedule */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">Choose Your Schedule</h2>
                <p className="text-muted-foreground">Select your preferred date and time slots</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Calendar */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Select Date</Label>
                  <FormField
                    control={form.control}
                    name="bookingDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Card>
                            <CardContent className="p-4">
                              <Calendar
                                mode="single"
                                selected={field.value ? new Date(field.value) : undefined}
                                onSelect={(date) => {
                                  field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                                }}
                                disabled={(date) =>
                                  isBefore(date, startOfDay(new Date())) ||
                                  isBefore(addDays(new Date(), 60), date)
                                }
                                className="rounded-md"
                                data-testid="calendar-date"
                              />
                            </CardContent>
                          </Card>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Time Slots & Frequency */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Select Time Slots</Label>
                    <FormField
                      control={form.control}
                      name="timeSlots"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto p-1">
                              {TIME_SLOTS.map((slot) => {
                                const isSelected = field.value.includes(slot);
                                return (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) {
                                        field.onChange(field.value.filter((s) => s !== slot));
                                      } else {
                                        field.onChange([...field.value, slot].sort());
                                      }
                                    }}
                                    className={`px-3 py-2 text-sm rounded-md transition-all ${
                                      isSelected
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover-elevate"
                                    }`}
                                    data-testid={`timeslot-${slot.replace(":", "")}`}
                                  >
                                    {slot}
                                  </button>
                                );
                              })}
                            </div>
                          </FormControl>
                          <FormMessage />
                          {field.value.length > 0 && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Selected: {field.value.join(", ")}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-3 block">Booking Frequency</Label>
                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid grid-cols-2 gap-3"
                            >
                              {[
                                { value: "one_off", label: "One-off" },
                                { value: "weekly", label: "Weekly" },
                                { value: "fortnightly", label: "Fortnightly" },
                                { value: "monthly", label: "Monthly" },
                              ].map((freq) => (
                                <Label
                                  key={freq.value}
                                  htmlFor={freq.value}
                                  className={`flex items-center gap-2 p-3 rounded-md cursor-pointer transition-all ${
                                    field.value === freq.value
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground hover-elevate"
                                  }`}
                                >
                                  <RadioGroupItem
                                    value={freq.value}
                                    id={freq.value}
                                    className="sr-only"
                                    data-testid={`radio-${freq.value}`}
                                  />
                                  {freq.label}
                                </Label>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold mb-2">Review Your Booking</h2>
                <p className="text-muted-foreground">Please confirm all details are correct</p>
              </div>

              <div className="space-y-4">
                <ReviewSection
                  title="Personal Details"
                  onEdit={() => setStep(1)}
                  items={[
                    { label: "Name", value: values.name },
                    { label: "Email", value: values.email },
                    { label: "Phone", value: values.phone },
                    { label: "Age", value: values.age.toString() },
                    { label: "Attendees", value: values.estimatedAttendees.toString() },
                    { label: "Reason", value: values.reason },
                  ]}
                />

                <ReviewSection
                  title="Pitch Selection"
                  onEdit={() => setStep(2)}
                  items={[
                    { 
                      label: "Pitch Type", 
                      value: values.pitchType === "single_court" ? "Single 5-a-side Court" : "Full Pitch"
                    },
                  ]}
                />

                <ReviewSection
                  title="Schedule"
                  onEdit={() => setStep(3)}
                  items={[
                    { 
                      label: "Date", 
                      value: values.bookingDate 
                        ? format(new Date(values.bookingDate), "EEEE, MMMM d, yyyy")
                        : "Not selected"
                    },
                    { label: "Time Slots", value: values.timeSlots.join(", ") || "None selected" },
                    { 
                      label: "Frequency", 
                      value: values.frequency.charAt(0).toUpperCase() + values.frequency.slice(1).replace("_", " ")
                    },
                  ]}
                />
              </div>

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <p className="text-sm text-center text-muted-foreground">
                    By submitting this request, you agree to be contacted regarding your booking. 
                    We'll review your request and respond within 24 hours.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Footer */}
          <div className="sticky bottom-0 bg-background border-t mt-8 -mx-4 px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  data-testid="button-back"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <Button 
                  type="button" 
                  onClick={handleNext}
                  data-testid="button-next"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={submitMutation.isPending}
                  data-testid="button-submit"
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

function ReviewSection({
  title,
  onEdit,
  items,
}: {
  title: string;
  onEdit: () => void;
  items: { label: string; value: string }[];
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" data-testid={`review-section-${title.toLowerCase().replace(/\s/g, "-")}`}>{title}</h3>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={onEdit}
            data-testid={`button-edit-${title.toLowerCase().replace(/\s/g, "-")}`}
          >
            Edit
          </Button>
        </div>
        <dl className="grid gap-2">
          {items.map((item) => (
            <div key={item.label} className="flex flex-wrap gap-2">
              <dt className="text-sm text-muted-foreground min-w-24">{item.label}:</dt>
              <dd className="text-sm font-medium flex-1" data-testid={`text-review-${item.label.toLowerCase()}`}>{item.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
