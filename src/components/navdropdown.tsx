"use client"

import { FiHome, FiMenu, FiUsers, FiBookOpen, FiSettings, FiUser } from "react-icons/fi"
import { motion } from "framer-motion"
import { type Dispatch, type SetStateAction, useState } from "react"
import type { IconType } from "react-icons"
import Link from "next/link"

const StaggeredDropDown = () => {
  const [open, setOpen] = useState(false)

  return (
    <motion.div animate={open ? "open" : "closed"} className="relative">
      <button
        onClick={() => setOpen((pv) => !pv)}
        className="flex items-center justify-center p-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-color"
      >
        <motion.span variants={iconVariants}>
          <FiMenu className="w-5 h-5" />
        </motion.span>
      </button>

      <motion.ul
        initial={wrapperVariants.closed}
        variants={wrapperVariants}
        style={{ originY: "top", translateX: "0%" }}
        className="flex flex-col gap-1 p-2 rounded-lg bg-white shadow-xl absolute top-[120%] left-0 w-48 overflow-hidden border border-gray-200 z-50"
      >
        <Option setOpen={setOpen} Icon={FiUsers} text="Study Rooms" href="/" />
        <Option setOpen={setOpen} Icon={FiBookOpen} text="Summarize PDF" href="/summarize" />
        <Option setOpen={setOpen} Icon={FiSettings} text="Settings" href="/" />
      </motion.ul>
    </motion.div>
  )
}

const Option = ({
  text,
  Icon,
  setOpen,
  href,
}: {
  text: string
  Icon: IconType
  setOpen: Dispatch<SetStateAction<boolean>>
  href: string
}) => {
  return (
    <motion.li variants={itemVariants}>
      <Link href={href}>
        <div
          onClick={() => setOpen(false)}
          className="flex items-center gap-4 w-full p-4 text-base font-medium whitespace-nowrap rounded-md hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <motion.span variants={actionIconVariants} className="text-lg">
            <Icon />
          </motion.span>
          <span>{text}</span>
        </div>
      </Link>
    </motion.li>
  )
}

export default StaggeredDropDown

const wrapperVariants = {
  open: {
    scaleY: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  closed: {
    scaleY: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.1,
    },
  },
}

const iconVariants = {
  open: { rotate: 180 },
  closed: { rotate: 0 },
}

const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
    },
  },
  closed: {
    opacity: 0,
    y: -15,
    transition: {
      when: "afterChildren",
    },
  },
}

const actionIconVariants = {
  open: { scale: 1, y: 0 },
  closed: { scale: 0, y: -7 },
}