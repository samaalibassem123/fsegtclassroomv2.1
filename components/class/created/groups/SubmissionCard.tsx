import React from "react";
import { DonutChart } from "../../DonutChart";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Course, SubStudentInfoView } from "@/utils/types";
import { formatDate } from "@/utils/date";
import StudentSubCard from "./StudentSubCard";
import { Input } from "@/components/ui/input";
import { getSubOwners } from "@/utils/student";
import { calcTdSubmitPercentage } from "@/utils/TD";


export default async function SubmissionCard({
  Td,
  groupNum
}: {
  Td: Course;
  groupNum:string
 
}) {

  //get td owner submissions
  const tdSubOwners = await getSubOwners(Td.course_id as string, groupNum) as SubStudentInfoView[]
  const percen = await calcTdSubmitPercentage(Td.class_id as string, Td.course_id as string, groupNum)

  

  return (
    <Accordion
      type="single"
      collapsible
      className=" border border-black dark:border-white/50 shadow-md inset-shadow-2xs p-2 rounded-md dark:border "
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="cursor-pointer">
          <div className="p-1 ">
            <h1 className=" text-lg">{Td.course_name}</h1>
            <span className=" p-1 text-sm text-gray-500">
              created at : {formatDate(new Date(Td.created_at as string))}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className=" space-y-2">
          <p className="p-1">{Td.course_descriptions}</p>
          <DonutChart Percentage={percen as number}   />
          <div className="p-2 space-y-3">
              <p className=" underline ">Students Submissions :</p>
                <Input placeholder="search by student name..." />
                <div className="space-y-2.5 group">
                  {tdSubOwners.length ===0?<span className="text-sm p-1 text-gray-600">No work submitted for now 😞</span>:tdSubOwners.map((student:SubStudentInfoView)=>(
                  <StudentSubCard key={student.tdsub_id as string} SubOwner={student} />
                  ))}
                </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
