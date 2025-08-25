import { BookOpen } from "lucide-react"
import { cn } from "@/src/lib/utils"

type Props = {
  size?: number
  className?: string
}

export function SiteLogo({ size = 22, className = "" }: Props) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span aria-hidden="true" className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600">
        <BookOpen className="h-5 w-5 text-white" />
      </span>
      <span className="sr-only">StudyRooms</span>
    </span>
  )
}
