"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Loader2 } from "lucide-react";
import {
  PLAN_MODALITY_META,
  type PlanModality,
  getPlansByModality,
} from "@/lib/plan-catalog";
import { formatPrice } from "@/lib/data";

interface PlanSelectorProps {
  onSelectPlan: (planId: string) => void;
  loadingPlanId: string | null;
  buttonLabel?: string;
  compact?: boolean;
}

const MODALITIES: PlanModality[] = [
  "individual",
  "semi_private_2",
  "group_3",
  "group_4",
  "flexible_1x",
];

export function PlanSelector({
  onSelectPlan,
  loadingPlanId,
  buttonLabel = "Pagar con Mercado Pago",
  compact = false,
}: PlanSelectorProps) {
  return (
    <Tabs defaultValue="individual" className="w-full gap-5">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-1 bg-muted/70 p-1">
        {MODALITIES.map((modality) => (
          <TabsTrigger
            key={modality}
            value={modality}
            className="min-h-10 text-xs md:text-sm px-2 text-center"
          >
            {PLAN_MODALITY_META[modality].title}
          </TabsTrigger>
        ))}
      </TabsList>

      {MODALITIES.map((modality) => {
        const plans = getPlansByModality(modality);
        const meta = PLAN_MODALITY_META[modality];

        return (
          <TabsContent key={modality} value={modality} className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-semibold">{meta.title}</h3>
                <p className="text-sm text-muted-foreground">{meta.subtitle}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {meta.badge}
              </Badge>
            </div>

            <div className={`grid gap-4 ${compact ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-4"}`}>
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden border transition-shadow hover:shadow-md ${
                    plan.popular ? "border-primary shadow-sm" : "border-border"
                  }`}
                >
                  {plan.popular ? (
                    <Badge className="absolute right-3 top-3 bg-primary">Recomendado</Badge>
                  ) : null}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{plan.durationMonths} mes{plan.durationMonths > 1 ? "es" : ""}</CardTitle>
                    <CardDescription>{plan.totalClasses} clases totales</CardDescription>
                    <div className="pt-1">
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(plan.price, plan.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {plan.sessionsPerWeek} sesi\u00f3n{plan.sessionsPerWeek > 1 ? "es" : ""} por semana · 60 min
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {plan.features.slice(0, 2).map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Check className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => onSelectPlan(plan.id)}
                      disabled={loadingPlanId !== null}
                    >
                      {loadingPlanId === plan.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Redirigiendo...
                        </>
                      ) : (
                        buttonLabel
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
