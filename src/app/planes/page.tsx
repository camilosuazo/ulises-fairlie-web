"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlanSelector } from "@/components/PlanSelector";
import { PaymentMethodsCard } from "@/components/PaymentMethodsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

const standardConditions = [
  "Clases online",
  "60 minutos",
  "Compromiso mensual",
  "Descuento por pago anticipado",
];

const includeItems = [
  "Metodología comunicativa",
  "Material digital personalizado",
  "Seguimiento y feedback constante",
  "Enfoque en inglés general y profesional",
];

export default function PlanesPage() {
  const router = useRouter();
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    try {
      setCheckoutPlanId(planId);
      const response = await fetch("/api/payments/create-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = (await response.json()) as { checkoutUrl?: string; error?: string };

      if (!response.ok || !data.checkoutUrl) {
        throw new Error(data.error || "No se pudo iniciar el pago.");
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("No se pudo iniciar el pago. Intenta nuevamente.");
    } finally {
      setCheckoutPlanId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gradient-to-b from-muted/40 to-white">
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10">Planes 2026</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Planes de pago</h1>
              <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
                Elige tu modalidad, selecciona duración y paga en línea con Mercado Pago.
              </p>
            </div>

            <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
              {standardConditions.map((condition) => (
                <div key={condition} className="rounded-lg border bg-white p-3 text-center text-sm font-medium">
                  {condition}
                </div>
              ))}
            </div>

            <Card className="max-w-7xl mx-auto border-primary/20 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl">Selecciona tu plan</CardTitle>
              </CardHeader>
              <CardContent>
                <PlanSelector onSelectPlan={handleCheckout} loadingPlanId={checkoutPlanId} />
              </CardContent>
            </Card>
            <div className="max-w-5xl mx-auto mt-8">
              <PaymentMethodsCard />
            </div>
          </div>
        </section>

        <section className="pb-16">
          <div className="container mx-auto px-4">
            <Card className="max-w-5xl mx-auto">
              <CardHeader>
                <CardTitle>Incluye en todos los planes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {includeItems.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
