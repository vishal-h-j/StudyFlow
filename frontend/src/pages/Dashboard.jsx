
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  FileText,
  GraduationCap,
  Search,
  Sparkles,
  CloudDownload,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api";

const tones = ["purple", "blue", "orange", "green", "pink"];

function normalize(value) {
  return (value || "").trim().toLowerCase();
}

function findMaterial(course, materials) {
  return materials.find(
    (material) => normalize(material.course) === normalize(course.title)
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [courseItems, setCourseItems] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const firstName = user?.name?.trim().split(" ")[0] || "there";

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [courseResponse, materialResponse] = await Promise.all([
          api.get("/courses"),
          api.get("/materials")
        ]);

        const courses = Array.isArray(courseResponse.data)
          ? courseResponse.data
          : courseResponse.data.courses || [];

        const materialList = Array.isArray(materialResponse.data)
          ? materialResponse.data
          : materialResponse.data.materials || [];

        if (active) {
          setCourseItems(courses);
          setMaterials(materialList);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load courses and resources. Please refresh the page."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const linkedMaterials = courseItems.filter((course) =>
    findMaterial(course, materials)
  ).length;

  function getFileUrl(material) {
    if (!material) return null;

    if (material.gridFsFileId) {
      return `${api.defaults.baseURL}/materials/file/${material.gridFsFileId}`;
    }

    if (material.url?.startsWith("http://") || material.url?.startsWith("https://")) {
      return material.url;
    }

    return null;
  }

  return (
    <main className="page-container dashboard-page">
      <section className="dashboard-welcome">
        <div className="dashboard-welcome-copy">
          <span className="eyebrow">YOUR LEARNING SPACE</span>

          <h1>Keep your momentum, {firstName}.</h1>

          <p>
            Your learning space is ready. Choose a subject and take
            the next step in your study journey.
          </p>

          <div className="dashboard-welcome-actions">
            <Link className="primary-button" to="/courses">
              Browse courses <ArrowRight size={17} />
            </Link>

            <Link className="dashboard-text-link" to="/settings">
              Personalize your space
            </Link>
          </div>
        </div>

        <div className="dashboard-welcome-art">
          <span className="welcome-art-orbit" />
          <div className="welcome-book-stack">
            <BookOpen size={42} />
          </div>
          <span className="welcome-spark spark-a">
            <Sparkles size={18} />
          </span>
          <span className="welcome-spark spark-b">
            <GraduationCap size={22} />
          </span>
          <div className="welcome-art-caption">
            <strong>One step at a time</strong>
            <span>Progress starts here</span>
          </div>
        </div>
      </section>

      <section className="dashboard-stats" aria-label="StudyFlow overview">
        <article className="dashboard-stat">
          <span className="stat-icon purple">
            <BookOpen size={20} />
          </span>
          <div>
            <span>Available courses</span>
            <strong>
              {loading ? "…" : String(courseItems.length).padStart(2, "0")}
            </strong>
            <small>Courses in your library</small>
          </div>
        </article>

        <article className="dashboard-stat">
          <span className="stat-icon blue">
            <FileText size={20} />
          </span>
          <div>
            <span>PDF resources</span>
            <strong>
              {loading ? "…" : String(linkedMaterials).padStart(2, "0")}
            </strong>
            <small>Courses with linked materials</small>
          </div>
        </article>

        <article className="dashboard-stat">
          <span className="stat-icon green">
            <ShieldCheck size={20} />
          </span>
          <div>
            <span>Access level</span>
            <strong className="stat-role">{user?.role || "Guest"}</strong>
            <small>Personalized account access</small>
          </div>
        </article>
      </section>

      <section className="dashboard-section-head">
        <div>
          <span className="eyebrow">YOUR LIBRARY</span>
          <h2>Pick up where you want to begin</h2>
          <p>Quick access to your current course resources.</p>
        </div>

        <Link to="/courses" className="section-action">
          View all courses <ArrowRight size={16} />
        </Link>
      </section>

      {loading && <p>Loading your courses…</p>}

      {error && (
        <p role="alert" className="faculty-feedback error">
          {error}
        </p>
      )}

      {!loading && !error && (
        <section className="dashboard-course-grid" aria-label="Course shortcuts">
          {courseItems.map((course, index) => {
            const material = findMaterial(course, materials);
            const fileUrl = getFileUrl(material);

            return (
              <article
                className="dashboard-course-card"
                key={course._id || course.title}
              >
                <div className="dashboard-course-top">
                  <span
                    className={`dashboard-course-icon ${tones[index % tones.length]}`}
                  >
                    <BookOpen size={21} />
                  </span>

                  <span className="course-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <span className="dashboard-course-label">
                  {course.category || "GENERAL"}
                </span>

                <h3>{course.title}</h3>

                <p>
                  {course.description || "Explore this course and its topics."}
                </p>

                <div className="dashboard-course-actions">
                  {fileUrl ? (
                    <>
                      <a href={fileUrl} target="_blank" rel="noreferrer">
                        Open resource <ArrowRight size={15} />
                      </a>

                      <a
                        className="course-download"
                        href={fileUrl}
                        download={material.originalFileName || `${course.title}.pdf`}
                        aria-label={`Download ${course.title}`}
                      >
                        <CloudDownload size={17} />
                      </a>
                    </>
                  ) : (
                    <Link to="/courses">
                      {material ? "View material" : "Resource not uploaded yet"}
                      <ArrowRight size={15} />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {!loading && !error && courseItems.length === 0 && (
        <p>No courses are available yet.</p>
      )}

      <section className="dashboard-bottom-banner">
        <span className="bottom-banner-icon">
          <Search size={21} />
        </span>

        <div>
          <strong>Looking for a particular subject?</strong>
          <p>Search the full course library to find the course you need.</p>
        </div>

        <Link to="/courses">
          Find a course <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}
