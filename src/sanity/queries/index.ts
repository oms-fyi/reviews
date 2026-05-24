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

export const COURSE_BY_SLUG_QUERY = defineQuery(`
*[_type == 'course' && slug.current == $slug][0]{
  ...,
  "slug": slug.current,
  "syllabusUrl": coalesce(syllabus.file.asset->url, syllabus.url),
  programs[]->{acronym},
  reviewCount,
  rating,
  difficulty,
  workload,
}
`);

export const COURSE_REVIEWS_QUERY = defineQuery(`
*[_type == 'review' && references(*[_type == 'course' && slug.current == $slug][0]._id)]
  | order(_createdAt desc)[$offset...$end]{
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
}
`);

/** @deprecated Use COURSE_BY_SLUG_QUERY + COURSE_REVIEWS_QUERY */
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
  } | order(_createdAt desc)
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

export const MY_REVIEWS_QUERY = defineQuery(`
*[_type == 'review' && authorId == $authorId]{
  _id,
  _createdAt,
  body,
  rating,
  difficulty,
  workload,
  course->{
    name,
    "slug": slug.current,
  },
  semester->{
    startDate,
    term
  },
} | order(_createdAt desc)
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

/** Home page — uses stored aggregates on each course (see course-stats.ts). */
export const COURSES_FOR_HOME_QUERY = defineQuery(`
*[_type == 'course']{
  ...,
  "slug": slug.current,
  "id": _id,
  reviewCount,
  rating,
  difficulty,
  workload,
}
`);

/** @deprecated Use COURSES_FOR_HOME_QUERY — loads all reviews per course. */
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
