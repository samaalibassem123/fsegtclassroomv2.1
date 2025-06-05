"use client";
import React, { useEffect, useRef, useState } from "react";
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
import { GetStudents } from "@/utils/student";
import { GetUser } from "@/utils/getuser";
import { User } from "@supabase/supabase-js";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { ComputeFileHash } from "@/utils/Files";





export default function SubmissionForm({ tdId }: { tdId: string }) {
  //HANLE FILES
  const [files, setFiles] = useState<File[]>([]);
    const Sumbitref = useRef<HTMLButtonElement>(null);
    const [documents, setDocuments] = useState<Doc[]>([]);
    const [fileProgess, setProgess] = useState(0);
    const [ProgessText, setProgressText] = useState("");
    
  const HandleFilesData = (data:File[])=>{
    setFiles(data)
     //Initializing the defualt values
    setProgess(0)
    setProgressText("")
  }
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
                Sumbitref.current.innerHTML = "Create";
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
              )
               if (Sumbitref.current) {
                  Sumbitref.current.disabled = false;
                  Sumbitref.current.innerHTML = "submit";
                };
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
  
  const HandleSelectedStudents = (data:Student[])=>{
    console.log(data)
    setSelectedStutends(data)
  }
  useEffect(() => {
    const getStds = async () => {
      const Students = await GetStudents(tdId);

      setStudents(Students as Student[]);
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

  return (
    <Drawer>
      <DrawerTrigger className="text-sm flex items-center gap-1.5 item border   my-2 p-1 px-3 rounded-md cursor-pointer hover:scale-102 focus:scale-98 transition-all hover:bg-black dark:hover:bg-white dark:hover:text-black hover:text-white">
        Submit Your Work
        <ArrowDownToLine />
      </DrawerTrigger>

      <DrawerContent className="p-5">
        <DrawerHeader>
          <DrawerTitle>Work submition🎖️</DrawerTitle>
          <DrawerDescription>Please Fill those filds ✏️</DrawerDescription>
          <Separator />
        </DrawerHeader>
        <form className="h-[40svh] overflow-y-scroll">
          <div className="flex flex-col gap-2 m-2 ">
            <Label className="text-lg">📚 Document :</Label>
            <FileUploader sendFiles={HandleFilesData}/>
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
            <Textarea placeholder="Add A description for your submission if u want" />
          </div>
          <Separator />

          <div className="flex flex-col gap-2 w-full">
            <Label className="text-xl ">
              Add Persons that worked with you in this project:
              <span className="text-sm text-gray-600 animate-pulse">
                (optional)
              </span>
            </Label>
            {students.length === 0 ? (
              "There is no students in this class"
            ) : (
              <SelectStudents sendStudents={HandleSelectedStudents} people={students} user={user as User} />
            )}
          </div>
          <Separator />
        </form>
        <DrawerFooter className="border-t-black/40 border-t-[1px]">
          <Button className="" ref={Sumbitref}>Submit</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
