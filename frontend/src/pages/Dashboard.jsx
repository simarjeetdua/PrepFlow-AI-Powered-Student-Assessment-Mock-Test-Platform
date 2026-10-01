import { useEffect, useState } from "react";
import {
    ClipboardList,
    Trophy,
    Target,
    Clock,
} from "lucide-react";

import api from "../services/api";

import WelcomeCard from "../components/dashboard/WelcomeCard";
import StatCard from "../components/dashboard/StatCard";
import RecentTests from "../components/dashboard/RecentTests";
import PerformanceCard from "../components/dashboard/PerformanceCard";

const Dashboard = () => {
    const [student, setStudent] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // -----------------------------
                // 1. Fetch Student Profile
                // -----------------------------
                const profileResponse =
                    await api.get("/students/profile");

                if (profileResponse.data.student) {
                    setStudent(profileResponse.data.student);

                    localStorage.setItem(
                        "student",
                        JSON.stringify(profileResponse.data.student)
                    );
                }

                // -----------------------------
                // 2. Fetch Student Test Results
                // -----------------------------
                const resultsResponse =
                    await api.get("/results/my");

                console.log(
                    "Dashboard Results:",
                    resultsResponse.data
                );

                setResults(
                    resultsResponse.data.results || []
                );

            } catch (error) {
                console.error(
                    "Failed to fetch dashboard data:",
                    error
                );

                // Fallback to locally stored student
                const storedStudent =
                    localStorage.getItem("student");

                if (storedStudent) {
                    try {
                        setStudent(
                            JSON.parse(storedStudent)
                        );
                    } catch (parseError) {
                        console.error(
                            "Failed to parse student data:",
                            parseError
                        );
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // ---------------------------------
    // Student Name
    // ---------------------------------

    const studentName =
        student?.name || "Student";

    // ---------------------------------
    // Dashboard Statistics
    // ---------------------------------

    const testsAttempted = results.length;

    const averageScore =
        testsAttempted > 0
            ? Math.round(
                  results.reduce(
                      (total, result) =>
                          total +
                          (result.percentage || 0),
                      0
                  ) / testsAttempted
              )
            : 0;

    const bestScore =
        testsAttempted > 0
            ? Math.max(
                  ...results.map(
                      (result) =>
                          result.percentage || 0
                  )
              )
            : 0;

    const totalTimeSpent = results.reduce(
        (total, result) =>
            total + (result.timeTaken || 0),
        0
    );

    // ---------------------------------
    // Recent Tests
    // ---------------------------------

    const recentTests = results
        .slice(0, 5)
        .map((result) => ({
            id: result._id,

            title:
                result.mockTest?.title ||
                "Mock Test",

            score: result.percentage || 0,

            date:
                result.submittedAt ||
                result.createdAt,

            totalQuestions:
                result.totalQuestions || 0,

            correctAnswers:
                result.correctAnswers || 0,

            incorrectAnswers:
                result.incorrectAnswers || 0,

            unanswered:
                result.unanswered || 0,
        }));

    // ---------------------------------
    // Completion Rate
    // ---------------------------------

    const completionRate =
        testsAttempted > 0
            ? Math.round(
                  results.reduce(
                      (total, result) => {
                          const totalQuestions =
                              result.totalQuestions || 0;

                          const unanswered =
                              result.unanswered || 0;

                          if (totalQuestions === 0) {
                              return total;
                          }

                          const completed =
                              ((totalQuestions -
                                  unanswered) /
                                  totalQuestions) *
                              100;

                          return total + completed;
                      },
                      0
                  ) / testsAttempted
              )
            : 0;

    // ---------------------------------
    // Loading State
    // ---------------------------------

    if (loading) {
        return (
            <div className="dashboard-page">
                <div
                    style={{
                        padding: "40px",
                        textAlign: "center",
                    }}
                >
                    Loading dashboard...
                </div>
            </div>
        );
    }

    // ---------------------------------
    // Render
    // ---------------------------------

    return (
        <div className="dashboard-page">

            {/* Welcome */}
            <WelcomeCard name={studentName} />

            {/* Statistics */}
            <section className="dashboard-stats">

                <StatCard
                    title="Tests Attempted"
                    value={testsAttempted}
                    description={
                        testsAttempted === 0
                            ? "No tests attempted yet"
                            : `${testsAttempted} test${
                                  testsAttempted > 1
                                      ? "s"
                                      : ""
                              } completed`
                    }
                    icon={ClipboardList}
                />

                <StatCard
                    title="Average Score"
                    value={`${averageScore}%`}
                    description={
                        testsAttempted === 0
                            ? "Start a test to track your score"
                            : "Average performance"
                    }
                    icon={Target}
                />

                <StatCard
                    title="Best Score"
                    value={`${bestScore}%`}
                    description={
                        testsAttempted === 0
                            ? "Your highest test score"
                            : "Your highest test score"
                    }
                    icon={Trophy}
                />

                <StatCard
                    title="Time Spent"
                    value={`${totalTimeSpent} min`}
                    description="Total test time"
                    icon={Clock}
                />

            </section>

            {/* Main Dashboard Content */}
            <section className="dashboard-grid">

                <div className="dashboard-main-column">

                    <RecentTests
                        tests={recentTests}
                    />

                </div>

                <div className="dashboard-side-column">

                    <PerformanceCard
                        testsAttempted={testsAttempted}
                        averageScore={averageScore}
                        bestScore={bestScore}
                        completionRate={completionRate}
                    />

                </div>

            </section>

        </div>
    );
};

export default Dashboard;