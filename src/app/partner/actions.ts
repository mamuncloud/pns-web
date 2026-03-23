"use server"

import { z } from "zod";

const PartnerFormSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  partnershipType: z.enum(["reseller", "dropshipper", "wholesale"], {
    message: "Pilih jenis kemitraan yang valid",
  }),
  message: z.string().optional(),
});

export type FormState = {
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    partnershipType?: string[];
    message?: string[];
  };
  message?: string;
  success?: boolean;
};

export async function submitPartnerForm(state: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = PartnerFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    partnershipType: formData.get("partnershipType"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
      message: "Mohon periksa kembali isian form Anda.",
    };
  }

  // TODO: Implement actual save logic (e.g., save to DB or send via email)
  
  // Simulated network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    message: "Terima kasih! Pendaftaran Anda telah kami terima. Tim kami akan segera menghubungi Anda.",
  };
}
