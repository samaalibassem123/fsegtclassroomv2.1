import React from 'react'
import { Skeleton } from '../ui/skeleton'

export default function SubOwnerLoading() {
  return (
      <div className="flex justify-between gap-1.5 w-full border p-3 rounded-md">
      <Skeleton className="w-[100px] h-[20px]" />
        <Skeleton className="h-2.5 w-[100px]" />
    </div>
  )
}
