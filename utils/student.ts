"use server"

import { User } from "@supabase/supabase-js";


import { createClient } from "./supabase/server";
import { Student } from "./types";

export const AddStudent = async(user:User|null)=>{

    const supabase = await createClient();
    await supabase.from("student").insert([
        {
            student_id:user?.id as string,
            student_name:user?.user_metadata.full_name as string,
            student_mail:user?.email as string,
            studentImg:user?.user_metadata.avatar_url as string
        }
    ])
}

export const GetStudentById = async (StudentId:string)=>{
    const supabase = await createClient();
    const student = await supabase.from("Student_info").select("*").eq("student_id", StudentId).single()
    
    if(student){
        return student
    }
    return null
}



export const GetStudents = async (classId: string | null)=>{

    const supabase = await createClient();
    //Get the id of the students that joined the class
    const {data} = await supabase.from("Student_info").select("*").eq("class_id",classId );
    console.log(data)
    if(data){
        return data as Student[]
    }
    return null

}