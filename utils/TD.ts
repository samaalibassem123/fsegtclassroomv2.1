"use server";

import { GetUser } from "./getuser";
import { createClient } from "./supabase/server";
import { Course } from "./types";

export const addTD = async (td: Course[]) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("course").insert(td).select();

  if (error) {
    throw error;
  }
  if (data) {
    return data as Course[];
  }
};

export const getTDs = async (classId: string) => {
  const supabase = await createClient();
  //Get td
  const { data } = await supabase
    .from("course")
    .select("*")
    .eq("class_id", classId)
    .eq("course_type", "TD")
    .order("created_at", { ascending: false });
  if (data) {
    return data as Course[];
  }
  return null;
};

export const calcTdSubmitPercentage = async (
  classId: string,
  tdId: string,
  group_num: string
) => {
  const supabase = await createClient();
  //get the number of students on the group

  const { count, error } = await supabase
    .from("Student_info")
    .select("*", { count: "exact", head: true })
    .eq("group_num", group_num)
    .eq("class_id", classId);
  if (error) {
    throw error;
  }
  const nbStudents = count;
  if (nbStudents == 0) {
    return 0;
  }
  if (!error) {
    //get the number of student that submitted their project
    const { count } = await supabase
      .from("SubStudent_info")
      .select("*", { count: "exact", head: true })
      .eq("group_num", group_num)
      .eq("td_id", tdId);
    if (count) {
      if(nbStudents)
      return (count / nbStudents) as number;
    }
  }
};

export const ChekcSubmission = async (tdId: string, classId: string) => {
  const supabase = await createClient();
  const user = await GetUser();
  const { data } = await supabase
    .from("SubStudent_info")
    .select("*")
    .eq("student_id", user?.id as string)
    .eq("td_id", tdId)
    .eq("class_id", classId);
  if (data) {
    if (data.length > 0) return true;
  }
  return false;
};
