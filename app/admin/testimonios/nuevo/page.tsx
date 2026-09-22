import type { Metadata } from "next";
import { TestimonialForm } from "@/components/admin/testimonial-form";

export const metadata: Metadata = { title: "Nuevo testimonio" };

export default function NuevoTestimonioPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-glow">
        Nuevo testimonio
      </h1>
      <TestimonialForm mode="create" />
    </div>
  );
}
