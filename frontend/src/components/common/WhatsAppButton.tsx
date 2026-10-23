const NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");

/** Floating "Chat on WhatsApp" button. Hidden unless VITE_WHATSAPP_NUMBER is set. */
export function WhatsAppButton() {
  if (!NUMBER) return null;
  const href = `https://wa.me/${NUMBER}?text=${encodeURIComponent("Hello, I have a question for JMJ Hyderabad Province.")}`;
  return (
    <a className="whatsapp-btn" href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
      <svg viewBox="0 0 32 32" aria-hidden="true" width="28" height="28">
        <path
          fill="currentColor"
          d="M16.04 3C9.4 3 4 8.36 4 14.97c0 2.11.56 4.17 1.62 5.98L4 29l8.27-1.6a12.1 12.1 0 0 0 3.77.6C22.66 28 28 22.64 28 16.03 28 9.42 22.66 3 16.04 3Zm0 22.9c-1.21 0-2.4-.2-3.53-.6l-.5-.18-4.9.95.98-4.73-.2-.48a9.86 9.86 0 0 1-1.44-4.9c0-5.46 4.48-9.9 10-9.9 5.5 0 9.98 4.44 9.98 9.98 0 5.45-4.48 9.86-10.39 9.86Zm5.47-7.38c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.78.96-.95 1.16-.18.2-.35.22-.65.07-.3-.15-1.27-.46-2.42-1.48-.9-.8-1.5-1.77-1.67-2.07-.18-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.62-.93-2.22-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.52.07-.8.37-.27.3-1.04 1.01-1.04 2.47 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.48.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z"
        />
      </svg>
      <span className="whatsapp-btn__label">Chat with us</span>
    </a>
  );
}
