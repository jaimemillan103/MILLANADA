import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'La Millanada 2026',
  description: 'Comida, juegos, temazos y confirmaciones para La Millanada 2026 en Córdoba.',
  openGraph: {
    title: 'La Millanada 2026',
    description: 'Confirma si vienes, elige plato y entra en el plan familiar del año.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
