"use server"



import { User } from "@supabase/supabase-js";
import { GetUser } from "./getuser";
import { createClient } from "./supabase/server"
import { Group, Class,NavGroup } from "./types";

//FIND GROUP BY CLASS ID AND GROUP NUMBER
export const findGroupByNum = async(classId: string, groupNum:string)=>{
    const supabase = await createClient();
    const {data,error} = await supabase.from("group").select("*").eq("class_id", classId).eq("group_num", groupNum).single();

    if(error){
        return null
    }

    if(data){
        return data as Group
    }

}

//Creat a group
export const createGroup = async (classId:string, groupNum:string)=>{
    const supabase = await createClient();
    const group:Group[] =[
        {
            class_id:classId,
            group_num:groupNum
        }
    ] 
    const {data,error} = await supabase.from("group").insert(group).select("*").single()
    if(error){
        throw error

    }
    if(data){
        return data as Group
    }
}


export const getGroups = async ( CLass:Class, ClassType:string)=>{
    const user =await GetUser() 
    const supabase = await createClient();
    const {data, error} = await supabase.from("group").select("*").eq("class_id", CLass.class_id as string).order("group_num", {ascending:true})
    if(error){
        throw error
    }
    if(data.length != 0){
        const groups = data as Group[]
        //the result groups
        let GROUPS: NavGroup[] = []
        groups.map((group:Group)=>{
            GROUPS.push(   {
            name: "Group A01",
            emoji: "🏫",
            pages: [
            {
                name: "Td Submissions",
                url: `/user/${user?.id}/class/${ClassType}/${CLass.class_id}/group${group.group_num}/td`,
                emoji: "📔",
            },
            {
                name: "Notes",
                url: `/user/${user?.id}/class/${ClassType}/${CLass.class_id}/group${group.group_num}/notes`,
                emoji: "🌟",
            },
            ],
        },)
        })
        return GROUPS
    }
    return null
}