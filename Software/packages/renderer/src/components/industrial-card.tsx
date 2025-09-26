import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

interface IndustrialCardProps {
  title: string
  children: ReactNode
  className?: string
}

export function IndustrialCard({ title, children, className = "" }: IndustrialCardProps) {
  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-mono tracking-wider uppercase text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  )
}
