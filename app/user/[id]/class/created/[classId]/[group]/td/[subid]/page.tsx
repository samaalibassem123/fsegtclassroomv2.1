import Document from "@/components/class/Document";
import { SubStudentTable } from "@/components/class/SubStudentTable";
import { getSubDocs } from "@/utils/docs";
import { getSubOwner, getSubStudents } from "@/utils/student";
import { Doc, Student, SubStudentInfoView } from "@/utils/types";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";


export default async function page({
  params,
}: {
  params: Promise<{ subid: string }>;
}) {
  const doc: Doc = {
    doc_name: "test",
    doc_url: "test",
  };
  const { subid } = await params;
  //get the subOwner
  const subOwner = (await getSubOwner(subid)) as SubStudentInfoView[];
  //get students that helped in this project
  const Students = (await getSubStudents(subid)) as SubStudentInfoView[];
  //get docs
  const docs = (await getSubDocs(subid)) as Doc[];
  return (
    <div className="flex flex-col p-2 gap-3">
      <p className="text-lg underline">Submission Owner :</p>
      <SubStudentTable data={subOwner as Student[]} />
      {/*GET Students that help in this project */}
      <p className="text-lg ">
        Others :{" "}
        <span className="text-sm text-gray-600 -underline-offset-0">
          (students that helped in this submission)
        </span>
      </p>
      <SubStudentTable data={Students as Student[]} />
      <div></div>
      <div className="p-1 flex flex-col gap-3">
        <p className="text-lg  underline">Description:</p>
        {subOwner[0].descrption === "" ? (
          <p className="text-sm text-gray-500">there is no description</p>
        ) : (
          subOwner[0].descrption
        )}
        <p className="text-lg underline">Documents:</p>
        <div className="flex flex-col gap-3 group">
          {docs.map((doc) => (
            <Document key={doc.doc_id} document={doc} />
          ))}
        </div>
      </div>
      <Separator/>
      {/*Submit note */}
      <form className=" flex flex-col items-center justify-center p-5 gap-5">
        <p>Note / 20</p>
        <InputOTP maxLength={4}>
          <InputOTPGroup>
            <InputOTPSlot index={0}/>
            <InputOTPSlot index={1} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
          </InputOTPGroup>
        </InputOTP>
        <Button className=" cursor-pointer" type="submit">Submit</Button>
      </form>
    </div>
  );
}
