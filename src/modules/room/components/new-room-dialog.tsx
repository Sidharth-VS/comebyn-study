import { ResponsiveDialog } from "@/src/components/responsive-dialog"
import { CreateRoomForm } from "./create-room-form"

interface NewRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRoomCreated?: (room: any) => void
  userId: string,
}

export const NewRoomDialog = ({ open, onOpenChange, onRoomCreated, userId }: NewRoomDialogProps) => {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create Study Room"
      description="Fill in the details below to create a new study room."
    >
      <CreateRoomForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
        onRoomCreated={onRoomCreated}
        userId={userId}
      />
    </ResponsiveDialog>
  )
}
