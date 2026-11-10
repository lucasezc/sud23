import { Truck, CreditCard, Headphones } from "lucide-react";
import type { ReactNode } from "react";

const perks = [
  { icon: <Truck className="h-6 w-6" />, label: "Envíos a todo el país" },
  { icon: <CreditCard className="h-6 w-6" />, label: "Medios de pago seguros" },
  { icon: <Headphones className="h-6 w-6" />, label: "Atención personalizada" },
];

const svgProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-5 w-5",
};

const socials: { label: string; href: string; icon: ReactNode }[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/sud23oficial/",
    icon: (
      <svg {...svgProps}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    icon: (
      <svg {...svgProps}>
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg {...svgProps}>
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <path d="m10 15 5-3-5-3z" />
      </svg>
    ),
  },
];

const Footer = () => {
  return (
    <footer className="mt-1 border-t border-neutral-100 bg-white md:mt-2">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-6 px-4 py-6 md:flex-row md:justify-between md:px-12">
        {/* Beneficios */}
        <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3 md:w-auto md:gap-0 md:divide-x md:divide-neutral-300">
          {perks.map((p) => (
            <li
              key={p.label}
              className="flex items-center justify-center gap-3 md:justify-start md:px-6 md:first:pl-0"
            >
              {p.icon}
              <span className="text-[10px] font-semibold uppercase tracking-wide">
                {p.label}
              </span>
            </li>
          ))}
        </ul>

        {/* Redes */}
        <div className="flex items-center gap-4">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              className="transition-opacity hover:opacity-60"
              target="_blank"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;