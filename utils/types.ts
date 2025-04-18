export interface Class {
    class_name: string;
    description: string;
    major: string;
    class_id: string;
    teacher_id?:string;
  }
export interface Teacher {
    teacher_name: string;
    teacher_mail: string;
}

export interface Student {
  student_id? :string|undefined|null;
  student_name? :string|undefined|null;
  studentImg? :string|undefined|null;
  student_mail? :string|undefined|null;
  class_id? :string|undefined|null;
}


export interface Doc{
  doc_id? :string|undefined|null;
  created_at? :string|undefined|null;
  doc_name? :string|undefined|null;
  doc_url? :string|undefined|null;
  hash_value? :string|undefined|null;
}

export interface Course{
  course_id? :string|undefined|null;
  created_at? :string|undefined|null;
  class_id? :string|undefined|null;
  course_name? :string|undefined|null;
  course_descriptions? :string|undefined|null;
}

export interface CourseDoc{
  course_doc_id? :string|undefined|null;
  created_at? :string|undefined|null;
  course_id? :string|undefined|null;
  doc_id? :string|undefined|null;
}