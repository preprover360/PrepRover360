# PrepRover360 V1

New structure:
Home → Course → Class → Subject → Chapter → Topic → Question Type (mandatory) → optional Exam / Year / NCERT → Questions → Solution.

Separate JSON files are provided for Physics, Chemistry, Mathematics and Biology.

Question metadata:
id, course, class, subject, chapter, topic, type, marks, exam, year, pyq, ncert, question, image, answerId.

Use `"marks": null` when marks are not specified.
Use `"year": null` when no year applies.
Use `pyq` and `ncert` as true/false.
Do not create true/false fields for every question type; `type` stores the type directly.

The subject JSON files are empty starter files with the schema example. Real collected questions can be added after the metadata is finalized.
