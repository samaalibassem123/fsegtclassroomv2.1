"use client";
import TextHover from "@/components/animations/TextHover";
import { AvatarIcon } from "@/components/AvatarIcon";
import { formatDate } from "@/utils/date";
import { SubStudentInfoView } from "@/utils/types";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function StudentSubCard({ SubOwner }: { SubOwner: SubStudentInfoView }) {
  const pathname = usePathname();
  const date = new Date(SubOwner.created_at as string)
  const DATE = formatDate(date)
  return (
    
    <Link
      href={`${pathname}/${SubOwner.tdsub_id as string}`}
      className="border w-full group-hover:scale-99 group-hover:opacity-75 hover:opacity-100 hover:scale-100 transition-all hover:shadow-md  p-3 rounded-md flex items-center  gap-2  justify-between"
    >
      <TextHover text={SubOwner.student_mail as string}>
      <div className="flex items-center gap-1.5">
        <AvatarIcon img={SubOwner.studentImg as string} />
        <p className="text-md">{SubOwner.student_name}</p>
        <span className="text-sm text-gray-500">{DATE}</span>
      </div>
      </TextHover>
      <div className="flex items-start gap-1.5">
        <span className="text-sm text-gray-500 underline">
          See The Work
        </span>
        <MoveRight />
      </div>
    </Link>
  );
}
