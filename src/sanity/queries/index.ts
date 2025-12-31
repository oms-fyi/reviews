import { defineQuery } from "groq";

export const RECENT_REVIEWS_QUERY = defineQuery(`
*[_type == 'review']{
  _id,
  _createdAt,
  body,
  rating,
  difficulty,
  workload,
  authorId,
  semester->{
    startDate,
    term
  },
  course->{
    name,
    "slug": slug.current,
  }
} | order(_createdAt desc)[0...100]
`);

export const COURSE_SLUGS_QUERY = defineQuery(`
*[_type == 'course'] {
  "slug": slug.current,
}
`);

export const COURSE_WITH_REVIEWS_QUERY = defineQuery(`
*[_type == 'course' && slug.current == $slug]{
  ...,
  "slug": slug.current,
  "syllabusUrl": coalesce(syllabus.file.asset->url, syllabus.url),
  programs[]->{acronym},
  "reviews": *[_type == 'review' && references(^._id)]{
    _id,
    _createdAt,
    body,
    rating,
    difficulty,
    workload,
    authorId,
    "course": null,
    semester->{
      startDate,
      term
    },
  } | order(created desc)
}[0]
`);

export const COURSE_REVIEWS_PAGE_METADATA_QUERY = defineQuery(`
*[_type == 'course' && slug.current == $slug] {
  name
}[0]
`);

export const REVIEW_IDS_QUERY = defineQuery(`
*[_type == 'review'] {
  "id": _id
}[0...$limit]
`);

export const REVIEW_QUERY = defineQuery(`
*[_type == 'review' && _id == $id]{
    _id,
    _createdAt,
    body,
    rating,
    difficulty,
    workload,
    authorId,
    course->{
      name,
      "slug": slug.current
    },
    semester->{
      startDate,
      term
    },
}[0]
`);

export const COURSES_AND_RECENT_SEMESTERS_QUERY = defineQuery(`
{
  "courses": *[_type == 'course'] {
    "id": _id,
    "slug": slug.current,
    name
  } | order(name),
  "semesters" : *[_type == 'semester' && startDate <= now()] {
    "id": _id,
    startDate,
    term
  } | order(startDate desc)[0...$limit]
}
`);

export const GET_COURSES_WITH_REVIEWS_STATS_QUERY = defineQuery(`
*[_type == 'course']{
  ...,
  "slug": slug.current,
  "id": _id,
  "reviews": *[_type == 'review' && references(^._id)]{
    "id": _id,
    "created": _createdAt,
    ...,
    "body": "",
    "course": null,
  }
}
`);
