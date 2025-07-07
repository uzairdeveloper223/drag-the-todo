"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { supabase, type Task } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LogOut, User } from "lucide-react"
import TaskItem from "./task-item"
import AddTaskForm from "./add-task-form"
import TaskFilters from "./task-filters"
import { useToast } from "@/hooks/use-toast"

interface TaskDashboardProps {
  user: any
}

export default function TaskDashboard({ user }: TaskDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase.from("tasks").select("*").order("order_index", { ascending: true })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (taskData: Omit<Task, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      const maxOrder = Math.max(...tasks.map((t) => t.order_index), -1)
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            ...taskData,
            user_id: user.id,
            order_index: maxOrder + 1,
          },
        ])
        .select()
        .single()

      if (error) throw error
      setTasks([...tasks, data])
      toast({
        title: "Success",
        description: "Task added successfully",
      })
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      })
    }
  }

  const updateTask = async (updatedTask: Task) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: updatedTask.title,
          description: updatedTask.description,
          due_date: updatedTask.due_date,
          completed: updatedTask.completed,
        })
        .eq("id", updatedTask.id)

      if (error) throw error
      setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)))
      toast({
        title: "Success",
        description: "Task updated successfully",
      })
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    }
  }

  const toggleTaskComplete = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase.from("tasks").update({ completed }).eq("id", id)

      if (error) throw error
      setTasks(tasks.map((t) => (t.id === id ? { ...t, completed } : t)))
    } catch (error) {
      console.error("Error toggling task:", error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id)

      if (error) throw error
      setTasks(tasks.filter((t) => t.id !== id))
      toast({
        title: "Success",
        description: "Task deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = tasks.findIndex((t) => t.id === active.id)
    const newIndex = tasks.findIndex((t) => t.id === over.id)

    const newTasks = arrayMove(tasks, oldIndex, newIndex)
    setTasks(newTasks)

    // Update order in database
    try {
      const updates = newTasks.map((task, index) => ({
        id: task.id,
        order_index: index,
      }))

      for (const update of updates) {
        await supabase.from("tasks").update({ order_index: update.order_index }).eq("id", update.id)
      }
    } catch (error) {
      console.error("Error updating task order:", error)
      // Revert on error
      fetchTasks()
      toast({
        title: "Error",
        description: "Failed to update task order",
        variant: "destructive",
      })
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.completed
    if (filter === "completed") return task.completed
    return true
  })

  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">TaskFlow</h1>
            <p className="text-gray-600 mt-1">Organize your tasks with drag & drop</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              {user.email}
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Add Task Form */}
        <AddTaskForm
          onAddTask={addTask}
          editingTask={editingTask}
          onUpdateTask={updateTask}
          onCancelEdit={() => setEditingTask(null)}
        />

        {/* Filters */}
        <TaskFilters filter={filter} onFilterChange={setFilter} taskCounts={taskCounts} />

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 text-lg">
                {filter === "all"
                  ? "No tasks yet. Add your first task!"
                  : filter === "pending"
                    ? "No pending tasks. Great job!"
                    : "No completed tasks yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext items={filteredTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={toggleTaskComplete}
                    onDelete={deleteTask}
                    onEdit={setEditingTask}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
