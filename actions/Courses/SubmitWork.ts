"use server"

import { createClient } from "@/utils/supabase/server"
import { Doc, Student } from "@/utils/types"



export const SubmitWork =async (state:any, formData:FormData, documents:Doc[],selectedStudents:Student[],tdId:string)=>{

    const supabase = await createClient();

    console.log("docs:"+documents)
    console.log("stds:"+selectedStudents)
    console.log("tdid:"+tdId)

    const Desc = formData.get("desc")

    console.log(Desc)    

    if(documents.length ===0){
        return {warning:"You need to add Documents !"}
    }


}