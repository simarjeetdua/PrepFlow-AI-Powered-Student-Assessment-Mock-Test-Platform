
import {
  Users,
  UserRound,
  ClipboardList,
  BookOpen,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import "./AdminStatCard.css";

const iconMap = {
  students: Users,
  teachers: UserRound,
  tests: ClipboardList,
  materials: BookOpen,
};

const AdminStatCard = ({
  title,
  value = 0,
  description,
  icon = "students",
  trend,
  color = "blue",
}) => {
  const Icon = iconMap[icon] || Users;

  return (
    <article className={`admin-stat-card admin-stat-${color}`}>
      <div className="admin-stat-top">
        <div className="admin-stat-icon">
          <Icon size={21} strokeWidth={1.8} />
        </div>

        {trend && (
          <span className="admin-stat-trend">
            <TrendingUp size={14} />
            {trend}
          </span>
        )}
      </div>

      <div className="admin-stat-content">
        <p className="admin-stat-title">{title}</p>

        <h3 className="admin-stat-value">
          {value ?? 0}
        </h3>

        {description && (
          <p className="admin-stat-description">
            {description}
          </p>
        )}
      </div>

      <div className="admin-stat-decoration" aria-hidden="true">
        <ArrowUpRight size={20} />
      </div>
    </article>
  );
};

export default AdminStatCard;
