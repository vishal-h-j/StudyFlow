
import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  FileUp,
  FileText
} from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  title: "",
  description: "",
  icon: "📘",
  category: "Technology",
  instructor: ""
};

export default function FacultyDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadCourses() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/courses");
      setCourses(
        Array.isArray(response.data)
          ? response.data
          : response.data.courses || []
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load courses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  function startEdit(course) {
    setEditingId(course._id);
    setForm({
      title: course.title || "",
      description: course.description || "",
      icon: course.icon || "📘",
      category: course.category || "Technology",
      instructor: course.instructor || ""
    });
    setSelectedFile(null);
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedFile(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (editingId) {
        await api.put(`/courses/${editingId}`, form);
        setMessage("Course updated successfully.");
      } else {
        if (!selectedFile) {
          setError("Please select a PDF file for this course.");
          setSaving(false);
          return;
        }

        if (
          selectedFile.type !== "application/pdf" ||
          !selectedFile.name.toLowerCase().endsWith(".pdf")
        ) {
          setError("Please select a valid PDF file.");
          setSaving(false);
          return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
          setError("The PDF must be 10 MB or smaller.");
          setSaving(false);
          return;
        }

        const courseResponse = await api.post("/courses", form);
        const createdCourse =
          courseResponse.data.course || courseResponse.data;

        const uploadData = new FormData();
        uploadData.append("title", `${form.title.trim()} Notes`);
        uploadData.append("description", form.description);
        uploadData.append("course", createdCourse.title || form.title.trim());
        uploadData.append("file", selectedFile);

        try {
          await api.post("/materials/upload", uploadData);
        } catch (uploadError) {
          setMessage(
            `Course "${form.title}" was created, but its PDF upload failed. Do not create the course again. Edit the course or retry the PDF upload.`
          );
          setError(
            uploadError.response?.data?.message ||
              "PDF upload failed. Check your connection and faculty permissions."
          );
          await loadCourses();
          resetForm();
          return;
        }

        setMessage("Course and PDF added successfully!");
      }

      resetForm();
      await loadCourses();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save course. Check your faculty permissions."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCourse(course) {
    if (
      !window.confirm(
        `Delete "${course.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await api.delete(`/courses/${course._id}`);
      setCourses((current) =>
        current.filter((item) => item._id !== course._id)
      );
      setMessage(`"${course.title}" was deleted.`);

      if (editingId === course._id) resetForm();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete course. Check your faculty permissions."
      );
    }
  }

  if (loading) {
    return (
      <main className="page-container">
        <p>Loading faculty workspace…</p>
      </main>
    );
  }

  return (
    <main className="page-container faculty-page">
      <section className="faculty-hero">
        <div>
          <span className="eyebrow">FACULTY WORKSPACE</span>
          <h1>
            Welcome, {user?.name?.trim().split(" ")[0] || "Faculty"}.
          </h1>
          <p>Manage your StudyFlow course catalogue from one place.</p>
        </div>
        <div className="faculty-hero-icon">
          <BookOpen size={42} />
        </div>
      </section>

      <section className="faculty-layout">
        <form className="faculty-form" onSubmit={handleSubmit}>
          <div className="faculty-form-heading">
            <h2>{editingId ? "Edit course" : "Add a new course"}</h2>

            {editingId && (
              <button
                type="button"
                className="faculty-cancel"
                onClick={resetForm}
              >
                <X size={16} /> Cancel
              </button>
            )}
          </div>

          <label>
            Course title
            <input
              required
              maxLength={150}
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />
          </label>

          <label>
            Description
            <textarea
              required
              maxLength={2000}
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>

          <div className="faculty-form-row">
            <label>
              Icon
              <input
                maxLength={10}
                value={form.icon}
                onChange={(e) =>
                  setForm({ ...form, icon: e.target.value })
                }
              />
            </label>

            <label>
              Category
              <input
                required
                maxLength={100}
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              />
            </label>
          </div>

          <label>
            Instructor
            <input
              required
              maxLength={100}
              value={form.instructor}
              onChange={(e) =>
                setForm({ ...form, instructor: e.target.value })
              }
            />
          </label>

          {!editingId && (
            <label className="faculty-pdf-upload">
              <span>
                <FileUp size={19} /> Course study material (PDF)
              </span>

              <input
                type="file"
                accept=".pdf,application/pdf"
                required
                onChange={(e) => {
                  setSelectedFile(e.target.files?.[0] || null);
                  setError("");
                  setMessage("");
                }}
              />

              <small>
                Select a PDF from your Mac. Maximum file size: 10 MB.
              </small>

              {selectedFile && (
                <span className="faculty-selected-file">
                  <FileText size={17} />
                  {selectedFile.name} (
                  {(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              )}
            </label>
          )}

          {error && (
            <p className="faculty-feedback error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="faculty-feedback success" role="status">
              {message}
            </p>
          )}

          <button
            className="primary-button faculty-submit"
            type="submit"
            disabled={saving}
          >
            {editingId ? <Pencil size={17} /> : <Plus size={17} />}
            {saving
              ? "Saving and uploading…"
              : editingId
                ? "Save changes"
                : "Add Course and Upload PDF"}
          </button>
        </form>

        <section className="faculty-course-list">
          <div className="faculty-list-heading">
            <div>
              <h2>Course catalogue</h2>
              <p>
                {courses.length} course{courses.length === 1 ? "" : "s"}{" "}
                available
              </p>
            </div>

            <button
              type="button"
              className="faculty-refresh"
              onClick={loadCourses}
              aria-label="Refresh courses"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          {courses.length === 0 ? (
            <p>No courses found. Add your first course using the form.</p>
          ) : (
            <div className="faculty-courses">
              {courses.map((course) => (
                <article className="faculty-course-item" key={course._id}>
                  <div className="faculty-course-icon">
                    {course.icon || "📘"}
                  </div>

                  <div className="faculty-course-info">
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <span>
                      {course.category} · {course.instructor}
                    </span>
                  </div>

                  <div className="faculty-course-actions">
                    <button
                      type="button"
                      onClick={() => startEdit(course)}
                      aria-label={`Edit ${course.title}`}
                    >
                      <Pencil size={17} /> Edit
                    </button>

                    <button
                      type="button"
                      className="faculty-delete"
                      onClick={() => deleteCourse(course)}
                      aria-label={`Delete ${course.title}`}
                    >
                      <Trash2 size={17} /> Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
