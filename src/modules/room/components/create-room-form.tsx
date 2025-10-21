"use client"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/src/components/ui/form'
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { createRoomSchema } from "../schemas"
import { Button } from "@/src/components/ui/button"
import { createRoom } from "@/src/services/roomServices"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { useState } from "react"
import { useToast } from '@/src/components/ui/use-toast'
import { user } from '@/src/db/schema'

interface RoomFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  onRoomCreated?: (room: any) => void
  userId: string
}

export const CreateRoomForm = ({ onSuccess, onCancel, onRoomCreated, userId }: RoomFormProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof createRoomSchema>>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      subject: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof createRoomSchema>) => {
    setIsLoading(true)
    try {
      const newRoom = {
        name: values.name,
        description: values.description,
        category: values.category,
        subject: values.subject,
        user_id: userId,
      }
      const response = await createRoom(newRoom)

      if (response.success !== false) {
        toast({
          title: "Success",
          description: "Study room created successfully!",
        })
        form.reset()
        onRoomCreated?.(newRoom)
        onSuccess?.()
      } else {
        throw new Error(response.error || "Failed to create room")
      }
    } catch (error) {
      console.error("Error creating room:", error)
      toast({
        title: "Error",
        description: "Failed to create study room. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter room name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="category"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Literature">Literature</SelectItem>
                    <SelectItem value="Languages">Languages</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="subject"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter specific subject" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="description"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="Describe what this study room is for" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between gap-x-2">
            {onCancel && (
              <Button variant="ghost" disabled={isLoading} type="button" onClick={() => onCancel()}>
                Cancel
              </Button>
            )}
            <Button disabled={isLoading} className='bg-green-600 hover:bg-green-700' type="submit">
              {isLoading ? "Creating..." : "Create Room"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}