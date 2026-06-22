import type { NavLink, PricingInfo, PaymentMethod } from "@/types";

export const navLinks: NavLink[] = [
  { label: "Inicio", href: "#hero" },
  { label: "Manifiesto", href: "#manifesto" },
  { label: "Programa", href: "#program" },
  { label: "Tarifa", href: "#pricing" },
  { label: "Registro", href: "#onboarding" },
];

export const pricing: PricingInfo = {
  price: "8.900",
  currency: "USD",
  note: "Precio por persona. Sujeto a confirmación de invitación.",
  includes: [
    "3 noches en Hotel Explora (suite individual)",
    "Todas las comidas: desayuno, almuerzo, cena, coffee breaks",
    "Barra abierta de vinos y espumantes chilenos",
    "Excursiones guiadas dentro del Parque Nacional",
    "Transfers desde/hacia Punta Arenas (ida y vuelta)",
    "Equipamiento técnico para caminatas",
    "Seguro de viaje dentro de Chile",
  ],
  excludes: [
    "Vuelos internacionales o domésticos hasta Punta Arenas",
    "Estadías adicionales antes o después del evento",
    "Servicios personales (spa, lavandería, llamadas)",
    "Propinas",
  ],
};

export const CARD_PAYMENT_METHODS = ['card-cl', 'card-intl'];

// Metadata estructural de los métodos (IDs y monedas nunca cambian)
const PAYMENT_METHODS_META = [
  { id: 'transfer-clp', currency: 'CLP', key: 'transfer_clp' },
  { id: 'transfer-usd', currency: 'USD', key: 'transfer_usd' },
  { id: 'transfer-us',  currency: 'USD', key: 'transfer_us'  },
  { id: 'global66',     currency: 'USD', key: 'global66'     },
  { id: 'card-cl',      currency: 'CLP', key: 'card_cl'      },
  { id: 'card-intl',    currency: 'USD', key: 'card_intl'    },
] as const;

export function buildPaymentMethods(
  content: Record<string, { es: string; en: string }>,
  lang: 'es' | 'en'
): PaymentMethod[] {
  return PAYMENT_METHODS_META.map((meta) => ({
    id: meta.id,
    currency: meta.currency,
    label: content[`${meta.key}_label`]?.[lang] ?? meta.id,
    details: (content[`${meta.key}_details`]?.[lang] ?? '').split('\n').filter(Boolean),
  }));
}

// Fallback estático para contextos sin acceso al DB (ej. StepConfirm sin content)
export const paymentMethods: PaymentMethod[] = PAYMENT_METHODS_META.map((meta) => ({
  id: meta.id,
  currency: meta.currency,
  label: meta.id,
  details: [],
}));

