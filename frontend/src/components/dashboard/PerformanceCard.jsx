import { BarChart3, TrendingUp, Target, Award } from "lucide-react";

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
                    <h2>Performance</h2>
                    <p>Your mock test performance</p>
                </div>

                <div className="performance-icon">
                    <BarChart3 size={22} />
                </div>
            </div>

            {/* Statistics */}
            <div className="performance-stats">

                {/* Tests Attempted */}
                <div className="performance-stat">
                    <div className="stat-icon">
                        <Target size={18} />
                    </div>

                    <div>
                        <span className="stat-value">
                            {testsAttempted}
                        </span>

                        <span className="stat-label">
                            Tests Attempted
                        </span>
                    </div>
                </div>

                {/* Average Score */}
                <div className="performance-stat">
                    <div className="stat-icon">
                        <TrendingUp size={18} />
                    </div>

                    <div>
                        <span className="stat-value">
                            {averageScore}%
                        </span>

                        <span className="stat-label">
                            Average Score
                        </span>
                    </div>
                </div>

                {/* Best Score */}
                <div className="performance-stat">
                    <div className="stat-icon">
                        <Award size={18} />
                    </div>

                    <div>
                        <span className="stat-value">
                            {bestScore}%
                        </span>

                        <span className="stat-label">
                            Best Score
                        </span>
                    </div>
                </div>

            </div>

            {/* Completion Progress */}
            <div className="completion-section">

                <div className="completion-header">
                    <span>Test Completion</span>

                    <span>{completionRate}%</span>
                </div>

                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{
                            width: `${Math.min(
                                Math.max(completionRate, 0),
                                100
                            )}%`,
                        }}
                    />
                </div>

            </div>

        </div>
    );
};

export default PerformanceCard;