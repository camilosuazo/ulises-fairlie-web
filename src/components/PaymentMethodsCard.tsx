import Image from "next/image";

interface PaymentMethodsCardProps {
  className?: string;
}

export function PaymentMethodsCard({ className = "" }: PaymentMethodsCardProps) {
  return (
    <div className={`rounded-2xl border bg-white/90 backdrop-blur p-4 sm:p-5 shadow-sm ${className}`}>
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
        <div className="relative w-44 h-16 shrink-0">
          <Image
            src="/mercado-pago.png"
            alt="Mercado Pago"
            fill
            className="object-contain"
            sizes="176px"
          />
        </div>
        <div className="text-center sm:text-left">
          <p className="text-sm sm:text-base font-semibold text-foreground">
            Pago seguro con Mercado Pago
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Paga con tarjeta de crédito, tarjeta de débito o con tu cuenta de Mercado Pago.
          </p>
        </div>
      </div>
    </div>
  );
}
