import React from "react";
import { Card, ErrorNotice, Spinner } from "../../components/UIComponents";

function LoadState({ load }) {
  if (load.loading && !load.data) return <Spinner />;
  if (load.error && !load.data) {
    return <ErrorNotice message={load.error} retry={load.reload} />;
  }
  return null;
}

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <Card className="admin-stat">
      <div className="admin-stat-icon">
        <Icon size={23} />
      </div>
      <span>{label}</span>
      <strong>{Number(value || 0).toLocaleString()}</strong>
      <small>{description}</small>
    </Card>
  );
}

export { LoadState, StatCard };
