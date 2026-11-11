import { Truck } from "lucide-react";

const AnnouncementBar = () => {
  return (
    <div className="bg-black px-4 py-2 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 text-[9px] font-medium uppercase tracking-wide md:text-[10px]">
        <span className="flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Envíos a todo el país
        </span>
        <span className="text-white/40">|</span>
        <span>Cambios y devoluciones</span>
      </div>
    </div>
  );
};

export default AnnouncementBar;