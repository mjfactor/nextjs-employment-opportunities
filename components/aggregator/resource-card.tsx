import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLinkIcon } from "lucide-react"

interface ResourceCardProps {
  name: string
  url: string
  description: string
}

export function ResourceCard({ name, url, description }: ResourceCardProps) {
  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md border-none bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2 bg-muted/5">
        <CardTitle className="text-lg font-medium line-clamp-1">{name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pt-3">
        <CardDescription className="line-clamp-3 text-sm">{description}</CardDescription>
      </CardContent>
      <CardFooter className="pt-2 pb-3">
        <Button
          variant="outline"
          className="w-full group transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
          asChild
        >
          <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
            Visit
            <ExternalLinkIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}

