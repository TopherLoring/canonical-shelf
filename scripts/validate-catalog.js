import fs from "fs";
import path from "path";

const CATALOG_PATH = path.join(process.cwd(), "public", "data", "catalog.json");

function validate() {
  console.log("?? Validating catalog.json...");
  
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error("? Error: catalog.json not found at " + CATALOG_PATH);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
  const errors = [];

  // 1. Root structure
  const requiredRoot = ["courses", "units", "activities", "byUnit", "byCourse"];
  requiredRoot.forEach(key => {
    if (!data[key]) errors.push(`Root is missing required key: ${key}`);
  });

  if (errors.length > 0) return report(errors);

  // 2. Courses validation
  data.courses.forEach((course, i) => {
    if (!course.id) errors.push(`Course[${i}] is missing id`);
    if (!course.title) errors.push(`Course[${i}] is missing title`);
    if (!course.sequence) errors.push(`Course[${i}] is missing sequence`);
  });

  // 3. Units validation
  data.units.forEach((unit, i) => {
    if (!unit.id) errors.push(`Unit[${i}] is missing id`);
    if (!unit.title) errors.push(`Unit[${i}] is missing title`);
    if (!unit.courseId) errors.push(`Unit[${i}] is missing courseId`);
    
    // Check if courseId exists in courses
    if (unit.courseId && !data.courses.find(c => c.id === unit.courseId)) {
      errors.push(`Unit[${unit.id || i}] references non-existent courseId: ${unit.courseId}`);
    }
  });

  // 4. Activities validation
  data.activities.forEach((act, i) => {
    if (!act.id) errors.push(`Activity[${i}] is missing id`);
    if (!act.unitId) errors.push(`Activity[${i}] is missing unitId`);
    
    // Check if unitId exists in units
    if (act.unitId && !data.units.find(u => u.id === act.unitId)) {
      errors.push(`Activity[${act.id || i}] references non-existent unitId: ${act.unitId}`);
    }
  });

  // 5. Mapping consistency
  Object.entries(data.byUnit).forEach(([unitId, activityIds]) => {
    if (!Array.isArray(activityIds)) errors.push(`byUnit mapping for ${unitId} must be an array`);
    activityIds.forEach(aid => {
      if (!data.activities.find(a => a.id === aid)) {
        errors.push(`byUnit[${unitId}] references non-existent activityId: ${aid}`);
      }
    });
  });

  Object.entries(data.byCourse).forEach(([courseId, unitIds]) => {
    if (!Array.isArray(unitIds)) errors.push(`byCourse mapping for ${courseId} must be an array`);
    unitIds.forEach(uid => {
      if (!data.units.find(u => u.id === uid)) {
        errors.push(`byCourse[${courseId}] references non-existent unitId: ${uid}`);
      }
    });
  });

  return report(errors);
}

function report(errors) {
  if (errors.length === 0) {
    console.log("? Catalog validation passed!");
    process.exit(0);
  } else {
    console.error("? Catalog validation failed:");
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }
}

validate();
