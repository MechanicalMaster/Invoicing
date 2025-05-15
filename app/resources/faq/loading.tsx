import { Loader2 } from "lucide-react"

export default function FAQLoading() {
  return (
    <div className="flex min-h-[300px] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
    </div>
  )
}