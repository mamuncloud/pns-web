import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          {/* Brand Section */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 bg-white rounded-2xl p-2">
                <Image
                  alt="Planet Nyemil Snack Logo"
                  className="object-contain p-2"
                  src="/logo.png"
                  fill
                  sizes="64px"
                />
              </div>
              <span className="font-headline font-black text-2xl leading-tight">
                Planet Nyemil
                <br />
                Snack
              </span>
            </div>
            <p className="text-white/70 text-lg leading-relaxed max-w-md">
              Pusat camilan lezat dan autentik untuk menemani setiap momen kamu
              dengan cita rasa Indonesia yang khas.
            </p>
            <div className="flex gap-4">
              <Link
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                href="https://www.instagram.com/planetnyemilsnack"
                target="_blank" 
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </Link>
              <Link
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                href="https://www.tiktok.com/@planetnyemilsnack"
                target="_blank" 
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
              </Link>
              <Link
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                href="https://api.whatsapp.com/send?phone=6285800342727"
                target="_blank" 
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-3">
            <h4 className="font-headline font-black mb-8 uppercase tracking-widest text-sm opacity-60">
              Navigasi
            </h4>
            <ul className="space-y-4 font-semibold">
              <li>
                <Link className="hover:text-accent transition-colors" href="/login">
                  Staff
                </Link>
              </li>
              <li>
                <Link className="hover:text-accent transition-colors" href="#">
                  {/* Kebijakan Privasi */}
                </Link>
              </li>
              <li>
                <Link className="hover:text-accent transition-colors" href="#">
                  {/* Syarat & Ketentuan */}
                </Link>
              </li>
              <li>
                <Link className="hover:text-accent transition-colors" href="#">
                  {/* Pusat Bantuan */}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-4">
            <h4 className="font-headline font-black mb-8 uppercase tracking-widest text-sm opacity-60">
              Hubungi Kami
            </h4>
            <ul className="space-y-5 font-semibold">
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-white/60">
                  location_on
                </span>
                <span>
                  Jl. Beringin Raya No.6B, RT.006/RW.002, Karawaci Baru, Kec.
                  Karawaci, Tangerang Kota, Banten 15116
                </span>
              </li>
              <li className="flex gap-4">
                <span className="material-symbols-outlined text-white/60">call</span>
                <span>+6285800342727</span>
              </li>
              <li className="flex gap-4">
                {/* <span className="material-symbols-outlined text-white/60">mail</span> */}
                {/* <span>halo@pnsnack.id</span> */}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Planet Nyemil Snack. All Rights Reserved.
          </p>
          <div className="flex gap-10 text-xs font-bold text-white/40 uppercase tracking-widest">
            <Link className="hover:text-white transition-colors" href="#">
              {/* Privacy */}
            </Link>
            <Link className="hover:text-white transition-colors" href="#">
              {/* Terms */}
            </Link>
            <Link className="hover:text-white transition-colors" href="#">
              {/* Cookies */}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
