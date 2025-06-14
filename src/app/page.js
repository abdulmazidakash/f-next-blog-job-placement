import React from 'react'
import { Button } from "flowbite-react";

export default function page() {
  return (
      <div className="flex flex-wrap gap-2">
      <Button className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white hover:bg-gradient-to-br focus:ring-blue-300 dark:focus:ring-blue-800">
        Blue
      </Button>
       <Button className="bg-gradient-to-r from-lime-200 via-lime-400 to-lime-500 text-gray-900 hover:bg-gradient-to-br focus:ring-lime-300 dark:focus:ring-lime-800">Lime</Button>
    </div>
  )
}
