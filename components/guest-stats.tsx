"use client";

import { useGuests } from "@/lib/guest-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Clock, Heart } from "lucide-react";

export function GuestStats() {
  const {
    totalGuests,
    confirmedGuests,
    pendingGuests,
    declinedGuests,
    noivosGuests,
    noivasGuests,
  } = useGuests();

  const stats = [
    {
      title: "Total de Convidados",
      value: totalGuests,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Confirmados",
      value: confirmedGuests,
      icon: UserCheck,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      title: "Pendentes",
      value: pendingGuests,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      title: "Recusados",
      value: declinedGuests,
      icon: UserX,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/30",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Convidados do Noivo
            </CardTitle>
            <div className="rounded-full bg-blue-50 p-2 dark:bg-blue-950/30">
              <Heart className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{noivosGuests}</div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Convidados da Noiva
            </CardTitle>
            <div className="rounded-full bg-pink-50 p-2 dark:bg-pink-950/30">
              <Heart className="h-4 w-4 text-pink-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{noivasGuests}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
