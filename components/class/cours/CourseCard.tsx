"use client";
import React, { useActionState, useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CommentContainer from "../CommentContainer";
import { Course, Doc } from "@/utils/types";
import { formatDate } from "@/utils/date";
import { getCourseDocuments } from "@/utils/docs";

import DocLoading from "@/components/skeletons/DocLoading";

import ConfirmDeleteCourse from "./ConfirmDeleteCourse";
import { AddComment } from "@/actions/Courses/AddComment";
import { Send } from "lucide-react";
import { Separator } from "@/components/ui/separator";
const Document = React.lazy(() => import("../Document"));

export default function CourseCard({
  course,
  userRole = "teacher",
}: {
  course: Course;
  userRole?: string;
}) {
  const date = new Date(course.created_at as string);
  const DATE = formatDate(date);
  const [docs, setDocs] = useState<Doc[]>([]);
  //GET DOCUMENTS
  useEffect(() => {
    const GetDocs = async () => {
      const Docs = await getCourseDocuments(course.course_id as string);
      setDocs(Docs as Doc[]);
    };
    GetDocs();
  }, []);

  //ADD a comment
  const [state, action, pending] = useActionState(
    (state: any, formdata: FormData) =>
      AddComment(state, formdata, course?.course_id as string),
    undefined
  );

  return (
    <Accordion
      type="single"
      collapsible
      className="border p-2 rounded-md shadow w-full dark:border-white/40 border-black/40"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className=" cursor-pointer">
          <div className="flex flex-col">
            <span className="font-semibold text-xl capitalize">
              {course.course_name}
            </span>
            <span className="text-gray-500">Created at : {DATE} </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className=" space-y-3">
          <Separator />

          <p className="text-lg">{course.course_descriptions} </p>
          <p className=" font-semibold text-xl">Documents :</p>
          {docs.length === 0 && (
            <span className="text-sm text-gray-500 p-1">
              No Documents Here ∅
            </span>
          )}
          {/* DOCUMENTS */}
          <div className="flex gap-2 flex-col overflow-y-auto group">
            {docs ? (
              docs.map((doc) => (
                <React.Suspense key={doc?.doc_id} fallback={<DocLoading />}>
                  <Document document={doc} key={doc?.doc_id} />
                </React.Suspense>
              ))
            ) : (
              <DocLoading />
            )}
          </div>
          {/* ADD COMMENT */}
          <form
            action={action}
            className="p-1 flex-col flex gap-1 items-center"
          >
            <div className="flex w-full gap-2">
              <Input placeholder="add a comment..." name="comment" required />
              <Button
                className=" cursor-pointer hover:scale-105 focus:scale-95"
                disabled={pending}
              >
                <Send />
              </Button>
            </div>
            {state?.error && (
              <span className="text-sm text-red-400">{state.error}</span>
            )}
          </form>
          <Separator />
          <p className="font-semibold">comments:</p>
          <CommentContainer courseId={course.course_id as string} />
        </AccordionContent>
      </AccordionItem>{" "}
      {userRole === "teacher" && (
        <ConfirmDeleteCourse courseId={course.course_id as string} />
      )}
    </Accordion>
  );
}
