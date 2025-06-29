"use client";
import React, { useActionState, useEffect, useRef, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { FileUploader } from "../FileUploader";

import { SelectStudents } from "./SelectStudents";
import { ArrowDownToLine } from "lucide-react";
import { Doc, Student } from "@/utils/types";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { GetGroupStudents, GetStudents } from "@/utils/student";
import { GetUser } from "@/utils/getuser";
import { User } from "@supabase/supabase-js";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { ComputeFileHash } from "@/utils/Files";
import { SubmitWork } from "@/actions/Courses/SubmitWork";

export default function SubmissionForm({
  tdId,
  classId,
}: {
  tdId: string;
  classId: string;
}) {
  //HANLE FILES
  const [files, setFiles] = useState<File[]>([]);
  const Sumbitref = useRef<HTMLButtonElement>(null);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [fileProgess, setProgess] = useState(0);
  const [ProgessText, setProgressText] = useState("");

  const HandleFilesData = (data: File[]) => {
    setFiles(data);
    //Initializing the defualt values
    setProgess(0);
    setProgressText("");
  };
  //Add files to file storage in supabase
  useEffect(() => {
    const AddToBuckets = async () => {
      //disable the submit button
      if (Sumbitref.current) {
        Sumbitref.current.disabled = true;
        Sumbitref.current.innerHTML = "Waiting for files...";
      }
      //Progress By = 100 / number of files
      const ProgressValue = 100 / files.length;

      const supabase = createClient();

      const { data: fileList, error: listError } = await supabase.storage
        .from("uploads")
        .list("uploads/"); // List files at the root of the bucket or specify a folder

      if (listError) {
        toast.error(
          "Error in the server Trey Another Time Or refresh the page",
          {
            duration: Infinity,
          }
        );
      } else {
        //Add files to bucket sotorage in supabase
        const PromiseUpload = files.map(async (file) => {
          //Hash the file
          const HashCode = await ComputeFileHash(file);
          const filePath = `uploads/${HashCode}_${file.name}`;

          //CHEKC IF THE FILE ALREADY EXIST IN THE BUCKET STORAGE
          const fileExists = fileList.some((f) => {
            return `uploads/${f.name}` === filePath;
          });
          if (fileExists) {
            //Update the progess bar and ignore the uploading
            setProgess((fileProgess) => {
              const progress = fileProgess + ProgressValue;
              //Number of files updated
              const nbFiles = Math.floor((progress * files.length) / 100);

              setProgressText(
                `${nbFiles} / ${
                  files.length
                } files , uploading progress : ${Math.floor(progress)} %`
              );

              if (Sumbitref.current && progress == 100) {
                Sumbitref.current.disabled = false;
                Sumbitref.current.innerHTML = "submit";
              }
              return progress;
            });

            const {
              data: { publicUrl: publicURL },
            } = supabase.storage.from("uploads").getPublicUrl(filePath);
            toast.success(`${file.name} installed succefully`, {
              position: "top-center",
              style: { background: "#4CAF50", color: "#fff", border: "none" },
            });

            const document: Doc = {
              doc_name: file.name as string,
              doc_url: publicURL as string,
              hash_value: HashCode as string,
            };
            setDocuments((prevDocument) => [...prevDocument, document]);
          } else {
            //first we need to add the file to the storage of supbase
            const { error } = await supabase.storage
              .from("uploads")
              .upload(filePath, file, { upsert: false });

            if (error) {
              console.log(error.message);
              toast.error(
                "Eroor in uploading file : " + filePath + " " + error.message,
                {
                  position: "top-center",
                }
              );
              if (Sumbitref.current) {
                Sumbitref.current.disabled = false;
                Sumbitref.current.innerHTML = "submit";
              }
            } else {
              //Update the progess bar
              setProgess((fileProgess) => {
                const progress = fileProgess + ProgressValue;
                //Number of files updated
                const nbFiles = Math.floor((progress * files.length) / 100);

                setProgressText(
                  `${nbFiles} / ${
                    files.length
                  } files , uploading progress : ${Math.floor(progress)} %`
                );

                if (Sumbitref.current && progress == 100) {
                  Sumbitref.current.disabled = false;
                  Sumbitref.current.innerHTML = "submit";
                }
                return progress;
              });

              //if there is no error in the installation of the file in the storage bucket of supabase
              // then we can get  the url and install the file to the documents table
              const {
                data: { publicUrl: publicURL },
              } = supabase.storage.from("uploads").getPublicUrl(filePath);
              toast.success(`${file.name} installed succefully`, {
                position: "top-center",
                style: { background: "#4CAF50", color: "#fff", border: "none" },
              });

              const document: Doc = {
                doc_name: file.name as string,
                doc_url: publicURL as string,
                hash_value: HashCode as string,
              };
              console.log(document);
              setDocuments((prevDocument) => [...prevDocument, document]);
            }
          }
        });
      }
    };
    //disabel the submit button

    AddToBuckets();
  }, [files]);

  //GET STUDENTS
  const [students, setStudents] = useState<Student[]>([]);
  const [user, setUser] = useState<User>();
  const [SelectedStudents, setSelectedStutends] = useState<Student[]>([]);
  const [StdLoading, setStdLoading] = useState(true);

  const HandleSelectedStudents = (data: Student[]) => {
    console.log(data);
    setSelectedStutends(data);
  };
  useEffect(() => {
    const getStds = async () => {
      const Students = await GetGroupStudents(classId, tdId);
      setStudents(Students as Student[]);
      setStdLoading(false);
    };
    const getuser = async () => {
      const USER = await GetUser();
      if (USER) {
        setUser(USER);
      }
    };
    getStds();
    getuser();
  }, []);

  //SUBMIT WORK
  const [state, action, pending] = useActionState(
    (state: any, formdata: FormData) =>
      SubmitWork(state, formdata, documents, SelectedStudents, tdId, classId),
    undefined
  );

  useEffect(() => {
    if (state?.warning) {
      toast.warning(state.warning, {
        position: "top-center",
        style: { backgroundColor: "#e6e600", color: "white" },
      });
    } else if (state?.succes) {
      toast.success(state.succes, {
        position: "top-center",
        style: { backgroundColor: "green", color: "white" },
      });
      window.location.reload();
    }
  }, [state]);

  return (
    <Drawer>
      <DrawerTrigger className="text-sm flex items-center gap-1.5 item border   my-2 p-1 px-3 rounded-md cursor-pointer hover:scale-102 focus:scale-98 transition-all hover:bg-black dark:hover:bg-white dark:hover:text-black hover:text-white">
        Submit Your Work
        <ArrowDownToLine />
      </DrawerTrigger>

      <DrawerContent className="p-5 h-[80vh] ">
        <DrawerHeader>
          <DrawerTitle>Work submition🎖️</DrawerTitle>
          <DrawerDescription>Please Fill those filds ✏️</DrawerDescription>
          <Separator />
        </DrawerHeader>
        <form action={action} className="h-[80svh] overflow-y-scroll space-y-4">
          <div className="flex flex-col gap-2 m-2 ">
            <Label className="text-lg">📚 Document :</Label>
            <FileUploader sendFiles={HandleFilesData} />
            <span className="text-sm text-gray-500 p-1">{ProgessText}</span>
            <Progress value={fileProgess} className="mt-2" />
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <Label className="text-lg">
              Description:
              <span className="text-sm text-gray-600 animate-pulse">
                (optional)
              </span>
            </Label>
            <Textarea
              name="desc"
              placeholder="Add A description for your submission if u want"
            />
          </div>
          <Separator />
          <div className="flex flex-col gap-2 w-full">
            <Label className="text-xl ">
              Add Students that worked with you in this project:
              <span className="text-sm text-gray-600 animate-pulse">
                (optional)
              </span>
            </Label>
            {students.length === 1 ? (
              "There is no students for this Td that u can select"
            ) : (
                StdLoading?<span className="text-sm animate-pulse text-gray-500">Loading Students...</span> :
              <SelectStudents
                sendStudents={HandleSelectedStudents}
                people={students}
                user={user as User}
              />
            )}
          </div>
          <Separator />{" "}
          <DrawerFooter className="border-t-black/40 border-t-[1px]">
            <Button
              disabled={pending}
              className=" cursor-pointer"
              ref={Sumbitref}
            >
              {pending ? (
                <span className=" animate-pulse">Submitting ...</span>
              ) : (
                "submit"
              )}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
