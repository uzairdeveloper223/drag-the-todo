"use client"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, GripVertical, Trash2, Edit } from "lucide-react"
import type { Task } from "@/lib/supabase"
import { format, isToday, isTomorrow, isPast } from "date-fns"

interface TaskItemProps {
  task: Task
  onToggleComplete: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
}

export default function TaskItem({ task, onToggleComplete, onDelete, onEdit }: TaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getDueDateBadge = () => {
    if (!task.due_date) return null

    const dueDate = new Date(task.due_date)
    const isPastDue = isPast(dueDate) && !isToday(dueDate)

    let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
    let text = format(dueDate, "MMM d")

    if (isToday(dueDate)) {
      variant = "default"
      text = "Today"
    } else if (isTomorrow(dueDate)) {
      variant = "secondary"
      text = "Tomorrow"
    } else if (isPastDue) {
      variant = "destructive"
      text = `Overdue (${format(dueDate, "MMM d")})`
    }

    return (
      <Badge variant={variant} className="text-xs">
        <Calendar className="w-3 h-3 mr-1" />
        {text}
      </Badge>
    )
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all duration-200 ${
        isDragging ? "opacity-50 rotate-2 shadow-lg" : "hover:shadow-md"
      } ${task.completed ? "opacity-75" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button
            className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <Checkbox
            checked={task.completed}
            onCheckedChange={(checked) => onToggleComplete(task.id, checked as boolean)}
            className="mt-1"
          />

          <div className="flex-1 min-w-0">
            <h3 className={`font-medium text-sm ${task.completed ? "line-through text-gray-500" : ""}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`text-xs text-gray-600 mt-1 ${task.completed ? "line-through" : ""}`}>{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">{getDueDateBadge()}</div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(task)} className="h-8 w-8 p-0">
              <Edit className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
