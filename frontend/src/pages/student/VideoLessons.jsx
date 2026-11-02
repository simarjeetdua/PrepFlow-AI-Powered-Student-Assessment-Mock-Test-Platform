
import { useEffect, useMemo, useState } from "react";

import {
    PlayCircle,
    Search,
    RefreshCw,
    Filter,
    Video,
    Clock,
    BookOpen,
    AlertCircle,
    ExternalLink,
    X,
} from "lucide-react";

import api from "../../services/api";
import "./VideoLessons.css";

const VideoLessons = () => {
    const [videos, setVideos] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("All");
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Handle common API response structures.
    const extractVideos = (data) => {
        if (Array.isArray(data)) return data;

        return (
            data?.videos ||
            data?.lessons ||
            data?.data?.videos ||
            data?.data?.lessons ||
            data?.data ||
            []
        );
    };

    const fetchVideos = async () => {
        try {
            setLoading(true);
            setError("");

            // Student endpoint: GET /api/videos
            const response = await api.get("/videos");

            const result = extractVideos(response.data);

            if (!Array.isArray(result)) {
                throw new Error("Unexpected response from server.");
            }

            // Only display published videos.
            const publishedVideos = result.filter((video) => {
                const status = String(video.status || "").toLowerCase();

                return !status || status === "published";
            });

            setVideos(publishedVideos);
        } catch (err) {
            console.error("Video lessons error:", err);

            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to load video lessons. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, []);

    const getSubject = (video) =>
        video.subject ||
        video.category ||
        video.topic ||
        "General";

    const getVideoUrl = (video) =>
        video.videoUrl ||
        video.youtubeUrl ||
        video.vimeoUrl ||
        video.url ||
        "";

    const getDate = (video) => {
        const date = video.createdAt || video.publishedAt;

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

    // Convert YouTube and Vimeo links into embeddable URLs.
    const getEmbedUrl = (url) => {
        if (!url) return "";

        try {
            const parsedUrl = new URL(url);
            const hostname = parsedUrl.hostname.replace(/^www\./, "");

            // YouTube
            if (
                hostname === "youtube.com" ||
                hostname === "m.youtube.com" ||
                hostname === "youtu.be"
            ) {
                let videoId = "";

                if (hostname === "youtu.be") {
                    videoId = parsedUrl.pathname.slice(1);
                } else if (parsedUrl.pathname === "/watch") {
                    videoId = parsedUrl.searchParams.get("v") || "";
                } else {
                    const match = parsedUrl.pathname.match(
                        /^\/(?:embed|shorts)\/([^/]+)/
                    );

                    videoId = match?.[1] || "";
                }

                return videoId
                    ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`
                    : "";
            }

            // Vimeo
            if (
                hostname === "vimeo.com" ||
                hostname === "player.vimeo.com"
            ) {
                const match = parsedUrl.pathname.match(/\/(?:video\/)?(\d+)/);
                const videoId = match?.[1];

                return videoId
                    ? `https://player.vimeo.com/video/${videoId}`
                    : "";
            }

            return "";
        } catch {
            return "";
        }
    };

    const subjects = useMemo(() => {
        const uniqueSubjects = [
            ...new Set(videos.map(getSubject)),
        ];

        return ["All", ...uniqueSubjects.sort()];
    }, [videos]);

    const filteredVideos = useMemo(() => {
        return videos.filter((video) => {
            const query = search.toLowerCase();

            const matchesSearch = [
                video.title,
                video.description,
                getSubject(video),
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(query)
                );

            const matchesSubject =
                selectedSubject === "All" ||
                getSubject(video) === selectedSubject;

            return matchesSearch && matchesSubject;
        });
    }, [videos, search, selectedSubject]);

    const openVideo = (video) => {
        const url = getVideoUrl(video);

        if (!getEmbedUrl(url)) {
            setError(
                "This video URL is invalid or is not a supported YouTube/Vimeo link."
            );
            return;
        }

        setError("");
        setSelectedVideo(video);
    };

    const closeVideo = () => {
        setSelectedVideo(null);
    };

    return (
        <div className="video-lessons-page">

            {/* Header */}
            <div className="video-page-header">
                <div>
                    <div className="video-page-heading">
                        <PlayCircle size={28} />
                        <h1>Video Lessons</h1>
                    </div>

                    <p>
                        Learn through video lessons published by your
                        instructors.
                    </p>
                </div>

                <button
                    type="button"
                    className="video-refresh-btn"
                    onClick={fetchVideos}
                    disabled={loading}
                >
                    <RefreshCw
                        size={17}
                        className={loading ? "video-spinning" : ""}
                    />
                    Refresh
                </button>
            </div>

            {/* Summary */}
            <div className="video-summary">
                <div className="video-summary-icon">
                    <Video size={25} />
                </div>

                <div>
                    <span>Available Lessons</span>
                    <h2>{videos.length}</h2>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="video-toolbar">
                <div className="video-search">
                    <Search size={19} />

                    <input
                        type="text"
                        placeholder="Search videos by title, subject..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="video-filter">
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
                <div className="video-error">
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
                <div className="video-state">
                    <RefreshCw
                        size={32}
                        className="video-spinning"
                    />
                    <h3>Loading video lessons...</h3>
                    <p>Please wait while we fetch your lessons.</p>
                </div>
            ) : filteredVideos.length === 0 ? (

                /* Empty State */
                <div className="video-state">
                    <div className="video-empty-icon">
                        <PlayCircle size={36} />
                    </div>

                    <h3>
                        {videos.length === 0
                            ? "No video lessons available"
                            : "No matching videos found"}
                    </h3>

                    <p>
                        {videos.length === 0
                            ? "Your instructor has not published any video lessons yet."
                            : "Try changing your search or subject filter."}
                    </p>

                    {(search || selectedSubject !== "All") && (
                        <button
                            type="button"
                            className="video-clear-btn"
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

                /* Video Grid */
                <div className="video-lessons-grid">
                    {filteredVideos.map((video) => {
                        const id = video._id || video.id;
                        const subject = getSubject(video);
                        const url = getVideoUrl(video);
                        const embedUrl = getEmbedUrl(url);

                        return (
                            <article
                                className="video-lesson-card"
                                key={id}
                            >
                                {/* Thumbnail */}
                                <div className="video-thumbnail">
                                    {video.thumbnail ? (
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title || "Video lesson"}
                                        />
                                    ) : (
                                        <div className="video-thumbnail-placeholder">
                                            <PlayCircle size={48} />
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        className="video-play-overlay"
                                        onClick={() => openVideo(video)}
                                        disabled={!embedUrl}
                                        aria-label={`Play ${video.title || "video"}`}
                                    >
                                        <PlayCircle size={46} />
                                    </button>

                                    {video.duration && (
                                        <span className="video-duration">
                                            <Clock size={12} />
                                            {video.duration}
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="video-card-content">
                                    <span className="video-subject">
                                        {subject}
                                    </span>

                                    <h3>
                                        {video.title || "Untitled Video"}
                                    </h3>

                                    <p>
                                        {video.description ||
                                            "Video lesson published by your instructor."}
                                    </p>

                                    <div className="video-card-meta">
                                        <span>
                                            <BookOpen size={14} />
                                            {subject}
                                        </span>

                                        <span>
                                            {getDate(video)}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className="video-watch-btn"
                                        onClick={() => openVideo(video)}
                                        disabled={!embedUrl}
                                    >
                                        <PlayCircle size={17} />
                                        Watch Lesson
                                    </button>

                                    {url && (
                                        <a
                                            className="video-external-link"
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Open original video
                                            <ExternalLink size={13} />
                                        </a>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {/* Results */}
            {!loading && videos.length > 0 && (
                <div className="video-results-count">
                    Showing {filteredVideos.length} of {videos.length} lessons
                </div>
            )}

            {/* Video Player Modal */}
            {selectedVideo && (
                <div
                    className="video-modal-overlay"
                    onClick={closeVideo}
                    role="presentation"
                >
                    <div
                        className="video-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Video lesson player"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="video-modal-header">
                            <div>
                                <h2>{selectedVideo.title}</h2>
                                <p>{getSubject(selectedVideo)}</p>
                            </div>

                            <button
                                type="button"
                                onClick={closeVideo}
                                aria-label="Close video player"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <div className="video-player-container">
                            <iframe
                                src={getEmbedUrl(getVideoUrl(selectedVideo))}
                                title={selectedVideo.title || "Video lesson"}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                referrerPolicy="strict-origin-when-cross-origin"
                            />
                        </div>

                        {selectedVideo.description && (
                            <p className="video-modal-description">
                                {selectedVideo.description}
                            </p>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default VideoLessons;
