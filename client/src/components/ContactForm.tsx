import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    checkin: '',
    checkout: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`Form field ${name} changed to: ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted with data:', formData);
    
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message sent!",
      description: "Thank you for your inquiry. We'll get back to you soon.",
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      checkin: '',
      checkout: '',
      message: ''
    });
    
    setIsSubmitting(false);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle data-testid="text-contact-title">Get in Touch</CardTitle>
        <p className="text-muted-foreground text-sm">
          Questions, dates, special requests or group bookings – we're happy to help.
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your name"
              required
              data-testid="input-name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              required
              data-testid="input-email"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkin">Check-in</Label>
              <Input
                id="checkin"
                name="checkin"
                type="date"
                value={formData.checkin}
                onChange={handleInputChange}
                data-testid="input-checkin"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="checkout">Check-out</Label>
              <Input
                id="checkout"
                name="checkout"
                type="date"
                value={formData.checkout}
                onChange={handleInputChange}
                data-testid="input-checkout"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Tell us about your stay preferences, special requests, or any questions..."
              rows={4}
              data-testid="input-message"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
            data-testid="button-submit"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            By submitting you agree to be contacted about your inquiry.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}