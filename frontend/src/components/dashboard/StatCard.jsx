import { ArrowUpRight } from "lucide-react";

const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
}) => {
    return (
        <div className="stat-card">

            {/* Top section */}
            <div className="stat-card-top">

                <div className="stat-card-icon">
                    {Icon && <Icon size={22} />}
                </div>

                {trend && (
                    <div className="stat-card-trend">
                        <ArrowUpRight size={15} />
                        {trend}
                    </div>
                )}

            </div>

            {/* Value */}
            <div className="stat-card-content">

                <h3>{value}</h3>

                <p className="stat-card-title">
                    {title}
                </p>

                {description && (
                    <p className="stat-card-description">
                        {description}
                    </p>
                )}

            </div>

        </div>
    );
};

export default StatCard;