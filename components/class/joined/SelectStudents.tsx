"use client";

import {  useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Student } from "@/utils/types";
import { AvatarIcon } from "@/components/AvatarIcon";

import { User } from "@supabase/supabase-js";

type ChildProps ={
  sendStudents? : (data:Student[])=>void;
  people: Student[];
  user: User;
}

export function SelectStudents({
  sendStudents,
  people,
  user,
}: 
  ChildProps
) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeople, setSelectedPeople] = useState<Student[]>([]);


  const filteredPeople = people.filter(
    (person) =>
      person.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.student_mail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (person: Student) => {
    setSelectedPeople((prev) =>
      prev.some((p) => p.student_id === person.student_id )
        ? prev.filter((p) => p.student_id !== person.student_id)
        : [...prev, person]
    );
  };

  //Send the selected students to the parent component
  useEffect(()=>{
    if(sendStudents) sendStudents(selectedPeople);
  }, [selectedPeople])
  
  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search Student... 🎯"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <div className="w-full">
        <h2 className="text-lg font-semibold mb-2">Selected Students</h2>
        <ul className="flex gap-2 flex-wrap w-full">
          {selectedPeople.length === 0 ?<span className="text-sm text-gray-500">None is selected</span>:selectedPeople.map((person) => (user && user?.id != person.student_id &&
            <li
              key={person.student_id as string}
              className="flex gap-2 border p-2 text-sm rounded-md items-center"
            >
              <AvatarIcon img={person.studentImg as string} />
              <span className="text-nowrap font-normal">
                {person.student_name} 
              </span>
              <Button
                onClick={() => handleSelect(person)}
                className=" cursor-pointer"
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex space-x-4 items-center w-full">
        <div className="flex-1 overflow-x-scroll">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Select</TableHead>
                <TableHead>Img</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Group Number</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPeople.map(
                (person) =>
    ( user && user?.id != person.student_id &&
                    <TableRow key={person.student_id as string}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPeople.some(
                            (p) => p.student_id === person.student_id
                          )}
                          onCheckedChange={() => handleSelect(person)}
                        />
                      </TableCell>
                      <TableCell>
                        <AvatarIcon img={person.studentImg?person.studentImg as string:""} />
                      </TableCell>
                      <TableCell>{person.student_name}</TableCell>
                      <TableCell>{person.student_mail}</TableCell>
                      <TableCell>{person.group_num}</TableCell>
                    </TableRow>
                  )
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
