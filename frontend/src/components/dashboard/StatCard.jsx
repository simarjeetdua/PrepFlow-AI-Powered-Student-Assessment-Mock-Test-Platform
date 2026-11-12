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
                    {Icon && <Icon size={20} strokeWidth={2.2} />}
                </div>

                {trend && (
                    <div className="stat-card-trend">
                        <ArrowUpRight size={13} strokeWidth={2.5} />
                        <span>{trend}</span>
                    </div>
                )}
            </div>

            {/* Value & Labels */}
            <div className="stat-card-content">
                <h3 className="stat-card-value">{value}</h3>
                <p className="stat-card-title">{title}</p>
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
