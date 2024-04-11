DROP TABLE IF EXISTS students;
CREATE TABLE students (
  student_id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(200) NOT NULL,
  year VARCHAR(15) NOT NULL,
  major VARCHAR(30) NOT NULL,
  degree VARCHAR(15) NOT NULL
);

DROP TABLE IF EXISTS courses;
CREATE TABLE courses (
  course_id NUMERIC PRIMARY KEY,
  course_name VARCHAR(100) NOT NULL,
  credit_hours NUMERIC NOT NULL
);

DROP TABLE IF EXISTS student_courses;
CREATE TABLE student_courses (
  course_id INTEGER NOT NULL REFERENCES courses (course_id),
  student_id INTEGER NOT NULL REFERENCES students (student_id)
);

DROP TABLE IF EXISTS prerequisites;
CREATE TABLE IF NOT EXISTS prerequisites (
  course_id INTEGER NOT NULL REFERENCES courses (course_id),
  prerequisite_id INTEGER NOT NULL REFERENCES courses (course_id)
);

-- Views to simplify queries in the server.

CREATE OR REPLACE VIEW course_prerequisite_count AS
  SELECT
    c.course_id,
    COUNT(p.prerequisite_id) AS num_prerequisites
  FROM
    courses AS c
    LEFT JOIN prerequisites AS p ON c.course_id = p.course_id
  GROUP BY c.course_id;

CREATE OR REPLACE VIEW student_prerequisite_count AS
  SELECT
    c.course_id,
    sc.student_id,
    COUNT(*) AS num_prerequisites_satisfied
  FROM
    courses AS c
    LEFT JOIN prerequisites AS p ON c.course_id = p.course_id
    LEFT JOIN student_courses AS sc ON p.prerequisite_id = sc.course_id
  GROUP BY c.course_id, sc.student_id;
