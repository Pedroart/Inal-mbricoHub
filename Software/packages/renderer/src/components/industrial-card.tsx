import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import type { ReactNode } from "react"

interface IndustrialCardProps {
  title: string
  children: ReactNode
  className?: string
}

export function IndustrialCard({ title, children, className = "" }: IndustrialCardProps) {
  return (
    <Card
      className={`bg-[#272a32] border border-[#343841] rounded-lg shadow-md hover:shadow-lg transition-shadow ${className}`}
    >
      <CardHeader className="pb-3 border-b border-[#343841]">
        <CardTitle className="text-sm font-mono tracking-wider uppercase text-white">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3 text-white">
        {children}
      </CardContent>
    </Card>
  )
}
