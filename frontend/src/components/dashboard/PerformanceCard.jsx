import { BarChart3, TrendingUp, Target, Award, CheckCircle } from "lucide-react";

const PerformanceCard = ({
    testsAttempted = 0,
    averageScore = 0,
    bestScore = 0,
    completionRate = 0,
}) => {
    return (
        <div className="performance-card">
            {/* Header */}
            <div className="performance-header">
                <div>
                    <h2>Academic Mastery</h2>
                    <p>Aggregate performance across all tests</p>
                </div>

                <div className="performance-icon">
                    <BarChart3 size={20} strokeWidth={2.2} />
                </div>
            </div>

            {/* Statistics Row / Grid */}
            <div className="performance-stats">
                {/* Tests Attempted */}
                <div className="performance-stat">
                    <div className="stat-icon target">
                        <Target size={16} strokeWidth={2.2} />
                    </div>

                    <div className="stat-info">
                        <span className="stat-value">{testsAttempted}</span>
                        <span className="stat-label">Tests Taken</span>
                    </div>
                </div>

                {/* Average Score */}
                <div className="performance-stat">
                    <div className="stat-icon trending">
                        <TrendingUp size={16} strokeWidth={2.2} />
                    </div>

                    <div className="stat-info">
                        <span className="stat-value">{averageScore}%</span>
                        <span className="stat-label">Average Score</span>
                    </div>
                </div>

                {/* Best Score */}
                <div className="performance-stat">
                    <div className="stat-icon award">
                        <Award size={16} strokeWidth={2.2} />
                    </div>

                    <div className="stat-info">
                        <span className="stat-value">{bestScore}%</span>
                        <span className="stat-label">Highest Score</span>
                    </div>
                </div>
            </div>

            {/* Completion Progress Bar */}
            <div className="completion-section">
                <div className="completion-header">
                    <span className="completion-title">
                        <CheckCircle size={14} className="completion-icon" />
                        Overall Completion
                    </span>

                    <span className="completion-percentage">{completionRate}%</span>
                </div>

                <div className="progress-bar-track">
                    <div
                        className="progress-bar-fill"
                        style={{
                            width: `${Math.min(
                                Math.max(completionRate, 0),
                                100
                            )}%`,
                        }}
                    />
                </div>
                
                <p className="completion-footnote">
                    {completionRate >= 80
                        ? "Excellent consistency! You're on track for mastery."
                        : completionRate >= 50
                        ? "Good steady progress. Keep completing your mock tests."
                        : "Begin more tests to improve your completion index."}
                </p>
            </div>
        </div>
    );
};

export default PerformanceCard;
