import React from "react";
import Dashboard from "./demonstration/Dashboard";

function DemonstrationPage() {
  return (
    <div style={styles.pageContainer}>
      <h2>Демонстрационная страница</h2>
      <p>На этой странице представлены разные компоненты для демонстрации.</p>
      <Dashboard />
    </div>
  );
}

const styles = {
  pageContainer: {
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
};

export default DemonstrationPage;
