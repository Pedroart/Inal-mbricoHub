import { useState } from "react"
import Keyboard from "react-simple-keyboard"
import "react-simple-keyboard/build/css/index.css"
import "./keyboard-dark.css"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"
import { Input } from "../ui/input"


type Props = {
  open: boolean
  initialValue?: string
  title?: string
  onClose: () => void
  onSubmit: (value: string) => void
}

export function OnScreenKeyboardDialog({
  open,
  initialValue = "",
  title = "Ingresar texto",
  onClose,
  onSubmit,
}: Props) {
  const [value, setValue] = useState(initialValue)

  const handleSave = () => {
    onSubmit(value)
    onClose()
  }

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent className="bg-[#1b1d23] text-white border border-[#343841] max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-3">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)} // <- captura lo que escribas a mano
            className="w-full rounded-md border border-[#343841] bg-[#1b1d23] text-white"
          />
          <Keyboard
            onChange={setValue}
            onKeyPress={(button) => {
              if (button === "{bksp}") {
                setValue((prev) => prev.slice(0, -1))  // borra el último carácter
              }
              if (button === "{space}") {
                setValue((prev) => prev + " ")         // agrega espacio
              }
            }}
            theme={"hg-theme-default myTheme"}
            layout={{
              default: [
                "1 2 3 4 5 6 7 8 9 0",
                "q w e r t y u i o p",
                "a s d f g h j k l",
                "z x c v b n m",
                "{space} {bksp}",
              ],
            }}
            display={{
              "{bksp}": "⌫",
              "{space}": "␣",
            }}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="bg-[#272a32] border border-[#343841] text-white">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSave}
            className="bg-[#1e77e5] hover:bg-[#1b6bd0] text-white"
          >
            Guardar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
