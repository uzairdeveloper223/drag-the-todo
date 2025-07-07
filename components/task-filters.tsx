"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, Calendar } from "lucide-react"

interface TaskFiltersProps {
  filter: "all" | "pending" | "completed"
  onFilterChange: (filter: "all" | "pending" | "completed") => void
  taskCounts: {
    all: number
    pending: number
    completed: number
  }
}

export default function TaskFilters({ filter, onFilterChange, taskCounts }: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={filter === "all" ? "default" : "outline"}
        onClick={() => onFilterChange("all")}
        className="flex items-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        All Tasks
        <Badge variant="secondary" className="ml-1">
          {taskCounts.all}
        </Badge>
      </Button>

      <Button
        variant={filter === "pending" ? "default" : "outline"}
        onClick={() => onFilterChange("pending")}
        className="flex items-center gap-2"
      >
        <Circle className="w-4 h-4" />
        Pending
        <Badge variant="secondary" className="ml-1">
          {taskCounts.pending}
        </Badge>
      </Button>

      <Button
        variant={filter === "completed" ? "default" : "outline"}
        onClick={() => onFilterChange("completed")}
        className="flex items-center gap-2"
      >
        <CheckCircle className="w-4 h-4" />
        Completed
        <Badge variant="secondary" className="ml-1">
          {taskCounts.completed}
        </Badge>
      </Button>
    </div>
  )
}
