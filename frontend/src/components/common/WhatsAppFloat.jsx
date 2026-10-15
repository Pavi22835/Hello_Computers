import { MessageCircle } from "lucide-react";
import { whatsappLink } from "../../config/site";

function WhatsAppFloat() {
  return (
    <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="pulse-ring fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--whatsapp)] text-white shadow-xl transition hover:scale-105 sm:bottom-7 sm:right-7">
      <MessageCircle size={26} />
    </a>
  );
}

export default WhatsAppFloat;
