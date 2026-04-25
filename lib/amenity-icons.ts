import {
  Car,
  Coffee,
  ConciergeBell,
  Dumbbell,
  type LucideIcon,
  PawPrint,
  Tv,
  Waves,
  Wifi,
  Wind,
  Wine,
} from "lucide-react";

/**
 * Map from `amenities.icon` (DB value) to a Lucide icon component.
 * Add a new entry whenever a new amenity icon name is seeded.
 */
export const amenityIconMap: Record<string, LucideIcon> = {
  wifi: Wifi,
  coffee: Coffee,
  car: Car,
  dumbbell: Dumbbell,
  waves: Waves,
  "paw-print": PawPrint,
  wind: Wind,
  tv: Tv,
  wine: Wine,
  "concierge-bell": ConciergeBell,
};
