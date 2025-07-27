import { Suspense } from "react"
import ItemsContent from "./ItemsContent"
import { Loader2 } from "lucide-react"

export default function ItemsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      }
    >
      <ItemsContent />
    </Suspense>
  )
}