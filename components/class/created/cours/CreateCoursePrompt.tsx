"use client";
import React, {
  ButtonHTMLAttributes,
  ReactHTMLElement,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { ComputeFileHash } from "@/utils/Files";

export default function CreateCoursePrompt() {
  const Sumbitref = useRef<HTMLButtonElement>(null);

  const [fileProgess, setProgess] = useState(0);
  const [ProgessText, setProgressText] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setProgess(0);
    setProgressText(
      `0 / ${acceptedFiles.length} files , uploading progress : 0 %`
    );
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const FileUploaderUi = () => {
    return (
      <div>
        <div
          {...getRootProps()}
          className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-[30px] w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            {isDragActive
              ? "Drop the files here..."
              : "Drag and drop some files here, or click to select files"}
          </p>
        </div>
        {files.length > 0 && (
          <div className="mt-4">
            <h4 className="text-lg font-semibold mb-2">Selected Files:</h4>
            <ul className="list-disc pl-5">
              {files.map((file: File) => (
                <li key={file.name} className="text-sm text-gray-600">
                  {file.name} - {(file.size / 1024).toFixed(2)} KB
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  //Add files to file storage in supabase
  useEffect(() => {
    const AddToBuckets = async () => {
      //disable the submit button
      if (Sumbitref.current) {
        Sumbitref.current.disabled = true;
        Sumbitref.current.innerHTML = "Waiting for files...";
      }
      console.log(files.length);
      //Progress By = 100 / number of files
      const ProgressValue = 100 / files.length;

      const supabase = createClient();

      const { data: fileList, error: listError } = await supabase.storage
        .from("uploads")
        .list("uploads/"); // List files at the root of the bucket or specify a folder

      if (listError) {
        toast.error("Error in the server Trey Another Time");
      } else {
        //Add files to bucket sotorage in supabase
        const PromiseUpload = files.map(async (file) => {
          //Hash the file
          const HashCode = await ComputeFileHash(file);
          const filePath = `uploads/${HashCode}_${file.name}`;

          //CHEKC IF THE FILE ALREADY EXIST IN THE BUCKET STORAGE
          const fileExists = fileList.some((f) => {
            console.log(f.name);
            return `uploads/${f.name}` === filePath;
          });
          console.log(fileList);
          console.log(filePath);
          console.log(fileExists);
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
                  Sumbitref.current.innerHTML = "Create";
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
              console.log(publicURL);
            }
          }
        });
      }
    };
    //disabel the submit button

    AddToBuckets();
  }, [files]);

  //CREATE A COURSE
  const HandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <Dialog>
      <DialogTrigger className="flex items-center gap-1 cursor-pointer outline p-2 rounded-md bg-blue-400 text-white hover:cursor-pointer text-sm">
        Create a course <Plus />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new Course</DialogTitle>
          <DialogDescription>
            please fill the fileds to create your course
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={HandleSubmit} className=" space-y-2.5">
          <Label htmlFor="">Course Name 🤔:</Label>
          <Input placeholder="type your course name" required />
          <Label htmlFor="">Course Description 📝:</Label>
          <Textarea placeholder="type your course name" required />
          <Label>
            Documents:<span className=" text-gray-500">(optional)</span>
          </Label>
          {FileUploaderUi()}

          <span className="text-sm text-gray-500 p-1">{ProgessText}</span>
          <Progress value={fileProgess} className="mt-2" />

          <Button ref={Sumbitref} className="w-full cursor-pointer">
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
