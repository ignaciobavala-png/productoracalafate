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

export const paymentMethods: PaymentMethod[] = [
  {
    id: "transfer-clp",
    label: "Transferencia bancaria en Chile (Pesos)",
    currency: "CLP",
    details: [
      "Productora Calafate SPA",
      "RUT: 78.102754-5",
      "Banco Bice",
      "Cuenta Corriente: 12-02013-9",
      "calafatesummits@gmail.com",
    ],
  },
  {
    id: "transfer-usd",
    label: "Transferencia bancaria en Chile (Dólares)",
    currency: "USD",
    details: [
      "Productora Calafate SPA",
      "RUT: 78.102754-5",
      "Banco Bice",
      "Cuenta Corriente: 013-12-04076-6",
      "andreagerardi@yahoo.com",
    ],
  },
  {
    id: "transfer-us",
    label: "Transferencia bancaria en EEUU",
    currency: "USD",
    details: [
      "Account Holder: Calafate SPA",
      "Account Number: 8333242022",
      "Routing Number: 026073150",
      "Swift / BIC: CMFGUS33",
      "Bank: Community Federal Savings Bank",
      "Bank Address: 5 Penn Plaza, 14th Floor, New York, NY 10001, US",
      "Company Address: Av. Andres Bello 2711, piso 16. Las Condes, Santiago de Chile",
    ],
  },
  {
    id: "global66",
    label: "Global66",
    currency: "USD",
    details: ["Calafate SPA", "@CALAFCL002"],
  },
  {
    id: "card-cl",
    label: "Tarjeta de crédito (Chile)",
    currency: "CLP",
    details: ["Solicitar link de pago Transbank a calafatesummits@gmail.com"],
  },
  {
    id: "card-intl",
    label: "Tarjeta de crédito (Fuera de Chile)",
    currency: "USD",
    details: ["Solicitar link de pago a calafatesummits@gmail.com"],
  },
];

