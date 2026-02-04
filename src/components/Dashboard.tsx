import React from 'react'
import { useTaskContext } from '../context/TaskContext'
import { calculateTaskStats } from '../utils/taskUtils'
import { TaskStatus, TaskPriority, TaskCategory } from '../types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line } from 'recharts'
import './Dashboard.css'

export const Dashboard: React.FC = () => {
  const { state } = useTaskContext()
  const stats = calculateTaskStats(state.tasks)

  const statusData = Object.entries(stats.byStatus).map(([status, count]) => ({
    name: status,
    value: count
  }))

  const priorityData = Object.entries(stats.byPriority).map(([priority, count]) => ({
    name: priority,
    value: count
  }))

  const categoryData = Object.entries(stats.byCategory).map(([category, count]) => ({
    name: category,
    value: count
  }))

  const timeData = [
    { name: 'Estimated', hours: stats.totalEstimatedHours },
    { name: 'Actual', hours: stats.totalActualHours }
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Completion Rate</h3>
          <p className="stat-value">{stats.completionRate.toFixed(1)}%</p>
        </div>
        <div className="stat-card">
          <h3>Total Hours</h3>
          <p className="stat-value">{stats.totalActualHours.toFixed(1)}h</p>
        </div>
        <div className="stat-card">
          <h3>Avg Completion</h3>
          <p className="stat-value">{stats.averageCompletionTime.toFixed(1)}h</p>
        </div>
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Tasks by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Tasks by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h3>Time Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hours" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
