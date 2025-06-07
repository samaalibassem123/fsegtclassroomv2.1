"use server"

import { addDocument, findDocByHashCode } from "@/utils/docs"
import { GetUser } from "@/utils/getuser"
import { createClient } from "@/utils/supabase/server"
import { Doc, Student, TdSub } from "@/utils/types"
import { z } from "zod"

const descString = z.string().min(5).trim()

export const SubmitWork =async (state:any, formData:FormData, documents:Doc[],selectedStudents:Student[],tdId:string, classId:string)=>{

    const supabase = await createClient();

    const Desc = formData.get("desc")



    if(documents.length ===0){
        return {warning:"You need to add Documents !"}
    }
    const validDesc = descString.safeParse(Desc)
    if(Desc != "" && validDesc.error){
        return {warning:"Description need to have at least 5 letters"}
    }

    //GET GROUPID from the student-info view  with classid and student id
    const user = await GetUser()
    const {data:{group_id}} =  await supabase.from("Student_info").select("*").eq("class_id", classId).eq("student_id", user?.id).single() 

    //FIRST WE CREATE THE TDSUBMISSION
    const {data, error} = await supabase.from("TdSubmission").insert([{
        group_id:group_id as string,
        td_id:tdId as string,
        descrption:Desc as string,
        
    }]).select() 
    if(error){
        return {error:"Error in the server try another time"}
    }
    const tdSub = data as TdSub[]
    //Inserts Docs
    documents.map(async(doc:Doc)=>{
       
        const docByHash = await findDocByHashCode(doc.hash_value as string);
        if(docByHash.length === 0){
            const DOC = await addDocument([doc]) as Doc[]
            //NOW ADD THE DOC TO THE subdoc table 
            const {error} = await supabase.from("SubDocs").insert([{doc_id:DOC[0].doc_id, tdsub_id:tdSub[0].tdsub_id as string}])
            if(error){
                throw error
            }
        }else{
            // ADD THE DOC TO THE subdoc table 
            const {error} = await supabase.from("SubDocs").insert([{doc_id:docByHash[0].doc_id, tdsub_id:tdSub[0].tdsub_id as string}])
            if(error){
                throw error
            }
        }

        
})
    //Insert Students that woeked in this project

    //first we insert the owner of the work (the user)
    await supabase.from("SubStudents").insert([{student_id:user?.id, tdsub_id:tdSub[0].tdsub_id, role:"owner"}])
    
    //Insert the other students
    if(selectedStudents.length != 0){
        selectedStudents.map(async (std:Student)=>{
            await supabase.from("SubStudents").insert([{student_id:std?.student_id, tdsub_id:tdSub[0].tdsub_id}])
        })
    }
    return {succes:"Work Submitted Successfully"}

}