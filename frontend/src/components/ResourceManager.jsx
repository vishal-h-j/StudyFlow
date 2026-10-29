
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  FileText,
  Download,
  ExternalLink,
  BookOpen,
  GraduationCap,
  Cloud,
  Code2,
  Boxes,
  Database,
  ArrowUpRight,
  Library
} from "lucide-react";
import api from "../api";

function normalize(value = "") {
  return value.trim().toLowerCase();
}

function getCourseIcon(title = "") {
  const name = title.toLowerCase();

  if (name.includes("cloud")) return Cloud;
  if (name.includes("docker") || name.includes("virtualization")) return Boxes;
  if (name.includes("mongo") || name.includes("database")) return Database;
  if (name.includes("web service") || name.includes("api")) return BookOpen;
  if (name.includes("full stack") || name.includes("development")) return Code2;

  return GraduationCap;
}

const colors = [
  "course-purple",
  "course-blue",
  "course-orange",
  "course-green",
  "course-pink"
];

export default function ResourceManager() {
  const [courses, setCourses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [courseResponse, materialResponse] = await Promise.all([
          api.get("/courses"),
          api.get("/materials")
        ]);

        const courseData = Array.isArray(courseResponse.data)
          ? courseResponse.data
          : courseResponse.data.courses || [];

        const materialData = Array.isArray(materialResponse.data)
          ? materialResponse.data
          : materialResponse.data.materials || [];

        if (active) {
          setCourses(courseData);
          setMaterials(materialData);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load courses and study materials."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return courses;

    return courses.filter((course) =>
      `${course.title || ""} ${course.category || ""} ${
        course.description || ""
      } ${course.instructor || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [courses, search]);

  function findMaterial(course) {
    return materials.find(
      (material) =>
        normalize(material.course || "") === normalize(course.title || "")
    );
  }

  function getFileUrl(material) {
    if (!material) return null;

    if (material.gridFsFileId) {
      return `${api.defaults.baseURL}/materials/file/${material.gridFsFileId}`;
    }

    if (
      material.url &&
      /^https?:\/\//i.test(material.url)
    ) {
      return material.url;
    }

    return null;
  }

  return (
    <main className="page-container resource-page minimal-courses">
      <section className="courses-hero">
        <div className="courses-hero-copy">
          <span className="eyebrow">YOUR LEARNING SPACE</span>

          <h1>
            Explore your <span>courses.</span>
          </h1>

          <p>
            Everything you need for your academic journey, organized
            in one place. Find your course and get straight to learning.
          </p>

          <div className="courses-hero-meta">
            <span><Library size={16} /> Course library</span>
            <span><FileText size={16} /> PDF study resources</span>
          </div>
        </div>

        <div className="courses-hero-art" aria-hidden="true">
          <div className="courses-art-circle courses-art-circle-one" />
          <div className="courses-art-circle courses-art-circle-two" />

          <div className="courses-art-book">
            <GraduationCap size={56} strokeWidth={1.5} />
          </div>

          <div className="courses-art-note">
            <BookOpen size={17} />
            <span>
              <strong>{courses.length} courses</strong>
              <small>Ready to explore</small>
            </span>
          </div>
        </div>
      </section>

      <section className="courses-library">
        <div className="courses-library-heading">
          <div>
            <span className="eyebrow">YOUR RESOURCES</span>
            <h2>Course library</h2>
            <p>Choose a course to explore its details or study material.</p>
          </div>

          <span className="courses-count">
            {filteredCourses.length}{" "}
            {filteredCourses.length === 1 ? "course" : "courses"}
          </span>
        </div>

        <label className="minimal-search courses-search">
          <Search size={19} aria-hidden="true" />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search courses or topics..."
            aria-label="Search courses or topics"
          />

          {search && (
            <button
              className="courses-clear-search"
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </label>

        {loading && <p>Loading courses and study materials…</p>}

        {error && (
          <div className="minimal-empty courses-empty" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="primary-button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="minimal-course-list courses-card-grid">
            {filteredCourses.map((course, index) => {
              const Icon = getCourseIcon(course.title);
              const material = findMaterial(course);
              const fileUrl = getFileUrl(material);

              return (
                <article
                  className="minimal-course course-feature-card"
                  key={course._id || course.id || course.title}
                >
                  <div className="course-card-top">
                    <span
                      className={`course-card-icon ${
                        colors[index % colors.length]
                      }`}
                    >
                      <Icon size={25} strokeWidth={1.8} />
                    </span>

                    <span className="course-card-number">
                      COURSE {String(index + 1).padStart(2, "0")}
                    </span>

                    <ArrowUpRight
                      className="course-card-arrow"
                      size={19}
                      aria-hidden="true"
                    />
                  </div>

                  <span className="course-category">
                    {course.category || "General"}
                  </span>

                  <h3 className="course-card-title">{course.title}</h3>

                  <p className="course-card-description">
                    {course.description ||
                      "Explore this course and its learning topics."}
                  </p>

                  {course.instructor && (
                    <p className="course-card-description">
                      Instructor: {course.instructor}
                    </p>
                  )}

                  <div className="course-card-footer">
                    {fileUrl ? (
                      <>
                        <a
                          className="course-open-button"
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink size={16} />
                          Open PDF
                        </a>

                        <a
                          className="course-download-button"
                          href={fileUrl}
                          download={
                            material.originalFileName ||
                            `${course.title}.pdf`
                          }
                          aria-label={`Download ${course.title} PDF`}
                          title="Download PDF"
                        >
                          <Download size={17} />
                        </a>
                      </>
                    ) : (
                      <span className="course-category">
                        Course available · Study material not uploaded yet
                      </span>
                    )}
                  </div>
                </article>
              );
            })}

            {filteredCourses.length === 0 && (
              <div className="minimal-empty courses-empty">
                <Search size={28} />
                <h3>No courses found</h3>
                <p>Try another course name or topic.</p>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => setSearch("")}
                >
                  Show all courses
                </button>
              </div>
            )}
          </div>
        )}

        <div className="courses-bottom-note">
          <span className="courses-bottom-icon">
            <BookOpen size={20} />
          </span>
          <div>
            <strong>Ready for your next study session?</strong>
            <p>
              Open an available PDF and continue learning at your own pace.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
