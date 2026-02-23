-- Database Schema for Project Staffing & Financial Control System (PSFC)

-- 1. Resources (Persone)
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    default_rate DECIMAL(10, 2), -- Optional: Default daily/hourly rate
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects (Commesse)
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    project_code VARCHAR(50) UNIQUE NOT NULL, -- Core identifier from BCS
    name VARCHAR(255) NOT NULL,
    client VARCHAR(255),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'Active', -- Active, Completed, On Hold
    budget_total DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Staffing Plan (Pianificazione)
-- Links Resources to Projects with temporal allocation (Planned)
CREATE TABLE staffing_plan (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER REFERENCES resources(id),
    project_id INTEGER REFERENCES projects(id),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    planned_days DECIMAL(5, 2) DEFAULT 0, -- Allocation in days
    planned_cost DECIMAL(10, 2), -- Calculated based on rate * days
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resource_id, project_id, year, month) -- Prevent duplicate entries for same month
);

-- 4. Actuals (Consuntivo)
-- Monthly data on hours/costs actually incurred
CREATE TABLE actuals (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER REFERENCES resources(id),
    project_id INTEGER REFERENCES projects(id),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    actual_days DECIMAL(5, 2) DEFAULT 0,
    actual_cost DECIMAL(10, 2),
    comments TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(resource_id, project_id, year, month)
);

-- Indexes for performance
CREATE INDEX idx_staffing_project_date ON staffing_plan(project_id, year, month);
CREATE INDEX idx_actuals_project_date ON actuals(project_id, year, month);
