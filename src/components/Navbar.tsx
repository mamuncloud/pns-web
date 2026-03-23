import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md flex justify-between items-center px-6 md:px-12 py-4 max-w-full">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10">
          <Image
            alt="Planet Nyemil Snack Logo"
            className="object-contain"
            src="https://lh3.googleusercontent.com/aida/ADBb0ugu9YgiSdGuBizvxfPffI9VpO4LHdECL9eYgXr1Asvt8Vc24w3aMlhbjGJ1i6xzo6kHWY5eiRUd4LY50La2UtSlRi8VrluWX36tRH8i89oEFqDgamSP5YloKLTD1b6VtR8ANLNUVBWUvjYvSaLtTKF1ZOWUzMslbLKO27RL9VoZPIuhSOC4z2bYmt-bxqkSeXASIHpQ3_jq7a2TjCUMyWYShHhsTgGyvdoMbtgGk8K7VUWbiUnmLO-VZrIt5lnSjHq0wG8KuLvlzQ"
            fill
            sizes="40px"
          />
        </div>
        <span className="font-headline font-extrabold text-primary text-lg hidden sm:block">
          Planet Nyemil Snack
        </span>
      </div>
      <div className="hidden md:flex items-center gap-10">
        <Link className="text-primary font-bold border-b-2 border-primary py-1" href="/">
          Home
        </Link>
        <Link className="text-on-background/70 font-semibold hover:text-primary transition-colors" href="#">
          Product
        </Link>
        <Link className="text-on-background/70 font-semibold hover:text-primary transition-colors" href="#">
          Partner with Us
        </Link>
      </div>
      <div className="flex items-center gap-5">
        <button className="text-on-background/70 hover:text-primary transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined">shopping_cart</span>
        </button>
        <button className="text-on-background/70 hover:text-primary transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </nav>
  );
}
