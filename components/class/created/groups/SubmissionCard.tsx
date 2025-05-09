import React from "react";
import { DonutChart } from "../../DonutChart";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Course } from "@/utils/types";
import { formatDate } from "@/utils/date";
import StudentSubCard from "./StudentSubCard";
import { Input } from "@/components/ui/input";
import GroupSubCard from "./GroupSubCard";

export default function SubmissionCard({
  Td,
  tdType = "alone",
}: {
  Td: Course;
  tdType?: string;
}) {
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
          <DonutChart />
          <div className="p-2 space-y-3">
            {tdType === "alone" ? (
              <p className=" underline ">Students Submissions :</p>
            ) : (
              <p className=" underline ">Group Submissions :</p>
            )}

            {tdType === "alone" ? (
              <>
                <Input placeholder="search by student name..." />
                <div className="space-y-2.5 group">
                  <StudentSubCard tdsubId="test" />
                  <StudentSubCard tdsubId="test" />
                  <StudentSubCard tdsubId="tes" />
                </div>
              </>
            ) : (
              <>
                <Input placeholder="search by group name..." />
                <div className="space-y-2.5 group">
                  <GroupSubCard tdsubId="tes" />
                  <GroupSubCard tdsubId="tes" />
                  <GroupSubCard tdsubId="tes" />
                </div>
              </>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
