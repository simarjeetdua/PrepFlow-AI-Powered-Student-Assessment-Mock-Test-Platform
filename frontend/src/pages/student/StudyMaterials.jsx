
import { useEffect, useMemo, useState } from "react";
import {
    BookOpen,
    Search,
    FileText,
    Download,
    ExternalLink,
    RefreshCw,
    AlertCircle,
    FolderOpen,
    Filter,
} from "lucide-react";

import api from "../../services/api";
import "./StudyMaterials.css";

const StudyMaterials = () => {
    const [materials, setMaterials] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Extract materials from common API response structures.
    const extractMaterials = (data) => {
        if (Array.isArray(data)) return data;

        return (
            data?.notes ||
            data?.materials ||
            data?.data?.notes ||
            data?.data?.materials ||
            data?.data ||
            []
        );
    };

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            setError("");

            // Student-facing endpoint: GET /api/notes
            const response = await api.get("/notes");

            const result = extractMaterials(response.data);

            if (!Array.isArray(result)) {
                throw new Error("Unexpected response from server.");
            }

            // Only show published materials.
            const publishedMaterials = result.filter((note) => {
                const status = String(note.status || "").toLowerCase();

                // If the backend already returns published-only notes,
                // records without a status are also accepted.
                return !status || status === "published";
            });

            setMaterials(publishedMaterials);
        } catch (err) {
            console.error("Study materials error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load study materials. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    // Read common field names used for subjects/categories.
    const getSubject = (note) =>
        note.subject ||
        note.category ||
        note.topic ||
        "General";

    // Read common field names used for PDF/file URLs.
    const getFileUrl = (note) =>
        note.fileUrl ||
        note.pdfUrl ||
        note.file ||
        note.url ||
        note.documentUrl ||
        "";

    const getFileName = (note) =>
        note.fileName ||
        note.originalName ||
        note.title ||
        "Study-Material.pdf";

    const getDate = (note) => {
        const date = note.createdAt || note.uploadedAt;

        if (!date) return "Date unavailable";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "Date unavailable";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const subjects = useMemo(() => {
        const uniqueSubjects = [
            ...new Set(materials.map(getSubject)),
        ];

        return ["All", ...uniqueSubjects.sort()];
    }, [materials]);

    const filteredMaterials = useMemo(() => {
        return materials.filter((note) => {
            const query = search.toLowerCase();

            const matchesSearch = [
                note.title,
                note.description,
                getSubject(note),
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(query)
                );

            const matchesSubject =
                selectedSubject === "All" ||
                getSubject(note) === selectedSubject;

            return matchesSearch && matchesSubject;
        });
    }, [materials, search, selectedSubject]);

    const openMaterial = (url) => {
        if (!url) {
            setError("PDF link is not available for this material.");
            return;
        }

        window.open(url, "_blank", "noopener,noreferrer");
    };

    const downloadMaterial = (url, fileName) => {
        if (!url) {
            setError("Download link is not available.");
            return;
        }

        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="study-materials-page">

            {/* Page Header */}
            <div className="study-header">
                <div>
                    <div className="study-heading">
                        <BookOpen size={27} />
                        <h1>Study Materials</h1>
                    </div>

                    <p>
                        Access your notes, PDFs and learning resources
                        uploaded by your instructors.
                    </p>
                </div>

                <button
                    className="study-refresh-btn"
                    onClick={fetchMaterials}
                    disabled={loading}
                    type="button"
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "study-spinning" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* Summary */}
            <div className="study-summary">
                <div className="study-summary-icon">
                    <FolderOpen size={25} />
                </div>

                <div>
                    <span>Available Materials</span>
                    <h2>{materials.length}</h2>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="study-toolbar">

                <div className="study-search">
                    <Search size={19} />

                    <input
                        type="text"
                        placeholder="Search by title, subject or description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="study-filter">
                    <Filter size={18} />

                    <select
                        value={selectedSubject}
                        onChange={(e) =>
                            setSelectedSubject(e.target.value)
                        }
                    >
                        {subjects.map((subject) => (
                            <option key={subject} value={subject}>
                                {subject === "All"
                                    ? "All Subjects"
                                    : subject}
                            </option>
                        ))}
                    </select>
                </div>

            </div>

            {/* Error */}
            {error && (
                <div className="study-error">
                    <AlertCircle size={19} />
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => setError("")}
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div className="study-state">
                    <RefreshCw
                        size={32}
                        className="study-spinning"
                    />
                    <h3>Loading study materials...</h3>
                    <p>Please wait while we fetch your resources.</p>
                </div>
            ) : filteredMaterials.length === 0 ? (

                /* Empty State */
                <div className="study-state">
                    <div className="study-empty-icon">
                        <BookOpen size={35} />
                    </div>

                    <h3>
                        {materials.length === 0
                            ? "No study materials available"
                            : "No matching materials found"}
                    </h3>

                    <p>
                        {materials.length === 0
                            ? "Your instructor has not published any study materials yet."
                            : "Try changing your search or subject filter."}
                    </p>

                    {(search || selectedSubject !== "All") && (
                        <button
                            type="button"
                            className="study-clear-btn"
                            onClick={() => {
                                setSearch("");
                                setSelectedSubject("All");
                            }}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

            ) : (

                /* Materials Grid */
                <div className="study-materials-grid">
                    {filteredMaterials.map((note) => {
                        const id = note._id || note.id;
                        const fileUrl = getFileUrl(note);
                        const subject = getSubject(note);

                        return (
                            <article
                                className="study-material-card"
                                key={id}
                            >
                                <div className="study-card-top">
                                    <div className="study-pdf-icon">
                                        <FileText size={27} />
                                    </div>

                                    <span className="study-pdf-badge">
                                        PDF
                                    </span>
                                </div>

                                <div className="study-card-content">
                                    <span className="study-subject">
                                        {subject}
                                    </span>

                                    <h3>
                                        {note.title || "Untitled Material"}
                                    </h3>

                                    <p>
                                        {note.description ||
                                            "Study resource uploaded by your instructor."}
                                    </p>

                                    <div className="study-card-date">
                                        Uploaded: {getDate(note)}
                                    </div>
                                </div>

                                <div className="study-card-actions">
                                    <button
                                        type="button"
                                        className="study-view-btn"
                                        disabled={!fileUrl}
                                        onClick={() =>
                                            openMaterial(fileUrl)
                                        }
                                    >
                                        <ExternalLink size={16} />
                                        View PDF
                                    </button>

                                    <button
                                        type="button"
                                        className="study-download-btn"
                                        disabled={!fileUrl}
                                        title="Download PDF"
                                        onClick={() =>
                                            downloadMaterial(
                                                fileUrl,
                                                getFileName(note)
                                            )
                                        }
                                    >
                                        <Download size={17} />
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* Footer */}
            {!loading && materials.length > 0 && (
                <div className="study-results-count">
                    Showing {filteredMaterials.length} of{" "}
                    {materials.length} study materials
                </div>
            )}

        </div>
    );
};

export default StudyMaterials;
