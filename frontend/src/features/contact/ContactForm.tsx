import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Icon } from "@/components/ui/Icon";
import {
  contactSchema,
  sendContactMessage,
  type ContactFormValues,
  type ContactResponse,
} from "./services/contact.service";

const defaultValues = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  consent: undefined as unknown as true,
};

type FieldName = Exclude<keyof ContactFormValues, "consent">;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isSubmitted },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  // Hidden anti-spam field: people never see it, spam bots usually fill it.
  // Its name avoids words (website, url, company…) that browser autofill recognises.
  const honeypot = useRef<HTMLInputElement>(null);

  const mutation = useMutation<ContactResponse, Error, ContactFormValues>({
    mutationFn: (values) => sendContactMessage(values, honeypot.current?.value),
    onSuccess: () => reset(defaultValues),
  });

  // Bring the result into view: on phones the confirmation sits above the fold.
  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mutation.isSuccess && !mutation.isError) return;
    const node = resultRef.current;
    if (!node) return;
    node.scrollIntoView?.({ behavior: "smooth", block: "center" });
    node.focus?.({ preventScroll: true });
  }, [mutation.isSuccess, mutation.isError]);

  const onInvalid = () => {
    const first = Object.keys(errors)[0] as keyof ContactFormValues | undefined;
    if (first) setFocus(first);
  };

  const field = (name: FieldName, label: string, options: { required?: boolean; type?: string; autoComplete?: string; multiline?: boolean; span?: boolean } = {}) => {
    const error = errors[name]?.message;
    const id = `contact-${name}`;
    const props = {
      id,
      ...register(name),
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${id}-error` : undefined,
      "aria-required": options.required || undefined,
    };
    return (
      <div className={`field${options.span ? " span-2" : ""}`}>
        <label htmlFor={id}>
          {label}
          {options.required && <span className="req"> *</span>}
        </label>
        {options.multiline ? (
          <textarea className="textarea" rows={6} {...props} />
        ) : (
          <input className="input" type={options.type ?? "text"} autoComplete={options.autoComplete} {...props} />
        )}
        {error && (
          <span className="field__error" id={`${id}-error`}>
            {error}
          </span>
        )}
      </div>
    );
  };

  return (
    <form noValidate style={{ position: "relative" }} onSubmit={handleSubmit((values) => mutation.mutate(values), onInvalid)}>
      <div ref={resultRef} tabIndex={-1} style={{ outline: "none" }} />
      {mutation.isSuccess && (
        <div className="alert alert--success" role="status">
          <Icon name="check" />
          <div>
            <strong>Message sent</strong>
            Thank you. The provincial office will reply as soon as possible. Your reference is{" "}
            <b>{mutation.data.reference}</b>.
          </div>
        </div>
      )}
      {mutation.isError && (
        <div className="alert alert--error" role="alert">
          <Icon name="alert" />
          <div>
            <strong>Message not sent</strong>
            {mutation.error.message}
          </div>
        </div>
      )}
      {isSubmitted && Object.keys(errors).length > 0 && (
        <div className="alert alert--warning" role="alert">
          <Icon name="alert" />
          <div>Please correct the highlighted fields before sending.</div>
        </div>
      )}

      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
        <label htmlFor="contact-hp">Leave this field empty</label>
        <input id="contact-hp" ref={honeypot} type="text" name="hp_check" tabIndex={-1} autoComplete="off" data-lpignore="true" data-1p-ignore="true" defaultValue="" />
      </div>

      <div className="form-grid">
        {field("fullName", "Full name", { required: true, autoComplete: "name" })}
        {field("email", "Email", { required: true, type: "email", autoComplete: "email" })}
        {field("phone", "Phone", { type: "tel", autoComplete: "tel" })}
        {field("subject", "Subject", { required: true })}
        {field("message", "Message", { required: true, multiline: true, span: true })}
        <div className="span-2">
          <label className="check">
            <input
              type="checkbox"
              {...register("consent")}
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? "consent-error" : undefined}
            />
            <span>I consent to the Province storing these details in order to reply to my enquiry.</span>
          </label>
          {errors.consent && (
            <span className="field__error" id="consent-error">
              {errors.consent.message}
            </span>
          )}
        </div>
        <div className="span-2">
          <button type="submit" className="btn" disabled={mutation.isPending}>
            {mutation.isPending ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : <Icon name="send" />}
            {mutation.isPending ? "Sending…" : "Send message"}
          </button>
        </div>
      </div>
    </form>
  );
}
