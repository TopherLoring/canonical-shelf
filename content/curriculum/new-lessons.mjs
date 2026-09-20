import {course1Lessons} from './course1-lessons.mjs';
import {course2Lessons} from './course2-lessons.mjs';
import {course3Lessons} from './course3-lessons.mjs';
import {course4Lessons,course5Lessons,course6Lessons} from './course4-6-lessons.mjs';

export const newLessons=[...course1Lessons,...course2Lessons,...course3Lessons,...course4Lessons,...course5Lessons,...course6Lessons];

const ids=new Set();
for(const lesson of newLessons){
  if(ids.has(lesson.id))throw new Error(`duplicate new lesson id: ${lesson.id}`);
  ids.add(lesson.id);
}

export const newLessonIds=[...ids];
