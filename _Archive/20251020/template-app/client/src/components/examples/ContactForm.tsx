import ContactForm from '../ContactForm'
import { Toaster } from "@/components/ui/toaster";

export default function ContactFormExample() {
  return (
    <div className="p-8">
      <ContactForm />
      <Toaster />
    </div>
  )
}