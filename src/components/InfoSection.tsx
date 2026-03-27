"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function InfoSection() {
  const [contactName, setContactName] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const handleWhatsAppRedirect = () => {
    const phone = "6285800342727";
    const message = `Halo Planet Nyemil Snack! Nama saya ${contactName}. ${contactMessage}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
  };

  return (
    <section className="max-w-7xl mx-auto px-6 mb-6">
      <div className="w-full bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] overflow-hidden flex flex-col shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 h-full">
          <div className="p-8 md:p-12 flex flex-col justify-center bg-[#FEF9EC]/50 dark:bg-zinc-900/40 border-r border-gray-50 dark:border-zinc-800">
            <div className="mb-6">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-dark/40 dark:text-zinc-400 mb-3 block">
                Jam Operasional
              </span>
              <p className="text-xl md:text-3xl font-headline font-extrabold text-primary mb-1">
                10:00 — 22:00
              </p>
              <p className="text-on-background/60 dark:text-zinc-400 text-xs md:text-sm font-medium">
                Setiap Hari, Termasuk Libur Nasional
              </p>
            </div>
            
            <div className="mb-8 md:mb-10">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-dark/40 dark:text-zinc-400 mb-3 block">
                Lokasi Kami
              </span>
              <p className="text-on-background dark:text-zinc-200 font-bold text-xs md:text-base leading-relaxed mb-4">
                Jl. Beringin Raya No.6B, RT.006/RW.002, Karawaci Baru, Kec. Karawaci,
                Tangerang Kota, Banten 15116
              </p>
              <Link
                className="text-primary font-bold flex items-center gap-2 hover:underline text-xs md:text-sm mb-6 inline-flex"
                target="_blank"
                href="https://maps.app.goo.gl/nGVMBhaeE1fZVbfB7"
              >
                Buka Maps{" "}
                <span className="material-symbols-outlined text-xs md:text-sm">
                  open_in_new
                </span>
              </Link>

              <div className="pt-8 border-t border-gray-100 dark:border-zinc-800">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-dark/40 dark:text-zinc-400 mb-4 block">
                  Hubungi Kami
                </span>
                <div className="space-y-4">
                  <Input
                    placeholder="Nama Anda"
                    className="bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-6 text-sm h-10 ring-offset-transparent focus-visible:ring-primary/20"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                  <textarea
                    placeholder="Pesan"
                    rows={3}
                    className="w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 dark:focus:ring-primary/40 transition-all resize-none font-medium text-foreground"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                  ></textarea>
                  <Button 
                    className="w-full bg-primary text-primary-foreground font-bold h-12 rounded-xl text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-md mt-2"
                    onClick={() => handleWhatsAppRedirect()}
                  >
                    Kirim ke WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="relative h-full min-h-[300px] md:min-h-[500px] bg-gray-50">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.5212624419615!2d106.6111053!3d-6.1947517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f8c67c54d193%3A0x6a0c0e7d5a5e5e5e!2sJl.%20Beringin%20Raya%20No.6B%2C%20RT.006%2FRW.002%2C%20Karawaci%20Baru%2C%20Kec.%20Karawaci%2C%20Kota%20Tangerang%2C%20Banten%2015116!5e0!3m2!1id!2sid!4v1711380000000!5m2!1sid!2sid"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 grayscale contrast-[1.1] hover:grayscale-0 transition-all duration-700 opacity-90 hover:opacity-100"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
