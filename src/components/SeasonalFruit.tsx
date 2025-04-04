
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FruitData {
  name: string
  season: "spring" | "summer" | "fall" | "winter" | "year-round"
  months: number[]
  color: string
}

interface SeasonalFruitProps {
  currentMonth?: number
}

export default function SeasonalFruit({ currentMonth = new Date().getMonth() + 1 }: SeasonalFruitProps) {
  const fruits: FruitData[] = [
    { name: "Fraises", season: "spring", months: [5, 6, 7, 8], color: "#e53e3e" },
    { name: "Framboises", season: "summer", months: [6, 7, 8, 9], color: "#D81B60" },
    { name: "Abricots", season: "summer", months: [6, 7, 8], color: "#ed8936" },
    { name: "Cerises", season: "summer", months: [5, 6, 7], color: "#9b2c2c" },
    { name: "Pêches", season: "summer", months: [6, 7, 8, 9], color: "#f6ad55" },
    { name: "Mûres", season: "summer", months: [8, 9, 10], color: "#2c5282" },
    { name: "Myrtilles", season: "summer", months: [7, 8, 9], color: "#434190" },
    { name: "Prunes", season: "fall", months: [8, 9, 10], color: "#805ad5" },
    { name: "Poires", season: "fall", months: [9, 10, 11, 12], color: "#ecc94b" },
    { name: "Pommes", season: "fall", months: [9, 10, 11, 12, 1], color: "#48bb78" },
    { name: "Oranges", season: "winter", months: [11, 12, 1, 2, 3], color: "#ed8936" },
    { name: "Citrons", season: "year-round", months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], color: "#ecc94b" }
  ]
  
  // Filtrer les fruits disponibles ce mois-ci
  const inSeasonFruits = fruits.filter(fruit => fruit.months.includes(currentMonth))

  return (
    <Card className="overflow-hidden border-border">
      <CardHeader className="bg-jam-honey/10 pb-2">
        <CardTitle className="text-xl font-serif">Fruits de saison</CardTitle>
        <p className="text-sm text-muted-foreground">En {getMonthName(currentMonth)}</p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-2">
          {inSeasonFruits.map(fruit => (
            <span
              key={fruit.name}
              className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5"
              style={{ 
                backgroundColor: `${fruit.color}20`,
                color: fruit.color 
              }}
            >
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: fruit.color }}
              />
              {fruit.name}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function getMonthName(monthNumber: number): string {
  const monthNames = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
  ]
  
  // Ajuster l'index car les mois sont de 1 à 12, mais les tableaux sont indexés de 0 à 11
  return monthNames[((monthNumber - 1) % 12 + 12) % 12]
}
