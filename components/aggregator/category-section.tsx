import { ResourceCard } from "@/components/aggregator/resource-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Resource = {
  name: string
  url: string
  description: string
}

interface CategorySectionProps {
  category: string
  resources: Resource[]
}

export function CategorySection({ category, resources }: CategorySectionProps) {
  return (
    <Card className="overflow-hidden border-none shadow-md transition-all duration-200 hover:shadow-lg w-full">
      <CardHeader className="bg-muted/10 pb-3">
        <CardTitle className="text-lg md:text-xl font-semibold break-words">{category}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 w-full">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.name}
              name={resource.name}
              url={resource.url}
              description={resource.description}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

