
"use server"

import { FindClassById, getClassById } from "@/utils/getclass";
import { GetUser } from "@/utils/getuser";
import { createGroup, findGroupByNum } from "@/utils/group";
import { AddStudent, GetStudentById } from "@/utils/student";
import { createClient } from "@/utils/supabase/server"

import {  z } from "zod";

//Zod schema to check the input value
const SchemaClassCode = z.string().uuid({message:"invalid Code"})

export const JoinClass = async(state:unknown, formData:FormData)=>{

    const supabase = await createClient();

    //CLass code
    const class_id = formData.get("classCode") as string
    
    //Class groupe
    const groupe_num = formData.get("groupe") as string


    //Check the validation of the field
    const ValidClassCode = SchemaClassCode.safeParse(class_id)

    if(!ValidClassCode.success){
        return {invalidCode:"* Invalid Code"};
    }else{
        //NOW we can search if class exist or not 
        const SearchClassBycode = await FindClassById(class_id);
        
        if(!SearchClassBycode){
            return {ClassNotFound: "* Their is no class with this code" };

        }else{
            const user = await GetUser();
            //Now we check if user is a teacher or not
            //He cant join if he is a teacher
            const {teacher_id} = await getClassById(class_id)

            if(teacher_id == user?.id){
                return {TeacherWarent : "You are already a teacher on this class"}
            }

            //Add the user as a student
            await AddStudent(user); // it will not add it again if he did exist before

           
         
          
            // first we need to create the group if it does not exist 
            const group = await findGroupByNum(class_id, groupe_num)
            if(!group){
                //Create the group
                const created_group = await createGroup(class_id, groupe_num)
           
                //Add the user to studentClass table
                const {error} = await supabase.from("studentClass").insert([
                    {
                        student_id : user?.id as string,
                        class_id : class_id,
                        group_id : created_group?.group_id
                    }
                ])
                if(error){
                    console.log(error)
                    return {JoinError:"You Joined this class Before"}
                }
                  //if everything goes right like life :(
                 return {succes:"Joined Succefully"}
            }
    
            
            //Add the user to studentClass table
            //first we need to check if he is already joined the class before
            const {data} = await supabase.from("studentClass").select("*").eq("student_id", user?.id as string)
            if(data?.length === 0){
                 const {error} = await supabase.from("studentClass").insert([
                    {
                        student_id : user?.id as string,
                        class_id : class_id,
                        group_id : group?.group_id
                    }
                ])
                if(error){
                    console.log(error)
                    throw error
                }
            }else{
                return {JoinError:"You Joined this class Before"}
            }
           

            //if everything goes right like life :(
            return {succes:"Joined Succefully"}
        }
    }

}